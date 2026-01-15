const express = require('express');
const router = express.Router();
const authorizer = require('./authorizer');

// import controllers
const FolderController = require('../controllers/FolderController');
const usersController = require('../controllers/userController');
const permissionsController = require('../controllers/PermissionController');
const searchController = require('../controllers/SearchController');

/*
 * public routes - no authorization needed
*/

// --- Users Routes ---
// register
router.post('/users', usersController.register);
// login (check password) - return user id if exists
router.post('/tokens', usersController.login);

/*
 * private routes - authorization needed
*/
// use authorizater to check if the user is authorized to access the routes
router.use(authorizer);
// if we got here, we are authorized to do the specific action we want

// get user info by ID
router.get('/users/:id', usersController.getUserInfo);


// --- Files Routes ---
// get all files or create a new file
router.route('/files')
    .get(FolderController.getAllFiles)
    .post(FolderController.createFile);

router.get('/files/shared', FolderController.getSharedFiles);
router.get('/files/starred', FolderController.getStarredFiles);
router.get('/files/recent', FolderController.getRecentFiles);
router.get('/files/trash', FolderController.getTrashedFiles);
router.delete('/files/trash', FolderController.emptyTrash);
router.post('/files/:id/star', FolderController.toggleStar);
router.post('/files/:id/restore', FolderController.restoreFile);
router.delete('/files/:id/permanent', FolderController.permanentlyDeleteFile);
router.delete('/files/:id/access', FolderController.removeAccess);

// actions on specific file by ID
router.route('/files/:id')
    .get(FolderController.getFileContentByID)
    .patch(FolderController.updateFile)
    .delete(FolderController.deleteFile);

// --- Permissions Routes ---
// permissions management
router.route('/files/:id/permissions')
    .get(permissionsController.getPermissions)
    .post(permissionsController.createPermission);

// actions on specific permission by pid
router.route('/files/:id/permissions/:pid')
    .patch(permissionsController.updatePermission)
    .delete(permissionsController.deletePermission);

// --- Search Routes ---
router.get('/search/:query', searchController.searchFiles);

module.exports = router;