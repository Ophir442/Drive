#include "CLIManager.h"

using namespace std;

CLIManager::CLIManager(map<string, ICommands*> commands) : commands(commands) {
}


vector<string> CLIManager::getCommandAndArgs() {
    vector<string> commandAndArgs;
    string stringCLIInput;
    getline(cin, stringCLIInput); // Read a full line of input from the user

    // throw exception for empty input
    if (stringCLIInput.empty()) {
        throw exception();
    }

    // check if there is a space to separate command and arguments
    if (stringCLIInput.find(' ') == string::npos) {
        // Single word command with no arguments
        commandAndArgs.push_back(stringCLIInput);
    } else {
        string command = stringCLIInput.substr(0, stringCLIInput.find(' ')); // first argument is the filename
        commandAndArgs.push_back(command); // push the command to commandAndArgs
        string arguments = stringCLIInput.substr(stringCLIInput.find(' ') + 1); // rest is the arguments
        commandAndArgs.push_back(arguments); // push the arguments to commandAndArgs
    }
    return commandAndArgs;
}
void CLIManager::displayCommands(map<string, ICommands*> commands) const {
    // for (const string& nameOfCommand : commands) {
    //     cout << nameOfCommand << endl; // Display each command name
    // }
}
void CLIManager::displayOutput(string output) const {
    cout << output ; // Display the output message
}
