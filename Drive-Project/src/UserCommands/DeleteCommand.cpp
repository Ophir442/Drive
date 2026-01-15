#include "DeleteCommand.h"
#include <iostream>
#include <stdexcept>

// Constructor
DeleteCommand::DeleteCommand(IdataBaseHandler* dataBase) 
    : dataBase(dataBase)
{
}

// Validate file name
bool DeleteCommand::isValid(string fileName) const
{
    if (fileName.empty()) {
        return false;
    }
    if (fileName.find('\0') != string::npos) {
        return false;
    }
    if (fileName.find(' ') != string::npos || fileName.find('\t') != string::npos || fileName.find('\n') != string::npos) {
        return false;
    }
    return true;
}

// Execute the command
pair<int, string> DeleteCommand::execute(const string& fileName) const
{
    if (!isValid(fileName)) {
        return {400, ""};      // 400 - bad request
    }
    
    if (!dataBase->isExists(fileName)) {
        return {404, ""};      // 404 - file not found
    }
    
    bool success = dataBase->deleteFile(fileName);
    if (!success) {
        return {500, ""}; // 500 - Internal Server Error
    }

    return {204, ""}; // 204 - No Content (success, no output)
}