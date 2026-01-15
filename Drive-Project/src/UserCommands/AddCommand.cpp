#include "AddCommand.h"

#include "IdataBaseHandler.h"
#include "Icompressor.h"

// Constructor
AddCommand::AddCommand(IdataBaseHandler* dataBase, Icompressor* compressor) 
    : dataBase(dataBase), compressor(compressor)
{
}

bool AddCommand::isValid(string fileName, string content) const
{
    // Check if the file name is not empty
    if (fileName.empty()) {
        return false;
    }

    // Check if the file name contains null characters
    if (fileName.find('\0') != string::npos) {
        return false;
    }

    // Check if there are spaces in the file name
    if (fileName.find(' ') != string::npos || fileName.find('\t') != string::npos || fileName.find('\n') != string::npos) {
        return false;
    }

    // else, all checks passed
    return true;
}

pair<int, string> AddCommand::execute(const string& args) const
{   
    // check if there is a space to separate filename and content
    if (args.find(' ') == string::npos) {
        return {400, ""};      // 400 - bad request
    }

    // Extract arguments
    string filename = args.substr(0, args.find(' ')); // first word is the filename
    string content = args.substr(args.find(' ') + 1); // rest is the content

    // validate arguments
    if (!isValid(filename, content)) {
        return {400, ""};      // 400 - bad request
    }
    
    // Check if the file name already exists in the database
    if (dataBase->isExists(filename)) {
        return {404, ""};      // 404 - file already exists
    }

    // Compress the content before adding to the database
    string compressedContent = compressor->compressFile(content);

    // get path to storage directory from the environment variable
    filesystem::path storagePath = getenv("DRIVE_STORAGE");

    // Add file to database
    bool success = dataBase->insertFile(filename, compressedContent, storagePath);
    if (!success) {
        return {500, ""};      // 500 - internal server error
    }

    return {201, ""};          // 201 - Created (no output)
}