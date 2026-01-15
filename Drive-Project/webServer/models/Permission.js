const dataBase = require('./DataBase');

class Permission {
    constructor(pid, fileID, userID, role) {
        this.pid = pid;
        this.fileID = fileID;
        this.userID = userID;
        this.role = role; // 'view' or 'edit'
    }

    static create(fileID, userID, role) {
        // Ensure consistent types
        const numericFileID = typeof fileID === 'string' ? parseInt(fileID) : fileID;
        const stringUserID = String(userID);

        // Check if permissions map for the file exists
        let filePerms = dataBase.findInPermissions(numericFileID);
        if (!filePerms) {
            filePerms = new Map();
        }

        // Create a unique PID
        const pid = dataBase.generatePID();

        const newPerm = new Permission(pid, numericFileID, stringUserID, role);

        // Save in DB
        filePerms.set(pid, newPerm);
        dataBase.saveInPermissions(numericFileID, filePerms);

        return newPerm;
    }

    /**
     * Returns all permissions for a specific file as an array
     */
    static getPermissionsByFileID(fileID) {
        const numericFileID = typeof fileID === 'string' ? parseInt(fileID) : fileID;
        const filePerms = dataBase.findInPermissions(numericFileID);
        if (!filePerms) {
            return [];
        }
        return Array.from(filePerms.values());
    }

    /**
    * Returns the permission of a user for a specific file
     */
    static getUserPermission(fileID, userID) {
        // Ensure consistent type for fileID lookup (Maps use strict equality)
        const numericFileID = typeof fileID === 'string' ? parseInt(fileID) : fileID;
        const filePerms = dataBase.findInPermissions(numericFileID);
        if (!filePerms) {
            return null;
        }
        // Compare user IDs as strings for consistent matching
        const searchUserID = String(userID);
        for (const perm of filePerms.values()) {
            if (String(perm.userID) === searchUserID) {
                return perm;
            }
        }
        return null;
    }

    /**
     * Updates the role of an existing permission by permission ID
     */
    static update(fileID, pid, newRole) {
        const numericFileID = typeof fileID === 'string' ? parseInt(fileID) : fileID;
        const filePerms = dataBase.findInPermissions(numericFileID);
        if (!filePerms || !filePerms.has(pid)) {
            return null;
        }
        const permToUpdate = filePerms.get(pid);
        permToUpdate.role = newRole;

        dataBase.saveInPermissions(numericFileID, filePerms);

        return permToUpdate;
    }

    /**
     * Returns a specific permission by permission ID
     */
    static getPermissionByID(fileID, pid) {
        const numericFileID = typeof fileID === 'string' ? parseInt(fileID) : fileID;
        const filePerms = dataBase.findInPermissions(numericFileID);
        if (!filePerms || !filePerms.has(pid)) {
            return null;
        }
        return filePerms.get(pid);
    }

    /**
     * deletes a specific permission
     */
    static delete(fileID, pid) {
        // Convert fileID to ensure consistent type lookup
        const numericFileID = typeof fileID === 'string' ? parseInt(fileID) : fileID;
        const filePerms = dataBase.findInPermissions(numericFileID);
        if (filePerms && filePerms.has(pid)) {
            filePerms.delete(pid);
            dataBase.saveInPermissions(numericFileID, filePerms);
            return true;
        }
        return false;
    }

    /**
     * deletes all permissions
     */
    static deleteByFileID(fileID) {
        const numericFileID = typeof fileID === 'string' ? parseInt(fileID) : fileID;
        return dataBase.deleteFromPermissions(numericFileID);
    }
}

module.exports = Permission;