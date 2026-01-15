class DataBase {
  
  constructor() {
    this.UID_counter = 0;
    this.FID_counter = 0;
    this.PID_counter = 0;
    this.users = new Map(); // Map of userID to user object
    this.files = new Map(); // Map of fileID to fileInfo object
    this.permissions = new Map(); // Map of permissionID to permission object
    this.filePermissionsMap = new Map(); // Map of fileID to another map, which maps permissionID to permission object
  }

  generateFID() {
    return ++this.FID_counter;
  }

  generatePID() {
    return ++this.PID_counter;
  }

  generateUID() {
    return ++this.UID_counter;
  }
  
  findInPermissions(fileID) {
    return this.filePermissionsMap.get(fileID) || null;
  }
  
  findInFiles(fileID) {
    return this.files.get(fileID) || null;
  }
  
  saveInFiles(fileID, fileInfo) {
    this.files.set(fileID, fileInfo);
  }

  deleteFromFiles(fileID) {
    if (this.files.has(fileID)) {
      this.files.delete(fileID);
      return true;
    }
    return false;
  }

  saveInPermissions(fileID, permissionsMap) {  
    this.filePermissionsMap.set(fileID, permissionsMap);
  }

  deleteFromPermissions(fileID) {
    if (this.filePermissionsMap.has(fileID)) {
      this.filePermissionsMap.delete(fileID);
      return true;
    }
    return false;
  }

  getAllFiles() {
    return Array.from(this.files.values());
  }
}

module.exports = new DataBase();