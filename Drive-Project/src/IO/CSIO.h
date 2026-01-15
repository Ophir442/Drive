// Client-Server Input/Output handling
#ifndef CSIO_H
#define CSIO_H
#include "Iinput.h"
#include "Ioutput.h"
#include "CommandWrapper.h"
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <cstring>
#include <string>
#include <vector>
#include <iostream>
using namespace std;

class CSIO: public IInput, public Ioutput {
private:
    // socket of the client
    int clientSocket;

    // command wrapper to format output
    CommandWrapper* commandWrapper;

public:
    // Constructor
    CSIO(int clientSocket, CommandWrapper* commandWrapper);

    // display commands menu - empty implementation
    virtual void displayCommands(map<string, ICommands*> commands) const override
    {
        // empty implementation
    }

    // display output to the client
    virtual void displayOutput(string output) const override;

    // read command and arguments from the client
    virtual vector<string> getCommandAndArgs() override;

    // Destructor  to close the socket
    ~CSIO();
    
    // because of the rule of 5
    CSIO(const CSIO&) = delete;
    CSIO& operator=(const CSIO&) = delete;
    CSIO(CSIO&&) = delete;
    CSIO& operator=(CSIO&&) = delete;

};
#endif // CSIO_H
