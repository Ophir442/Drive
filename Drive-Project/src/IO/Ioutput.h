#ifndef IOUTPUT_H
#define IOUTPUT_H

using namespace std;

#include <map>
#include <string>
#include "../UserCommands/Icommand.h"
// Interface declaration
class Ioutput {

public:

    // Prints all commands options to the user.
    virtual void displayCommands(map<string, ICommands*> commands) const = 0;

    // Prints a general output line to the user (results, messages, etc.).
    virtual void displayOutput(string output) const = 0;
    
    // no need for constructor in Interfaces.
    // virtual destructor (every Interface should have a virtual destructor)
    virtual ~Ioutput() = default;
};

#endif
