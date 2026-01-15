#include "ThreadPool.h"
#include <iostream>

ThreadPool::ThreadPool(size_t numThreads) : m_stopped(false) {
    for (size_t i = 0; i < numThreads; ++i) {
        // emplace_back constructs a new thread, pushes it to the vector and starts it
        m_workers.emplace_back(&ThreadPool::workerRoutine, this); 
    }
}

// it is ok to use non-default destructor because we need to join threads
ThreadPool::~ThreadPool() {
    shutdown();
}

void ThreadPool::addTask(IRunnable* task) {
    if (!m_stopped) { // only enqueue if still running
        m_tasks.enqueue(task);
    }
}

void ThreadPool::shutdown() {
    if (m_stopped) return;  // already stopped - do nothing
    
    m_stopped = true;       // mark as stopped
    m_tasks.shutdown();

    for (auto& worker : m_workers) {
        // join each thread to wait for its completion
        // only threads that has been started and not yet joined are joinable
        if (worker.joinable()) {
            worker.join();
        }
    }
}

void ThreadPool::workerRoutine() {
    while (true) {
        // SafeQueue::dequeue returns nullptr if shutdown has been called and the queue is empty
        IRunnable* task = m_tasks.dequeue();
        
        if (task == nullptr) { // queue has been shut down and is empty
            break;
        }

        try {
            task->run();
        } catch (const std::exception& e) {
            // std::cerr << "ThreadPool: Exception in worker thread: " << e.what() << std::endl;
        } catch (...) {
            // std::cerr << "ThreadPool: Unknown exception in worker thread." << std::endl;
        }
    }
    // if we reach here, it means shutdown was called and the queue is empty - exit the thread
}