#ifndef COMMAND_WRAPPER_H
#define COMMAND_WRAPPER_H

#include <string>
#include <map>
#include <sstream>
#include <iostream>
#include <functional>
#include <utility>
#include "Icommand.h"

using namespace std;

class CommandWrapper {
public:
    // Status code constants
    static const int STATUS_OK = 200;
    static const int STATUS_CREATED = 201;
    static const int STATUS_NO_CONTENT = 204;
    static const int STATUS_BAD_REQUEST = 400;
    static const int STATUS_NOT_FOUND = 404;
    static const int STATUS_INTERNAL_SERVER_ERROR = 500;

private:
    // Map from status code to output message
    map<int, string> statusMessages;
    
    // Initialize the status messages map
    static map<int, string> initStatusMessages();

public:
    CommandWrapper();
    
    // Execute command and return formatted response
    string executeCommand(ICommands* command, const string& args);
    
    // Format the final output with status code and captured data
    string formatOutput(int statusCode, const string& commandOutput);
};

#endif // COMMAND_WRAPPER_H