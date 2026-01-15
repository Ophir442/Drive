#include <gtest/gtest.h>
#include "Server.h"
#include "IdataBaseHandler.h"
#include "ClientThreadExecutor.h"
#include "App.h"
#include "CSIO.h"
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <cstring>
#include <thread>
#include <chrono>
#include <filesystem>
#include <atomic>
#include <vector>
#include <mutex>

using namespace std;

// Mock Database Handler for testing
class MockServerDataBaseHandler : public IdataBaseHandler {
public:
    map<string, string> storedFiles;
    mutable mutex dbMutex; // For thread-safe access

    bool isExists(const string fileName) override {
        lock_guard<mutex> lock(dbMutex);
        return storedFiles.find(fileName) != storedFiles.end();
    }

    bool insertFile(const string fileName, const string content, const filesystem::path filePath) override {
        lock_guard<mutex> lock(dbMutex);
        if (storedFiles.find(fileName) != storedFiles.end()) {
            return false; // File already exists
        }
        storedFiles[fileName] = content;
        return true;
    }

    vector<string> getAllFileNames() override {
        lock_guard<mutex> lock(dbMutex);
        vector<string> names;
        for (const auto& pair : storedFiles) {
            names.push_back(pair.first);
        }
        return names;
    }

    string getContent(const string fileName) override {
        lock_guard<mutex> lock(dbMutex);
        if (storedFiles.find(fileName) != storedFiles.end()) {
            return storedFiles[fileName];
        }
        return "";
    }

    bool deleteFile(const string fileName) override {
        lock_guard<mutex> lock(dbMutex);
        if (storedFiles.find(fileName) == storedFiles.end()) {
            return false;
        }
        storedFiles.erase(fileName);
        return true;
    }
};

// Mock Executor for testing - tracks execution calls
class MockClientThreadExecutor : public ClientThreadExecutor {
public:
    atomic<int> executionCount{0};
    mutable mutex executorMutex;

    // Fixed signature to match IExecutor/ClientThreadExecutor
    void execute(IRunnable &task) override {
        lock_guard<mutex> lock(executorMutex);
        executionCount++;
        
        // Run the app in a new thread (simulating real behavior)
        // Note: Real ClientThreadExecutor deletes the task. We must do the same to avoid leaks
        // as Server creates App using 'new'.
        thread([&task]() {
            task.run();
            delete &task; 
        }).detach();
    }
};

// --- Test Fixture ---
class ServerTest : public ::testing::Test {
protected: 
    MockServerDataBaseHandler* mockDB;
    MockClientThreadExecutor* mockExecutor;
    Server* server;
    int testPort;
    thread serverThread;
    atomic<bool> serverRunning{false};

    void SetUp() override {
        // --- ADD THIS LINE ---
        server = nullptr; 
        // --------------------

        // Set up environment variables
        setenv("DRIVE_STORAGE", "./test_server_storage", 1);
        setenv("DRIVE_FILE_NAMES", "./test_server_names", 1);

        filesystem::create_directories("./test_server_storage");
        filesystem::create_directories("./test_server_names");

        mockDB = new MockServerDataBaseHandler();
        mockExecutor = new MockClientThreadExecutor();
        
        // Use a random port in the ephemeral range to avoid conflicts
        testPort = 9000 + (rand() % 1000);
    }
    
    void TearDown() override {
        serverRunning = false;
        
        // Give server time to shut down
        this_thread::sleep_for(chrono::milliseconds(100));
        
        if (serverThread.joinable()) {
            serverThread.detach(); // Detach since server runs indefinitely
        }

        // Clean up test directories
        filesystem::remove_all("./test_server_storage");
        filesystem::remove_all("./test_server_names");
        
        // Note: mockDB and mockExecutor are deleted by Server destructor if passed,
        // but here we might need to delete them manually if Server wasn't created or to be safe.
        // However, Server takes pointers and usually doesn't own them in dependency injection, 
        // but looking at Server implementation it doesn't delete them. 
        // So we delete them here.
        // Wait, if Server was created, we delete Server.
        if (server) {
             // Server destructor usually doesn't delete injected dependencies in C++ unless specified.
             // Based on provided Server code, it does not delete them.
             delete server;
        }
        delete mockDB;
        delete mockExecutor;
    }

    // Helper: Start server in a separate thread
    void startServerAsync() {
        server = new Server(testPort, mockDB, mockExecutor);
        serverRunning = true;
        serverThread = thread([this]() {
            server->run();
        });
        // Give server time to start listening
        this_thread::sleep_for(chrono::milliseconds(200));
    }

    // Helper: Connect a client to the server
    int connectClient() {
        int clientSocket = socket(AF_INET, SOCK_STREAM, 0);
        if (clientSocket == -1) {
            return -1;
        }

        sockaddr_in serverAddr;
        memset(&serverAddr, 0, sizeof(serverAddr));
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_port = htons(testPort);
        inet_pton(AF_INET, "127.0.0.1", &serverAddr.sin_addr);

        if (connect(clientSocket, (sockaddr*)&serverAddr, sizeof(serverAddr)) == -1) {
            close(clientSocket);
            return -1;
        }

        return clientSocket;
    }

    // Helper: Send command to server and receive response
    string sendCommand(int clientSocket, const string& command) {
        string cmdWithNewline = command + "\n";
        send(clientSocket, cmdWithNewline.c_str(), cmdWithNewline.length(), 0);

        char buffer[4096];
        memset(buffer, 0, sizeof(buffer));
        int bytesReceived = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
        
        if (bytesReceived > 0) {
            return string(buffer, bytesReceived);
        }
        return "";
    }
};

// --- Server Construction Tests ---

TEST_F(ServerTest, CPPServer) {
    Server* testServer = new Server(8080, mockDB, mockExecutor);
    EXPECT_NE(testServer, nullptr);
    delete testServer;
}
