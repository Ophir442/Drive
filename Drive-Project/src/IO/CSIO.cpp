#include "CSIO.h"

CSIO::CSIO(int clientSocket, CommandWrapper* commandWrapper) 
: clientSocket(clientSocket), commandWrapper(commandWrapper) {
}

vector<string> CSIO::getCommandAndArgs() {
    string receivedData;
    while (true) {
        char buffer[4096];
        int bytesReceived = ::recv(clientSocket, buffer, sizeof(buffer), 0);
        if (bytesReceived == -1) {
            throw exception(); // Failed to receive data from client
        } else if (bytesReceived == 0) {
            throw exception(); // Connection closed by client
        }
        receivedData.append(buffer, bytesReceived);
        // Check if we have received a full command (ending with newline)
        if (!receivedData.empty() && receivedData.back() == '\n') {
            receivedData.pop_back(); // Remove the newline character
            break;
        }
    }
    // Split the received data into command and arguments
    vector<string> commandAndArgs;
    // check if there is a space to separate command and arguments
    if (receivedData.find(' ') == string::npos) {
        // bad request - no arguments provided
        // Don't send response here - App::run() will handle it after catching the exception
        throw exception();
    }
    
    string command = receivedData.substr(0, receivedData.find(' ')); // first argument is the filename
    commandAndArgs.push_back(command); // push the command to commandAndArgs
    string arguments = receivedData.substr(receivedData.find(' ') + 1); // rest is the arguments
    commandAndArgs.push_back(arguments); // push the arguments to commandAndArgs
    return commandAndArgs;
}

void CSIO::displayOutput(string output) const {
    // send the output to the client. first the length of the output, then the output itself
    string length = to_string(output.size());
    while (length.length() < 8) {
        length += " "; // pad with spaces to make it 8 bytes
    }
    // send length
    int sentLen = ::send(clientSocket, length.c_str(), 8, 0);
    if (sentLen == -1) throw exception();
    
    // send Actual Message
    int totalSent = 0;
    while (totalSent < output.length()) {
        int sent = ::send(clientSocket, output.c_str() + totalSent, output.length() - totalSent, 0);
        if (sent == -1) throw exception();
        totalSent += sent;
    }
}

CSIO::~CSIO() {
    close(clientSocket);
}