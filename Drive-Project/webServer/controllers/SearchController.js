const dataBase = require('../models/DataBase');
const WebClient = require('../models/webClient');
const permissionModel = require('../models/Permission');
const User = require('../models/user');

// Helper function to get owner name by ID
const getOwnerName = (ownerID) => {
    const user = User.findByID(ownerID);
    return user ? user.name : 'Unknown';
};

exports.searchFiles = async (req, res) => { 
    const userID = req.userId;
    const query = req.params.query;
    
    if (!query) {
        return res.status(400).json({ message: 'Missing search query' });
    }

    const resultFiles = [];
    
    try {
        // Iterate over ALL files to find ones the user has access to
        const allFiles = dataBase.getAllFiles();

        for (const file of allFiles) {
            let hasAccess = false;

            // 1. Check if user is the owner
            if (file.ownerID == userID) {
                hasAccess = true;
            } else {
                // 2. Check if user has explicit permission
                const userPerm = permissionModel.getUserPermission(file.FID, userID);
                if (userPerm) {
                    hasAccess = true;
                }
            }

            if (hasAccess) {
                const queryLower = query.toLowerCase();

                // Check filename (case-insensitive)
                if (file.name.toLowerCase().includes(queryLower)) {
                    resultFiles.push(file);
                    continue; // Already found, skip content check
                }

                // Skip content search for directories and binary files (images/PDFs)
                if (file.isDir || (file.mimeType && (file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf'))) {
                    continue;
                }

                // Check file content using WebClient
                try {
                    const fileContentResponse = await WebClient.send('GET ' + file.storageNameOfFile);

                    if (fileContentResponse && fileContentResponse.includes('200')) {
                        const lines = fileContentResponse.split('\n');
                        const content = lines.slice(1).join('\n');

                        // Check if content is base64 (starts with data:)
                        let searchableContent = content;
                        if (content.startsWith('data:')) {
                            // Skip base64 content (images, PDFs)
                            continue;
                        }

                        if (searchableContent.toLowerCase().includes(queryLower)) {
                            if (!resultFiles.some(f => f.FID === file.FID)) {
                                resultFiles.push(file);
                            }
                        }
                    }
                } catch (err) {
                    // Skip files that fail to load
                    console.error('Content search error for file:', file.FID, err.message);
                }
            }
        }
        // return file info including new fields
        const resultFilesInfo = resultFiles
            .filter(file => !file.trashed) // exclude trashed files
            .map(file => ({
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
            }));
        res.status(200).json(resultFilesInfo);
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ message: 'Internal Server Error during search' });
    }
}