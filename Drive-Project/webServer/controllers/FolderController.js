const fileInfo = require('../models/FileInfo');
const dataBase = require('../models/DataBase');
const WebClient = require('../models/webClient');
const permissionObject = require('../models/Permission');
const User = require('../models/user');

// Helper functions to encode/decode content (preserves newlines and special chars)
const encodeContent = (content) => Buffer.from(content || '').toString('base64');
const decodeContent = (encoded) => Buffer.from(encoded || '', 'base64').toString('utf8');

// Sanitize filename for storage (remove spaces and special chars that break C++ server parsing)
const sanitizeForStorage = (filename) => {
    return filename
        .replace(/\s+/g, '_')           // Replace spaces with underscores
        .replace(/[^a-zA-Z0-9._-]/g, '') // Remove special characters except . _ -
        .substring(0, 200);              // Limit length
};

// Helper function to get owner name by ID
const getOwnerName = (ownerID) => {
    const user = User.findByID(ownerID);
    return user ? user.name : 'Unknown';
};

exports.getPermissionsByFileID = (req, res) => {
    const fileID = parseInt(req.params.fileID);
    if (dataBase.findInFiles(fileID)) {
        const permissionsOfFile = permissionObject.getPermissionsByFileID(fileID);
        res.status(200).json(permissionsOfFile);
    } else {
        res.status(404).json({ message: 'File not found' });
    }
}

// exports.getUserFiles = (req, res) => {
//     const userID = req.userId;
//     const userFiles = fileInfo.fileByOwnerID(userID);
//     if (!userFiles) {
//         return res.status(404).json({ message: 'User not found or has no files' });
//     }
//     res.status(200).json(userFiles);
// }

