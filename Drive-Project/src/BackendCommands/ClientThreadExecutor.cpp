#include "ClientThreadExecutor.h"


ClientThreadExecutor::ClientThreadExecutor() = default;

void ClientThreadExecutor::execute(IRunnable &clientHandler) {
    // create a new thread for each client connection and run the client handler
    std::thread clientThread([&clientHandler]() {
        clientHandler.run();

        delete &clientHandler; // clean up the client handler after execution
    });
    
    // detach the thread to allow it to run independently and free resources when done
    clientThread.detach();
}
