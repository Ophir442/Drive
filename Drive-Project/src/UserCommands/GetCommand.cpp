#include "GetCommand.h"

// Constructor
GetCommand::GetCommand(IdataBaseHandler* dataBase, Icompressor* compressor) 
    : dataBase(dataBase), compressor(compressor)
{
}

// Validate file name
bool GetCommand::isValid(string fileName) const
{
    // Check if the file name is not empty
    if (fileName.empty()) {
        return false;
    }
    // Check if there are any spaces in fileName
    if (fileName.find(' ') != string::npos) {
        return false;
    }
    // else, all checks passed
    return true;
}

// Execute the command
pair<int, string> GetCommand::execute(const string& fileName) const
{
    // Validate arguments
    if (!isValid(fileName)) {
        return {400, ""};      // 400 - bad request
    }
    
    // Check if file exists in database
    if (!dataBase->isExists(fileName)) {
        return {404, ""};      // 404 - file not found
    }
    
    try {
        // Retrieve file content from database
        string fileContent = dataBase->getContent(fileName);
        // Decompress file content before returning it
        string decompressedContent = compressor->decompressFile(fileContent);
        return {200, decompressedContent};      // 200 - OK with content
    } catch (...) {
        return {500, ""};      // 500 - Internal Server Error
    }
}