#ifndef SAFEQUEUE_H
#define SAFEQUEUE_H

#include <queue>
#include <mutex>
#include <condition_variable>
#include "IRunnable.h"

class SafeQueue {
private:
    std::queue<IRunnable*> m_queue; // queue of IRunnable pointers
    std::mutex m_mutex;             // only one thread can access the queue at a time
    std::condition_variable m_cond; // to notify worker threads of new tasks - saves CPU cycles
    bool m_running;                 // indicates if the queue is still running  

public:
    SafeQueue();
    ~SafeQueue();

    // adding a task to the queue(pointer to IRunnable)
    void enqueue(IRunnable* item);

    // retrieving a task from the queue
    IRunnable* dequeue();

    // test if the queue is empty. ONLY FOR OUTSIDE USE! OTHERWISE, USE m_queue.empty() TO NOT GET A DEADLOCK!!!
    bool isEmpty();

    // shutting down the queue
    void shutdown();
};

#endif // SAFEQUEUE_H