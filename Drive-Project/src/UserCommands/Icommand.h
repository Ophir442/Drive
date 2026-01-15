#ifndef ICommand_H
#define ICommand_H

#include <string>
#include <utility>

using namespace std;

// Interface declaration
class ICommands {
public:
    // no need for constructor in Interfaces. 
    // virtual destructor (every Interface should have a virtual destructor)
    virtual ~ICommands() = default;

    // Execute command and return pair of (status code, output string)
    // Output can be empty for commands like ADD/DELETE
    virtual pair<int, string> execute(const string& args) const = 0;
};

#endif