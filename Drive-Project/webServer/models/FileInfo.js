const dataBase = require('./DataBase')

class FileInfo {

    constructor(fileID, nameOfFile, storageNameOfFile, ownerOfFileID, isDir = false, parentID = '/', mimeType = null, size = 0) {
        this.FID = fileID;
        this.name = nameOfFile;
        this.ownerID = ownerOfFileID;
        this.isDir = isDir;
        this.parentID = parentID;
        this.storageNameOfFile = storageNameOfFile;
        this.starredBy = []; // Array of userIDs who starred this file
        this.trashed = false; // Whether file is in trash
        this.trashedAt = null; // Timestamp when trashed
        this.lastAccessed = Date.now(); // Track last access time
        this.createdAt = Date.now(); // Track creation time
        this.modifiedAt = Date.now(); // Track last modification time
        this.mimeType = mimeType; // File MIME type (e.g., 'image/png', 'application/pdf')
        this.size = size; // File size in bytes
    }

    updateLastAccessed() {
        this.lastAccessed = Date.now();
    }

    moveToTrash() {
        this.trashed = true;
        this.trashedAt = Date.now();
    }

    restore() {
        this.trashed = false;
        this.trashedAt = null;
    }

    isStarredBy(userID) {
        return this.starredBy.includes(String(userID));
    }

    toggleStar(userID) {
        const uid = String(userID);
        if (this.starredBy.includes(uid)) {
            this.starredBy = this.starredBy.filter(id => id !== uid);
            return false; // unstarred
        } else {
            this.starredBy.push(uid);
            return true; // starred
        }
    }

    static create(nameOfFile, storageNameOfFile, ownerOfFileID, isDir = false, parentID = '/', mimeType = null, size = 0) {
        const fileID = dataBase.generateFID();
        const newFileInfo = new FileInfo(fileID, nameOfFile, storageNameOfFile, ownerOfFileID, isDir, parentID, mimeType, size);
        dataBase.saveInFiles(fileID, newFileInfo);
        return newFileInfo;
    }
    
    static update(fileID, newNameOfFile, newParentID, newSize = null) {
        const fileToUpdate = dataBase.findInFiles(fileID);
        if (fileToUpdate) {
            if (newNameOfFile) {
                fileToUpdate.name = newNameOfFile;
            }
            if (newParentID !== undefined) {
                fileToUpdate.parentID = newParentID;
            }
            if (newSize !== null) {
                fileToUpdate.size = newSize;
            }
            fileToUpdate.modifiedAt = Date.now();
            dataBase.saveInFiles(fileID, fileToUpdate);
            return fileToUpdate;
        }
        return null;
    }
    
    static delete(fileID) {
        return dataBase.deleteFromFiles(fileID);
    }
    
    // static fileByOwnerID(ownerID) {
    //     const files = [];
    //     for (const file of dataBase.getAllFiles()) {
    //         if (file.ownerID === ownerID) {
    //             files.push(file);
    //         }
    //     }
    //     return files;
    // }
}

module.exports = FileInfo;
