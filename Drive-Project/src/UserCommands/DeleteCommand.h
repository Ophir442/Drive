#ifndef DeleteCommand_H
#define DeleteCommand_H

#include "Icommand.h"
#include "IdataBaseHandler.h"
#include <string>
#include <utility>
#include <filesystem>

using namespace std;

class IdataBaseHandler; // forward declaration

class DeleteCommand : public ICommands
{
private:
    IdataBaseHandler* dataBase; // pointer to data base handler

    // Returns true if the given arguments are valid (used for error handling).
    bool isValid(string fileName) const;

public:
    DeleteCommand(IdataBaseHandler* dataBase); // constructor

    // the actual execution of the command "delete"
    // Returns pair<statusCode, output>
    pair<int, string> execute(const string& args) const override;
};

#endif // DeleteCommand_H