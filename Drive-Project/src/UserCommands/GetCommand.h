#ifndef GetCommand_H
#define GetCommand_H

#include "Icommand.h"
#include "IdataBaseHandler.h"
#include "Icompressor.h"
#include <string>
#include <utility>
#include <iostream>

using namespace std;

class IdataBaseHandler; // forward declaration
class Icompressor; // forward declaration

class GetCommand : public ICommands
{
private:
    IdataBaseHandler* dataBase; // pointer to data base handler
    Icompressor* compressor; // pointer to compression handler

    // Returns true if the given arguments are valid (used for error handling).
    bool isValid(string fileName) const;

public:
    GetCommand(IdataBaseHandler* dataBase, Icompressor* compressor); // constructor

    // the actual execution of the command "get"
    // Returns pair<statusCode, output>
    pair<int, string> execute(const string& args) const override;
};

#endif // GetCommand_H