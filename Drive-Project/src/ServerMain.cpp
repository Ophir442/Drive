#include "Server.h"
#include "FolderManager.h"
#include <iostream>
#include <cstdlib> // For getenv, stoi

using namespace std;

int main(int argc, char* argv[]) {
    if (argc != 2) {
        throw exception(); // Invalid arguments
    }

    int serverPort = stoi(argv[1]);

    // get environment variables for storage paths
    filesystem::path mainStorage = getenv("DRIVE_STORAGE");
    filesystem::path folderForLogicalNames = getenv("DRIVE_FILE_NAMES");

    // read thread pool size from environment variable
    const char* poolSizeEnv = getenv("THREAD_POOL_SIZE");
    int poolSize = std::thread::hardware_concurrency(); // default to number of hardware threads
    if (poolSizeEnv != nullptr) {
        try {
            poolSize = stoi(poolSizeEnv);
        } catch (...) {
            poolSize = std::thread::hardware_concurrency(); // incase of an error
        }
    }

    // create database handler and executor
    IdataBaseHandler* dbHandler = new FolderManager(mainStorage, folderForLogicalNames);
    IExecutor* executor = new ThreadPoolExecutor();

    // create and run the server
    Server server(serverPort, dbHandler, executor);
    server.run();

    // cleanup (although run() suposed to loop indefinitely)
    delete executor;
    delete dbHandler;

    return 0;
}