#ifndef SERVER_H
#define SERVER_H
#include "IdataBaseHandler.h"
#include "ClientThreadExecutor.h"
#include "ThreadPoolExecutor.h"
#include "App.h"
#include "CSIO.h"
#include "CommandWrapper.h"
#include "ClientThreadExecutor.h"
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <cstring>
using namespace std;
class Server {

private:

    // port number for the server to listen on
    int serverPort;

    // database handler
    IdataBaseHandler* dataBaseHandler;

    // executor to handle client connections
    IExecutor* executor;

public:
    
    // Constructor
    Server(int serverPort, IdataBaseHandler* dataBaseHandler, IExecutor* executor);
    
    // method to accept clients indefinitely
    void acceptClients(int serverSocket);

    // run method to start the server
    void run();

};

#endif // SERVER_H