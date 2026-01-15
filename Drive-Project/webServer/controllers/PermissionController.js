const dataBase = require('../models/DataBase');
const permissionModel = require('../models/Permission');
const User = require('../models/user');

// Rerturns all permissions for a specific file
exports.getPermissions = (req, res) => {
    const fileID = parseInt(req.params.id); // File ID from URL parameter

    if (dataBase.findInFiles(fileID)) {
        const permissionsOfFile = permissionModel.getPermissionsByFileID(fileID);
        res.status(200).json(permissionsOfFile);
    } else {
        res.status(404).json({ message: 'Not Found' });
    }
}

// Updates the role of an existing permission
exports.updatePermission = (req, res) => { 
    const fileID = parseInt(req.params.id);
    const pid = parseInt(req.params.pid);
    const userID = req.userId;
    const { role } = req.body;

    // Validate role
    if (!role || (role !== 'view' && role !== 'edit')) {
        return res.status(400).json({ message: 'Bad Request' });
    }

    // Check if file exists
    if (!dataBase.findInFiles(fileID)) {
        return res.status(404).json({ message: 'Not Found' });
    }

    // only owner can update permissions
    const file = dataBase.findInFiles(fileID);
    if (String(file.ownerID) !== String(userID)) {
        return res.status(403).json({ message: 'Access Denied' });
    }

    // Check if permission exists
    const filePerms = dataBase.findInPermissions(fileID);
    if (!filePerms || !filePerms.has(pid)) {
        return res.status(404).json({ message: 'Not Found' });
    }

    const updatedPerm = permissionModel.update(fileID, pid, role);
    if (updatedPerm) {
        res.status(200).json(updatedPerm);
    } else {
        res.status(404).json({ message: 'Not Found' });
    }
}

exports.createPermission = (req, res) => {
    // get fileID , userID and role from request
    const fileID = parseInt(req.params.id);
    const userID = req.userId;
    // Support both formats: { email, privilege } from frontend OR { PuserID, role }
    let { PuserID, role, email, privilege } = req.body;

    // If email is provided, look up the user ID
    if (email && !PuserID) {
        const targetUser = User.findByGmail(email);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Find the user ID from the database
        for (const [id, user] of dataBase.users.entries()) {
            if (user.gmail === email) {
                PuserID = String(id); // Ensure consistent string type for user ID
                break;
            }
        }
    }

    // If privilege is provided, convert to role (case-insensitive)
    if (privilege && !role) {
        role = privilege.toLowerCase();
    }

    // validate input
    if (!fileID || !userID || !PuserID || !role) {
        return res.status(400).json({ message: 'Bad Request' });
    }

    if (role !== 'view' && role !== 'edit') {
        return res.status(400).json({ message: 'Bad Request' });
    }

    if (!dataBase.findInFiles(fileID)) {
        return res.status(404).json({ message: 'Not Found' });
    }

    // only owner can create permissions
    const file = dataBase.findInFiles(fileID);
    if (String(file.ownerID) !== String(userID)) {
        return res.status(403).json({ message: 'Access Denied' });
    }

    // check for existing permission - update if exists
    const existingPerm = permissionModel.getUserPermission(fileID, PuserID);
    if (existingPerm) {
        // Update existing permission instead of returning conflict
        const updatedPerm = permissionModel.update(fileID, existingPerm.pid, role);
        if (updatedPerm) {
            return res.status(200).json(updatedPerm);
        }
        return res.status(500).json({ message: 'Failed to update permission' });
    }

    try {
        const newPermission = permissionModel.create(fileID, PuserID, role);
        res.status(201).json(newPermission);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Deletes a specific permission
exports.deletePermission = (req, res) => {
    const fileID = parseInt(req.params.id);
    const pid = parseInt(req.params.pid);
    const userID = req.userId;

    // check if file exists
    if (!dataBase.findInFiles(fileID)) {
        return res.status(404).json({ message: 'Not Found' });
    }
    // check if permission exists
    if (!permissionModel.getPermissionByID(fileID, pid)) {
        return res.status(404).json({ message: 'Not Found' });
    }

    // only owner can delete permissions
    const file = dataBase.findInFiles(fileID);
    if (String(file.ownerID) !== String(userID)) {
        return res.status(403).json({ message: 'Access Denied' });
    }

    // delete permission
    const isDeleted = permissionModel.delete(fileID, pid);
    if (isDeleted) {
        res.status(204).json({ message: 'No Content' });
    } else {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}