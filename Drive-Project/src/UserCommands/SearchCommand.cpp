#include "SearchCommand.h"

// Constructor
SearchCommand::SearchCommand(IdataBaseHandler* dataBase, Icompressor* compressor)
    : dataBase(dataBase), compressor(compressor)
{
}

// Validate arguments
bool SearchCommand::isValid(string substr) const
{
    // Check if substr is not empty
    if (substr.empty()) {
        return false;
    }
    // else, all checks passed
    return true;
}

// Execute the command
pair<int, string> SearchCommand::execute(const string& substr) const
{
    // Validate file content
    if (!isValid(substr)) {
        return {400, ""};          // 400 - bad request
    }
    
    try {
        // Search for files containing the given content
        vector<string> allFiles = dataBase->getAllFileNames();
        string result = "";
        
        for (const string& fileName : allFiles) {
            string fileContent = compressor->decompressFile(dataBase->getContent(fileName));
            // Check if the file content or file name contains the search string
            if (fileContent.find(substr) != string::npos || fileName.find(substr) != string::npos) {
                if (!result.empty()) {
                    result += " ";
                }
                result += fileName;
            }
        }
        
        return {200, result};              // 200 - OK with matching file names
    } catch (...) {
        return {500, ""};              // 500 - Internal Server Error
    }
}
