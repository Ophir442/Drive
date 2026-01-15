#ifndef APP_H
#define APP_H

#include <map>
#include <algorithm> // for std::transform
#include <cctype>    // for std::tolower
#include <string>    // for std::string
#include <vector>
#include <cstdlib> // for getenv
#include <iostream>

#include "CLIManager.h"
#include "AddCommand.h"
#include "GetCommand.h"
#include "SearchCommand.h"
#include "DeleteCommand.h"
#include "RLEcompressor.h"
#include "FolderManager.h"
#include "CommandWrapper.h"
#include "IRunnable.h"

using namespace std;

class App : public IRunnable {
private:
    // a map of all possible commands
    map<string, ICommands*> commands; 

    // a map of all compressors
    map<string, Icompressor*> compressors;
    // input handler
    IInput* input;
    // output handler
    Ioutput* output; 
    // Data Base handler
    IdataBaseHandler* database;

    // command wrapper to parse and execute commands
    CommandWrapper* commandWrapper;

public:
    // Constructor to initialize maps/listeners
    App(IdataBaseHandler* dbHandler, Ioutput* output, IInput* inputHandler);
    // Destructor
    ~App();
    // because of the rule of 5
    App(const App&) = delete;
    App& operator=(const App&) = delete;
    App(App&&) = delete;
    App& operator=(App&&) = delete;
    /*
    * the run method will start the app loop. it will listen for input from the listeners,
    * execute the corresponding command, and send the output to the output handler.
    * the app will run indefinitely.
    * @return void - no return value.
    */
    void run() override;
};

#endif // APP_H