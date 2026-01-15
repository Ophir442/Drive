#include "FolderManager.h"
#include <mutex> // for std::unique_lock and std::shared_lock

string encodeFilename(const string& fileName) {
    string result;
    for (unsigned char c : fileName) {
        result += to_string((int)c) + "_"; 
    }
    return result;
}


FolderManager::FolderManager(const filesystem::path& mainStorage, const filesystem::path& folderForLogicalNames)
 : mainStorage(mainStorage), folderForLogicalNames(folderForLogicalNames) {
    if (!filesystem::exists(folderForLogicalNames / LOGICAL_NAMES)) {
        std::ofstream out(folderForLogicalNames / LOGICAL_NAMES);
    }
    ifstream in(folderForLogicalNames / LOGICAL_NAMES);
    if (!in.is_open()) {
        printf("Could not open logical names file\n");
        throw exception();
    }
    string logicalName;
    while (getline(in, logicalName)) {
        if (logicalName.empty()) {
            continue;
        }
        string physicalName = encodeFilename(logicalName);
        logicToPhysicalName.insert({logicalName, physicalName});
    }
}

bool FolderManager::isExists(const string fileName) {
    std::shared_lock<std::shared_mutex> lock(dbMutex); // shared lock because this is a read-only operation
    return logicToPhysicalName.count(fileName) == 1;
}

bool FolderManager::insertFile(const string fileName, const string content, const filesystem::path filePath) {
    std::unique_lock<std::shared_mutex> lock(dbMutex); // unique lock because this is a write operation
    
    // dont call isExists here to avoid deadlock of the mutex
    if (logicToPhysicalName.count(fileName) == 1) { // direct map check since we already own the lock
        return false;
    }
    string physicalName = encodeFilename(fileName);
    logicToPhysicalName.insert({fileName, physicalName});
    filesystem::path fullFilePath = filePath / physicalName;
    ofstream out1(fullFilePath, ios::binary);
    if (!out1.is_open()) {
        return false;
    }
    out1 << content;
    out1.close();
    if (!out1) {         
        return false;
    }
    ofstream out(folderForLogicalNames / LOGICAL_NAMES, std::ios::app);
    if (!out.is_open()) { 
        // if we fail to open the logical names file, we need to cleanup the previously created physical file and the map entry.

        // dont call deleteFile(fileName) here to avoid deadlock of the mutex
        // replace with manual cleanup logic
        error_code ec;
        filesystem::remove(fullFilePath, ec); // manually remove file
        logicToPhysicalName.erase(fileName); // manually remove from map
        // manually remove from logical names file by rewriting the logical names file
        ofstream out_rem(folderForLogicalNames / LOGICAL_NAMES);
            if (!out_rem.is_open()) {
            return false;
        }
        for (const auto& entry : logicToPhysicalName) {
            out_rem << entry.first << '\n';
        }
        return false;
    }
    out << fileName << '\n';
    return true;
}

bool FolderManager::deleteFile(const string fileName) {
    std::unique_lock<std::shared_mutex> lock(dbMutex); // unique lock because this is a write operation

    // dont call isExists(fileName) here to avoid deadlock of the mutex
    if (logicToPhysicalName.count(fileName) == 0) { // direct map check since we already own the lock
        return false;
    }
    string physicalName = logicToPhysicalName[fileName];
    filesystem::path fullPath = mainStorage / physicalName;
    error_code ec;
    filesystem::remove(fullPath, ec);
    if (ec) {
        // error during file deletion
        return false;
    }
    logicToPhysicalName.erase(fileName);
    // Rewrite the logical names file
    ofstream out(folderForLogicalNames / LOGICAL_NAMES);
    if (!out.is_open()) {
        return false;
    }
    for (const auto& entry : logicToPhysicalName) {
        out << entry.first << '\n';
    }
    return true;
}

vector<string> FolderManager::getAllFileNames() {
    std::shared_lock<std::shared_mutex> lock(dbMutex); // shared lock because this is a read-only operation
    vector<string> result;
    for (const auto& entry : logicToPhysicalName) {
        result.push_back(entry.first);
    }
    return result;
}

string FolderManager::getContent(const string fileName) {
    std::shared_lock<std::shared_mutex> lock(dbMutex); // shared lock because this is a read-only operation
    if (!logicToPhysicalName.count(fileName)) {
        printf("File %s does not exist in the database\n", fileName.c_str());
        throw exception();
    }
    // string physicalName = logicToPhysicalName[fileName];
    // cant use previous line since operator[] is not safe for const access
    string physicalName = logicToPhysicalName.at(fileName); // .at() which is const-correct for read-only access
    filesystem::path fullPath = mainStorage / physicalName;
    ifstream in(fullPath, ios::binary);
    if (!in.is_open()) {
        printf("Could not open file %s\n", fullPath.c_str());
        throw exception();
    }
    stringstream buffer;
    buffer << in.rdbuf();
    return buffer.str();
}
