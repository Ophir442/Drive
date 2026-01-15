#include "SafeQueue.h"

SafeQueue::SafeQueue() : m_running(true) {}

SafeQueue::~SafeQueue() {
    shutdown();
}

/*
 * adding a task to the queue
 * @param item: pointer to IRunnable
 * @return void
*/
void SafeQueue::enqueue(IRunnable* item) {
    // lock the mutex, automatically unlocks when goes out of scope
    std::lock_guard<std::mutex> lock(m_mutex); 
    m_queue.push(item);
    m_cond.notify_one();
}

/*
    * retrieving a task from the queue
    * @return pointer to IRunnable or nullptr if the queue is shut down
*/
IRunnable* SafeQueue::dequeue() {
    // lock the mutex, automatically unlocks when goes out of scope
    std::unique_lock<std::mutex> lock(m_mutex);
    
    // wait until there is a task or the queue is shut down
    m_cond.wait(lock, [this]() { return !m_queue.empty() || !m_running; });

    if (m_queue.empty() || !m_running) { // if shut down and no tasks left
        return nullptr;
    }
    // doing front and pop separately to avoid copying the item
    IRunnable* item = m_queue.front();
    m_queue.pop();

    return item;
}

/*
 * check if the queue is empty. 
 * ONLY FOR OUTSIDE USE! OTHERWISE USE m_queue.empty() TO NOT GET A DEADLOCK!!!
 * @return true if empty, false otherwise
*/
bool SafeQueue::isEmpty() {
    std::lock_guard<std::mutex> lock(m_mutex);
    return m_queue.empty();
}

/*
 * shutting down the queue. not supposed to be used but in case of destructor call.
*/
void SafeQueue::shutdown() {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_running = false;
    m_cond.notify_all();
}