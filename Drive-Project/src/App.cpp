#include "App.h"


App::App(IdataBaseHandler* dbHandler, Ioutput* outputHandler, IInput* inputHandler)
: database(dbHandler), output(outputHandler), input(inputHandler)
{
    // Initialize compressors map
    compressors["RLE"] = new RLEcompressor();

    // Initialize commands map
    commands["post"] = new AddCommand(database, compressors["RLE"]);
    commands["get"] = new GetCommand(database, compressors["RLE"]);
    commands["search"] = new SearchCommand(database, compressors["RLE"]);
    commands["delete"] = new DeleteCommand(database);

    // Initialize command wrapper
    commandWrapper = new CommandWrapper();
}


void App::run() {
    // Implementation of the loop shown in the middle of the whiteboard UML
    while (true) {
        // Display menu
        // output->displayCommands(commands);

        // Listen for input. Assuming single input listener for simplicity
        // later we need to change it properly to support multiple listeners
        vector<string> commandAndArgs;
        try {
            commandAndArgs = input->getCommandAndArgs(); // get command and its arguments
            }
        catch (...) { 
            // Catching exception from input (e.g. connection closed or bad input)
            try {
                // Try to send error message
                output->displayOutput(commandWrapper->formatOutput(CommandWrapper::STATUS_BAD_REQUEST, ""));
            } catch (...) {
                // If sending fails, the connection is likely closed. Stop the loop.
                break;
            }
            continue;
        }
        // first element is the command name. not case sensitive - convert to lower case
        string commandName = commandAndArgs[0];
        std::transform(commandName.begin(), commandName.end(), commandName.begin(), [](unsigned char c){ return std::tolower(c); });
        
        if (commandAndArgs.size() <= 1) {
            output->displayOutput(commandWrapper->formatOutput(CommandWrapper::STATUS_BAD_REQUEST, ""));
            continue; // invalid command entered, go back to start of loop
        }
        string args = commandAndArgs[1];  // extract arguments
        // try to find the command in the map and execute it
        string response;
        if (commands.find(commandName) != commands.end()) {
            response = commandWrapper->executeCommand(commands[commandName], args);
        } else {
            // Got a non-existing command. Bad request - 400
            response = commandWrapper->formatOutput(CommandWrapper::STATUS_BAD_REQUEST, "");
        }
        // send the output to the client
        output->displayOutput(response);
    }
}

App::~App() {
    // Clean up dynamically allocated commands
    for (auto& pair : commands) {
        delete pair.second;
    }
    // Clean up dynamically allocated compressors
    for (auto& pair : compressors) {
        delete pair.second;
    }
    // Clean up command wrapper
    delete commandWrapper;
}

// int main() {
//     // acces environment variables and pass them to FolderManager, AddCommand constructor
//     filesystem::path mainStorage = getenv("DRIVE_STORAGE");
//     filesystem::path folderForLogicalNames = getenv("DRIVE_FILE_NAMES");

//     // init database handler
//     IdataBaseHandler* dbHandler = new FolderManager(mainStorage, folderForLogicalNames);
//     // init compressors map
//     map<string, Icompressor*> compressors;
//     compressors["RLE"] = new RLEcompressor();
//     // Initialize commands map
//     map<string, ICommands*> commands;
//     commands["add"] = new AddCommand(dbHandler, compressors["RLE"]);
//     commands["get"] = new GetCommand(dbHandler, compressors["RLE"]);
//     commands["search"] = new SearchCommand(dbHandler, compressors["RLE"]);
//     commands["delete"] = new DeleteCommand(dbHandler);

//     Ioutput* output = new CLIManager(commands);
//     App app = App(dbHandler, output);
//     app.run();
//     return 0;
// }
