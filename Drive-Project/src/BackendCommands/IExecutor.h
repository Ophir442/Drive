// Executor interface, like in java
#ifndef IEXECUTOR_H
#define IEXECUTOR_H

#include "IRunnable.h"

class IExecutor {
public:
    /*
    * default destructor
    */
    virtual ~IExecutor()=default;

    /*
    * the execute method will take a runnable task and execute it.
    * each executor implementation will define how the task is executed.
    */
    virtual void execute(IRunnable &task) = 0;
};
#endif // IEXECUTOR_H