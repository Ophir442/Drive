#ifndef IdataBaseHandler_h
#define IdataBaseHandler_h

#include <string>
#include <vector>
#include <map>
#include <filesystem>
#include <iostream>

using namespace std;

class IdataBaseHandler {
public:
    // Virtual destructor to ensure proper cleanup of derived classes
    virtual ~IdataBaseHandler() = default;

    // Check if a file exists in the database
    virtual bool isExists(const string fileName) = 0;

    // Insert a file into the database
    virtual bool insertFile(const string fileName, const string content, const filesystem::path filePath) = 0; // return true if inserted, false otherwise

    // get all file names in the database
    virtual vector<string> getAllFileNames() = 0;

    // get file content (compressed) from the database
    virtual string getContent(const string fileName) = 0;

    // delete a file from the database
    virtual bool deleteFile(const string fileName) = 0; // return true if deleted, false otherwise
};

#endif // IdataBaseHandler_h