exports.createFile = async (req, res) => {
    const { nameOfFile, isDir, content, parentID, mimeType } = req.body;
    const ownerOfFileID = req.userId;

    if (!nameOfFile) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Sanitize filename for storage to avoid issues with spaces/special chars in C++ server
    const sanitizedName = sanitizeForStorage(nameOfFile);
    const storageNameOfFile = `${ownerOfFileID}_${Date.now()}_${sanitizedName}`;

    try {
        // Encode content to Base64 to preserve newlines and special characters
        const encodedContent = encodeContent(content);
        // Calculate size from content
        const size = content ? Buffer.byteLength(content, 'utf8') : 0;

        const sendResponse = await WebClient.send('POST ' + storageNameOfFile + ' ' + encodedContent);

        if (sendResponse && sendResponse.includes('201')) {
            const newFile = fileInfo.create(nameOfFile, storageNameOfFile, ownerOfFileID, isDir, parentID, mimeType, size);
            permissionObject.create(newFile.FID, ownerOfFileID, 'edit');
            // return relevant info including new fields
            res.status(201).json({
                FID: newFile.FID,
                name: newFile.name,
                isDir: newFile.isDir,
                ownerID: newFile.ownerID,
                mimeType: newFile.mimeType,
                size: newFile.size,
                createdAt: newFile.createdAt,
            });
        } else {
            res.status(500).json({ message: 'Error storing file in WebClient' });
        }
    } catch (error) {
        console.error("WebClient Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.updateFile = (req, res) => {
    const fileID = parseInt(req.params.id);
    const userID = req.userId;
    
    const userPermission = permissionObject.getUserPermission(fileID, userID);
    
    if (!userPermission || userPermission.role !== 'edit') {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this file' });
    }

    const { newNameOfFile, newContent, newParentID } = req.body;
    const fileToUpdate = dataBase.findInFiles(fileID);
    if (!fileToUpdate) {
        return res.status(404).json({ message: 'File not found' });
    }

    // Calculate new size if content is being updated
    const newSize = newContent !== undefined ? Buffer.byteLength(newContent, 'utf8') : null;

    // Update fileInfo
    const updatedFile = fileInfo.update(fileID, newNameOfFile, newParentID, newSize);
    if (!updatedFile) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Update file content if provided (check for undefined, not falsy, to allow empty content)
    if (newContent !== undefined) {
        // Encode content to Base64 to preserve newlines and special characters
        const encodedContent = encodeContent(newContent);
        // delete the old file, and create a new one with the same everything except content
        WebClient.send('DELETE ' + updatedFile.storageNameOfFile)
        .then((deleteResponse) => {
            if (deleteResponse && deleteResponse.includes('204')) {
                return WebClient.send('POST ' + updatedFile.storageNameOfFile + ' ' + encodedContent);
            } else {
                throw new Error('Delete failed');
            }
        })
        .then((postResponse) => {
            if (postResponse && postResponse.includes('201')) {
                res.status(200).json({
                    FID: updatedFile.FID,
                    name: updatedFile.name,
                    isDir: updatedFile.isDir,
                    ownerID: updatedFile.ownerID,
                    size: updatedFile.size,
                    modifiedAt: updatedFile.modifiedAt,
                });
            } else {
                throw new Error('Post failed');
            }
        })
        .catch((error) => {
            console.error("WebClient Error:", error);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    } else {
        // No content update, just respond with updated fileInfo
        res.status(200).json({
            FID: updatedFile.FID,
            name: updatedFile.name,
            isDir: updatedFile.isDir,
            ownerID: updatedFile.ownerID,
            modifiedAt: updatedFile.modifiedAt,
        });
    }
}

// Move file to trash (soft delete)
exports.deleteFile = async (req, res) => {
    const fileID = parseInt(req.params.id);
    const userID = req.userId;

    const fileToTrash = dataBase.findInFiles(fileID);
    if (!fileToTrash) {
        return res.status(404).json({ message: 'File not found' });
    }

    const userPermission = permissionObject.getUserPermission(fileID, userID);
    if (!userPermission || userPermission.role !== 'edit') {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this file' });
    }

    // Move to trash instead of permanent delete
    fileToTrash.moveToTrash();
    dataBase.saveInFiles(fileID, fileToTrash);
    res.status(200).json({ message: 'Moved to trash' });
}

// Get trashed files
exports.getTrashedFiles = (req, res) => {
    const userID = req.userId;
    const allFiles = dataBase.getAllFiles();

    const trashedFiles = allFiles.filter(file => {
        const userPermission = permissionObject.getUserPermission(file.FID, userID);
        return file.trashed && userPermission && userPermission.role === 'edit';
    });

    const responseData = trashedFiles.map(file => ({
        FID: file.FID,
        name: file.name,
        isDir: file.isDir,
        ownerID: file.ownerID,
        parentID: file.parentID || '',
        trashedAt: file.trashedAt,
    }));

    res.status(200).json(responseData);
};

// Restore file from trash
exports.restoreFile = (req, res) => {
    const fileID = parseInt(req.params.id);
    const userID = req.userId;

    const file = dataBase.findInFiles(fileID);
    if (!file || !file.trashed) {
        return res.status(404).json({ message: 'File not found in trash' });
    }

    const userPermission = permissionObject.getUserPermission(fileID, userID);
    if (!userPermission || userPermission.role !== 'edit') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    file.restore();
    dataBase.saveInFiles(fileID, file);
    res.status(200).json({ message: 'File restored' });
};

// Permanently delete file
exports.permanentlyDeleteFile = async (req, res) => {
    const fileID = parseInt(req.params.id);
    const userID = req.userId;

    const fileToDelete = dataBase.findInFiles(fileID);
    if (!fileToDelete) {
        return res.status(404).json({ message: 'File not found' });
    }

    const userPermission = permissionObject.getUserPermission(fileID, userID);
    if (!userPermission || userPermission.role !== 'edit') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const deleteResponse = await WebClient.send('DELETE ' + fileToDelete.storageNameOfFile);

        if (deleteResponse && deleteResponse.includes('204')) {
            permissionObject.deleteByFileID(fileID);
            fileInfo.delete(fileID);
            res.status(204).json({ message: 'Permanently deleted' });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } catch (error) {
        console.error("WebClient Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Empty trash (delete all trashed files for user)
exports.emptyTrash = async (req, res) => {
    const userID = req.userId;
    const allFiles = dataBase.getAllFiles();

    const trashedFiles = allFiles.filter(file => {
        const userPermission = permissionObject.getUserPermission(file.FID, userID);
        return file.trashed && userPermission && userPermission.role === 'edit';
    });

    try {
        for (const file of trashedFiles) {
            await WebClient.send('DELETE ' + file.storageNameOfFile);
            permissionObject.deleteByFileID(file.FID);
            fileInfo.delete(file.FID);
        }
        res.status(200).json({ message: 'Trash emptied', count: trashedFiles.length });
    } catch (error) {
        console.error("WebClient Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getFileContentByID = async (req, res) => {
    const fileID = parseInt(req.params.id);
    const userID = req.userId;

    const userPermission = permissionObject.getUserPermission(fileID, userID);
    if (!userPermission) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to view this file' });
    }

    const file = dataBase.findInFiles(fileID);
    if (!file) {
        return res.status(404).json({ message: 'File not found' });
    }

    // Update last accessed time
    file.updateLastAccessed();
    dataBase.saveInFiles(fileID, file);

    try {
        const fileContentResponse = await WebClient.send('GET ' + file.storageNameOfFile);

        if (fileContentResponse && fileContentResponse.includes("200")) {
            // Remove the status line from the response (handle \n, \r\n, or \r line endings)
            // Split by any line break and rejoin content lines
            const lines = fileContentResponse.split(/\r?\n|\r/);
            const encodedContent = lines.slice(1).join('');
            // Decode from Base64 to restore original content with newlines
            const content = decodeContent(encodedContent);
            res.status(200).json({ content });
        } else {
            console.error("WebClient response error:", fileContentResponse);
            res.status(500).json({ message: 'Error retrieving file content from WebClient' });
        }
    } catch (error) {
        console.error("WebClient Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getRecentFiles = (req, res) => {
    const userID = req.userId;
    const allFiles = dataBase.getAllFiles();

    // Get files user has access to (not trashed, not folders)
    const accessibleFiles = allFiles.filter(file => {
        const userPermission = permissionObject.getUserPermission(file.FID, userID);
        return userPermission && !file.trashed && !file.isDir;
    });

    // Sort by lastAccessed (most recent first) and take top 20
    const recentFiles = accessibleFiles
        .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))
        .slice(0, 20);

    const responseData = recentFiles.map(file => {
        const userPermission = permissionObject.getUserPermission(file.FID, userID);
        return {
            FID: file.FID,
            name: file.name,
            isDir: file.isDir,
            ownerID: file.ownerID,
            ownerName: getOwnerName(file.ownerID),
            parentID: file.parentID || '',
            starred: file.isStarredBy ? file.isStarredBy(userID) : false,
            lastAccessed: file.lastAccessed,
            mimeType: file.mimeType,
            size: file.size || 0,
            createdAt: file.createdAt,
            modifiedAt: file.modifiedAt,
            role: userPermission ? userPermission.role : null,
        };
    });

    res.status(200).json(responseData);
}

exports.getAllFiles = (req, res) => {
    const userID = req.userId;
    const allFiles = dataBase.getAllFiles();
    // only return files that the user has permission to view (exclude trashed)
    const permittedFiles = allFiles.filter(file => {
        const userPermission = permissionObject.getUserPermission(file.FID, userID);
        return userPermission !== null && !file.trashed;
    });
    // return file info including new fields and user's permission role
    const permittedFilesInfo = permittedFiles.map(file => {
        const userPermission = permissionObject.getUserPermission(file.FID, userID);
        return {
            FID: file.FID,
            name: file.name,
            isDir: file.isDir,
            ownerID: file.ownerID,
            ownerName: getOwnerName(file.ownerID),
            parentID: file.parentID || '',
            starred: file.isStarredBy ? file.isStarredBy(userID) : false,
            mimeType: file.mimeType,
            size: file.size || 0,
            createdAt: file.createdAt,
            modifiedAt: file.modifiedAt,
            lastAccessed: file.lastAccessed,
            role: userPermission ? userPermission.role : null,
        };
    });
    res.status(200).json(permittedFilesInfo);
}

exports.getSharedFiles = (req, res) => {
    const userID = req.userId;
    const allFiles = dataBase.getAllFiles();

    const sharedFiles = allFiles.filter(file => {
        const isNotMine = String(file.ownerID) !== String(userID);
        const userPermission = permissionObject.getUserPermission(file.FID, userID);

        return isNotMine && userPermission && !file.trashed;
    });

    const responseData = sharedFiles.map(file => {
        const userPermission = permissionObject.getUserPermission(file.FID, userID);
        return {
            FID: file.FID,
            name: file.name,
            isDir: file.isDir,
            ownerID: file.ownerID,
            ownerName: getOwnerName(file.ownerID),
            parentID: file.parentID || '',
            starred: file.isStarredBy ? file.isStarredBy(userID) : false,
            mimeType: file.mimeType,
            size: file.size || 0,
            createdAt: file.createdAt,
            modifiedAt: file.modifiedAt,
            lastAccessed: file.lastAccessed,
            role: userPermission ? userPermission.role : null,
        };
    });

    res.status(200).json(responseData);
};

exports.toggleStar = (req, res) => {
    const fileID = parseInt(req.params.id);
    const userID = req.userId;

    const file = dataBase.findInFiles(fileID);
    if (!file) {
        return res.status(404).json({ message: 'File not found' });
    }

    // Check if user has permission to view this file
    const userPermission = permissionObject.getUserPermission(fileID, userID);
    if (!userPermission) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const isNowStarred = file.toggleStar(userID);
    dataBase.saveInFiles(fileID, file);

    res.status(200).json({ starred: isNowStarred });
};

exports.getStarredFiles = (req, res) => {
    const userID = req.userId;
    const allFiles = dataBase.getAllFiles();

    const starredFiles = allFiles.filter(file => {
        const userPermission = permissionObject.getUserPermission(file.FID, userID);
        return userPermission && file.isStarredBy && file.isStarredBy(userID) && !file.trashed;
    });

    const responseData = starredFiles.map(file => {
        const userPermission = permissionObject.getUserPermission(file.FID, userID);
        return {
            FID: file.FID,
            name: file.name,
            isDir: file.isDir,
            ownerID: file.ownerID,
            ownerName: getOwnerName(file.ownerID),
            parentID: file.parentID || '',
            starred: true,
            mimeType: file.mimeType,
            size: file.size || 0,
            createdAt: file.createdAt,
            modifiedAt: file.modifiedAt,
            lastAccessed: file.lastAccessed,
            role: userPermission ? userPermission.role : null,
        };
    });

    res.status(200).json(responseData);
};

// Remove user's own access to a shared file
exports.removeAccess = (req, res) => {
    const fileID = parseInt(req.params.id);
    const userID = req.userId;

    const file = dataBase.findInFiles(fileID);
    if (!file) {
        return res.status(404).json({ message: 'File not found' });
    }

    // Can't remove access if you're the owner
    if (String(file.ownerID) === String(userID)) {
        return res.status(400).json({ message: 'Cannot remove access from your own file' });
    }

    // Find and delete user's permission
    const userPermission = permissionObject.getUserPermission(fileID, userID);
    if (!userPermission) {
        return res.status(404).json({ message: 'No access to remove' });
    }

    permissionObject.delete(fileID, userPermission.pid);
    res.status(200).json({ message: 'Access removed' });
};