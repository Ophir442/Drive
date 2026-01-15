#ifndef THREADPOOLEXECUTOR_H
#define THREADPOOLEXECUTOR_H

#include "IExecutor.h"
#include "ThreadPool.h" 

class ThreadPoolExecutor : public IExecutor {
private:
    ThreadPool m_pool;

public:
    // default to number of hardware threads
    ThreadPoolExecutor(size_t numThreads = std::thread::hardware_concurrency());
    virtual ~ThreadPoolExecutor();

    // add the task to the thread pool (by pointer)
    void execute(IRunnable& task) override;
    
    // here we do need a shutdown method because we have a pool
    void shutdown();
};

#endif // THREADPOOLEXECUTOR_H