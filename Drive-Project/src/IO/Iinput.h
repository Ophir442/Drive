#ifndef IINPUT_H
#define IINPUT_H

using namespace std;
#include <string>
#include <vector>

// Interface decleration
class IInput {

public:

    // Reads and parses a command from input, returns the command name in 0 index of vector, and its arguments as a vector of strings.
    virtual vector<string> getCommandAndArgs() = 0;

    // no need for constructor in Interfaces.
    // virtual destructor (every Interface should have a virtual destructor)
    virtual ~IInput() = default;
};

#endif
