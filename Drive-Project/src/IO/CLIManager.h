#ifndef CLIMANAGER_H
#define CLIMANAGER_H
#include "Iinput.h"
#include "Ioutput.h"
#include "../UserCommands/Icommand.h"
#include <map>
#include <string>
#include <vector>
#include <sstream>
#include <iostream>

using namespace std;

class CLIManager : public IInput, public Ioutput {

private:
    map<string, ICommands*> commands; // Map of command names to command objects
public:
    // Constructor
    CLIManager(map<string, ICommands*> commands);
    
    // Starts the CLI manager to process user commands.
    void run();
    
    // Implementing IInput interface
    vector<string> getCommandAndArgs() override;
    
    // Implementing Ioutput interface
    void displayCommands(map<string, ICommands*> commands) const override;
    
    // Implementing Ioutput interface
    void displayOutput(string output) const override;

    // virtual destructor
    ~CLIManager() = default;
};

#endif
