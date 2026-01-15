// Runnable interface, like in java
#ifndef IRUNNABLE_H
#define IRUNNABLE_H

class IRunnable {
public:
    /*
    * default destructor
    */
    virtual ~IRunnable()=default;

    /*
    * this is a runnable... of course it can run!
    */
    virtual void run() = 0;
};

#endif // IRUNNABLE_H