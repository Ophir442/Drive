#include "Client.h"

Client::Client(const string& serverIP, int serverPort, CLIManager cliManager)
    : serverIP(serverIP), serverPort(serverPort), cliManager(cliManager) {
}

void Client::send(int sock, const string& msg) {
    int totalSent = 0;
    int msgLen = msg.size();
    while (totalSent < msgLen) {
        int sent = ::send(sock, msg.c_str() + totalSent, msgLen - totalSent, 0);
        if (sent == -1) {
            throw exception(); // Failed to send data to server
        }
        totalSent += sent;
    }
}

string Client::receive(int sock) {
    // this method will be used to receive the length of the incoming message 
    char lengthBuffer[8];
    int bytesReceived = ::recv(sock, lengthBuffer, sizeof(lengthBuffer), 0);
    if (bytesReceived == -1) {
        throw exception(); // Failed to receive data from server
    } else if (bytesReceived == 0) {
        throw exception(); // Connection closed by server
    }
    int messageLength = stoi(string(lengthBuffer, bytesReceived));
    return receive(sock, messageLength);
}

string Client::receive(int sock, int length) {
    // this method will be used to receive the actual message based on the length received  
    string receivedData;
    int totalReceived = 0;
    while (totalReceived < length) {
        char buffer[4096];
        int toReceive = min(static_cast<int>(sizeof(buffer)), length - totalReceived);
        int received = ::recv(sock, buffer, toReceive, 0);
        if (received == -1) {
            throw exception(); // Failed to receive data from server
        } else if (received == 0) {
            throw exception(); // connection closed
        }
        receivedData.append(buffer, received);
        totalReceived += received;
    }
    return receivedData;
}

void Client::run() {  
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == -1) {
        throw exception(); // Failed to create socket
    }

    sockaddr_in serverAddr;
    memset(&serverAddr, 0, sizeof(serverAddr));
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_port = htons(serverPort);

    // if (inet_pton(AF_INET, serverIP.c_str(), &serverAddr.sin_addr) <= 0) {
    //     close(sock);
    //     throw exception(); // Invalid server IP address
    // }
    
    // Resolve hostname (server) to IP address (of server container)
    struct hostent* he = gethostbyname(serverIP.c_str());
    if (he == nullptr) {
        close(sock);
        throw exception(); // Failed to resolve hostname
    
    }
    memcpy(&serverAddr.sin_addr, he->h_addr_list[0], he->h_length);
    if (connect(sock, (sockaddr*)&serverAddr, sizeof(serverAddr)) == -1) {
        close(sock);
        throw exception(); // Failed to connect to server
    }

    while (true) {
        // Clear message for each new command
        string message = "";

        // Get command from CLI
        vector<string> vectorMessage;
        try {
            vectorMessage = cliManager.getCommandAndArgs();
        } catch (...) {
            // Empty input, send bad request and continue to next iteration
            string response = "400 Bad Request\n";
            cliManager.displayOutput(response);
            continue; 
        }

        // Build message from command parts
        for (const string& part : vectorMessage) {
            message += part + " ";
        }

        // Remove trailing space and add newline
        if (!message.empty() && message.back() == ' ') {
            message.pop_back();
        }
        message += "\n";

        // Send command to server and receive response
        try {
            send(sock, message);
            string response = receive(sock);
            cliManager.displayOutput(response);
        } catch (const exception& e) {
            close(sock);
            throw; // Rethrow network errors to be handled by caller
        }
    }
    
    close(sock);
}

int main(int argc, char* argv[]) {
    if (argc != 3) {
        throw exception(); // Invalid arguments
    }

    string serverIP = argv[1];
    int serverPort = stoi(argv[2]);
    
    map<string, ICommands*> commands;
    CLIManager cliManager(commands);
    
    Client client(serverIP, serverPort, cliManager);
    try {
        client.run();
    } catch (const exception& e) {

    }

    return 0;
}