#ifndef AddCommand_H
#define AddCommand_H

#include "Icommand.h"
#include "IdataBaseHandler.h"
#include "Icompressor.h"
#include <string>
#include <utility>
#include <cstdlib>
#include <filesystem>

using namespace std;

class IdataBaseHandler; // forward declaration
class Icompressor; // forward declaration

class AddCommand : public ICommands
{
private:
    IdataBaseHandler* dataBase; // pointer to data base handler
    Icompressor* compressor; // pointer to compression handler

    // Returns true if the given arguments are valid (used for error handling).
    bool isValid(string fileName, string content) const;

public:
    AddCommand(IdataBaseHandler* dataBase, Icompressor* compressor); // constructor

    // the actual execution of the command "add"
    // Returns pair<statusCode, output>
    pair<int, string> execute(const string& args) const override;
};

#endif // AddCommand_H