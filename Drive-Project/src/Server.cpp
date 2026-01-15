#include "Server.h"

Server::Server(int serverPort, IdataBaseHandler* dataBaseHandler, IExecutor* executor)
    : serverPort(serverPort), dataBaseHandler(dataBaseHandler), executor(executor) {
}

void Server::run() {
    int serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket == -1) {
        throw exception(); // Failed to create socket
    }

        sockaddr_in serverAddr;
        memset(&serverAddr, 0, sizeof(serverAddr));
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_addr.s_addr = INADDR_ANY;
        serverAddr.sin_port = htons(serverPort);

    try{
        if (bind(serverSocket, (sockaddr*)&serverAddr, sizeof(serverAddr)) == -1) {
            close(serverSocket);
            throw exception(); // Failed to bind socket
        }

        if (listen(serverSocket, SOMAXCONN) == -1) {
            close(serverSocket);
            throw exception(); // Failed to listen on socket
        }
    
        acceptClients(serverSocket); // Start accepting clients - this will run indefinitely
    } catch (...) {
        close(serverSocket);
    }
}

void Server::acceptClients(int serverSocket) {
    while (true) {
        sockaddr_in clientAddr;
        socklen_t clientAddrLen = sizeof(clientAddr);
        int clientSocket = accept(serverSocket, (sockaddr*)&clientAddr, &clientAddrLen);
        // new client connected

        if (clientSocket == -1) {
            continue; // continue accepting other clients
        }

        // Create a new App instance for the connected client
        CommandWrapper* commandWrapper = new CommandWrapper();
        CSIO* csio = new CSIO(clientSocket, commandWrapper);
        App* clientApp = new App(dataBaseHandler, csio, csio);
        
        // Use the executor to handle the client in a separate thread
        executor->execute(*clientApp);
        
        // delete clientApp will be handled inside the executor after the thread is done
        // also csio and commandWrapper will be deleted inside clientApp destructor
    }
}
