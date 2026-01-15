/*
* this is the header file for ClientThreadExecutor.cpp
* this executor will use a thread per client model to handle client requests with a TCP connection.
* NOTE: the thread per client model does not use a thread pool.
*/

#ifndef ClientThreadExecutor_H
#define ClientThreadExecutor_H

#include "IExecutor.h"
#include <thread>

class ClientThreadExecutor : public IExecutor
{
public:
    // Constructor
    ClientThreadExecutor();

    /*
    * in this server version, the execute method will create a new thread for each client connection.
    * @param clientHandler - the runnable task to be executed (a client handler - our app).
    * @return void - no return value.
    */
    void execute(IRunnable &clientHandler) override;
};


#endif // ClientThreadExecutor_H