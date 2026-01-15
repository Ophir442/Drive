#include "ThreadPoolExecutor.h"

ThreadPoolExecutor::ThreadPoolExecutor(size_t numThreads) 
    : m_pool(numThreads) {
}

// it is ok to use non-default destructor because we need to shutdown the pool
ThreadPoolExecutor::~ThreadPoolExecutor() {
    shutdown();
}

// add the task to the thread pool (by pointer)
void ThreadPoolExecutor::execute(IRunnable& task) {
    // pass the address (pointer) of the task to the Pool
    m_pool.addTask(&task);
}

void ThreadPoolExecutor::shutdown() {
    // shutdown the underlying thread pool
    m_pool.shutdown();
}