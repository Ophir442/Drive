#ifndef SearchCommand_H
#define SearchCommand_H

#include "Icommand.h"
#include "IdataBaseHandler.h"
#include "Icompressor.h"
#include "GetCommand.h"
#include <string>
#include <vector>
#include <utility>

using namespace std;

class IdataBaseHandler; // forward declaration
class Icompressor; // forward declaration

class SearchCommand :  public ICommands
{
private:
    IdataBaseHandler* dataBase; // pointer to data base handler
    Icompressor* compressor; // pointer to compression handler

    // Returns true if the given file content is valid (used for error handling).
    bool isValid(string fileContent) const;

public:
    SearchCommand(IdataBaseHandler* dataBase, Icompressor* compressor); // constructor

    // the actual execution of the command "search"
    // Returns pair<statusCode, output>
    pair<int, string> execute(const string& args) const override;
};

#endif // SearchCommand_H
