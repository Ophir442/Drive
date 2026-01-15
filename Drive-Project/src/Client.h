#ifndef CLIENT_H
#define CLIENT_H
#include "CLIManager.h"
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <cstring>
#include <netdb.h>  // For gethostbyname
using namespace std;
class Client {
    
private:
    // Command Line Interface manager
    CLIManager cliManager;
    
    // Server IP address
    string serverIP;
    
    // Server port
    int serverPort;

public:
    
    // Constructor
    Client(const string& serverIP, int serverPort, CLIManager cliManager);
    
    // Sends a message to the server
    void send(int sock, const string& msg);
    
    // Receives a message from the server, we are using it for receiving the length of the incoming message
    string receive(int sock);
    
    // Receives a message of given length from the server
    string receive(int sock, int length);

    // Runs the client application
    void run();
    
};
#endif // CLIENT_H