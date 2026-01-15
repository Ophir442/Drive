#ifndef FOLDERMANAGER_H
#define FOLDERMANAGER_H

#define LOGICAL_NAMES "logical_names.txt"

#include "IdataBaseHandler.h"
#include <filesystem>
#include <map>
#include <fstream>
#include <shared_mutex> // for reader-writer lock

using namespace std;

class FolderManager: public IdataBaseHandler {

private:
    mutable std::shared_mutex dbMutex; // mutex to protect access
        
    map<string, string> logicToPhysicalName; 
    
    filesystem::path mainStorage;

    filesystem::path folderForLogicalNames;

public: 

    // Constructor
    FolderManager(const filesystem::path& mainStorage, const filesystem::path& folderForLogicalNames);
        
    // Check if a file exists in the database
    bool isExists(const string fileName) override;

    // Insert a file into the database
    bool insertFile(const string fileName, const string content, const filesystem::path filePath) override; // return true if inserted, false otherwise

    // get all file names in the database
    vector<string> getAllFileNames() override;

    // get file content (compressed) from the database
    string getContent(const string fileName) override;

    // delete a file from the database
    bool deleteFile(const string fileName) override;
};

#endif
