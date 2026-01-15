#ifndef THREADPOOL_H
#define THREADPOOL_H

#include <vector>
#include <thread>
#include "SafeQueue.h"
#include "IRunnable.h"

class ThreadPool {
private:
    std::vector<std::thread> m_workers; // vector of worker threads
    SafeQueue m_tasks;                  // thread-safe queue of tasks
    bool m_stopped;                     // indicates if the pool is stopped

    void workerRoutine();               // routine for each worker thread. private for internal use only

public:
    ThreadPool(size_t numThreads = std::thread::hardware_concurrency()); // default to num of hardware threads
    ~ThreadPool();

    void addTask(IRunnable* task);
    void shutdown();
};

#endif // THREADPOOL_H