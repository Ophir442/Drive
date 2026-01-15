#include "CommandWrapper.h"

// Define the static map
map<int, string> statusMessages;

// Define the static constants
const int CommandWrapper::STATUS_OK;
const int CommandWrapper::STATUS_CREATED;
const int CommandWrapper::STATUS_NO_CONTENT;
const int CommandWrapper::STATUS_BAD_REQUEST;
const int CommandWrapper::STATUS_NOT_FOUND;
const int CommandWrapper::STATUS_INTERNAL_SERVER_ERROR;


map<int, string> CommandWrapper::initStatusMessages() {
    map<int, string> messages;
    messages[STATUS_OK] = "200 Ok";
    messages[STATUS_CREATED] = "201 Created";
    messages[STATUS_NO_CONTENT] = "204 No Content";
    messages[STATUS_BAD_REQUEST] = "400 Bad Request";
    messages[STATUS_NOT_FOUND] = "404 Not Found";
    messages[STATUS_INTERNAL_SERVER_ERROR] = "500 Internal Server Error";
    return messages;
}

CommandWrapper::CommandWrapper() {
    statusMessages = CommandWrapper::initStatusMessages();
}

string CommandWrapper::executeCommand(ICommands* command, const string& args) {
    if (command == nullptr) {
        return formatOutput(STATUS_BAD_REQUEST, "");
    }
    
    // Execute command - returns pair<statusCode, output>
    pair<int, string> result = command->execute(args);
    
    return formatOutput(result. first, result. second);
}

string CommandWrapper::formatOutput(int statusCode, const string& commandOutput) {
    string output = statusMessages[statusCode];
    
    // For successful operations with output data (200 Ok), append the data after two newlines
    if (statusCode == STATUS_OK) {
        output += "\n\n" + commandOutput;
    }
    
    // Add newline at the end (as per requirement - all output ends with newline)
    if (output.empty() || output.back() != '\n') {
        output += "\n";
    }
    
    return output;
}