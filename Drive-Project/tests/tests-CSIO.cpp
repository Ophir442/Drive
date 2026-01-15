#include <gtest/gtest.h>
#include "CSIO.h"
#include "CommandWrapper.h"
#include <sys/socket.h>
#include <unistd.h>
#include <string>
#include <vector>
#include <thread>
#include <chrono>

using namespace std;

class CSIOTest : public ::testing::Test {
protected:
    int socks[2]; // socks[0] used by CSIO (server side), socks[1] used by test (client side)
    CSIO* csio;
    CommandWrapper* mockWrapper;

    void SetUp() override {
        // Create a connected pair of sockets (simulating a TCP connection)
        if (socketpair(AF_UNIX, SOCK_STREAM, 0, socks) < 0) {
            perror("socketpair");
            exit(EXIT_FAILURE);
        }

        // CSIO takes ownership of socks[0] and a command wrapper
        mockWrapper = new CommandWrapper();
        csio = new CSIO(socks[0], mockWrapper);
    }

    void TearDown() override {
        delete csio; // This closes socks[0] inside CSIO destructor
        delete mockWrapper;
        close(socks[1]); // We must close our end of the connection
    }

    // Helper: Write string to the "client" end of the socket
    void WriteToSocket(const string& data) {
        ssize_t sent = write(socks[1], data.c_str(), data.size());
        ASSERT_EQ(sent, data.size());
    }

    // Helper: Read exact number of bytes from the "client" end
    string ReadFromSocket(size_t bytes) {
        vector<char> buffer(bytes);
        size_t totalRead = 0;
        while(totalRead < bytes) {
            ssize_t r = read(socks[1], buffer.data() + totalRead, bytes - totalRead);
            if(r <= 0) break; // Error or closed
            totalRead += r;
        }
        return string(buffer.data(), totalRead);
    }
};

// 1. Reading Commands
TEST_F(CSIOTest, ReceiveSimpleCommand) {
    // Send a standard command ending with newline
    string cmd = "post file.txt content\n";
    WriteToSocket(cmd);

    vector<string> result = csio->getCommandAndArgs();

    ASSERT_EQ(result.size(), 2);
    EXPECT_EQ(result[0], "post");
    EXPECT_EQ(result[1], "file.txt content");
}

TEST_F(CSIOTest, ReceiveFragmentedCommand) {
    // Simulate network fragmentation (packets arriving separately)
    string part1 = "get ";
    string part2 = "my_file.txt\n";

    // Send first part, wait, then second part
    thread sender([this, part1, part2]() {
        WriteToSocket(part1);
        this_thread::sleep_for(chrono::milliseconds(50));
        WriteToSocket(part2);
    });

    // CSIO should block until the full command (newline) is received
    vector<string> result = csio->getCommandAndArgs();
    sender.join();

    ASSERT_EQ(result.size(), 2);
    EXPECT_EQ(result[0], "get");
    EXPECT_EQ(result[1], "my_file.txt");
}

TEST_F(CSIOTest, ReceiveInvalidFormat) {
    // CSIO.cpp throws exception if no space separator is found
    string cmd = "JustCommandWithoutArgs\n";
    WriteToSocket(cmd);

    EXPECT_THROW(csio->getCommandAndArgs(), std::exception);
}

// 2. Sending Output
TEST_F(CSIOTest, SendOutputWithProtocol) {
    string message = "Operation Successful";
    
    // Call displayOutput
    csio->displayOutput(message);

    // Verify Protocol:
    // 1. First 8 bytes: Length of message (padded with spaces)
    // 2. Remaining bytes: The message itself
    
    // Expected length string: "20      " (20 is length, padded to 8 chars)
    string lenHeader = ReadFromSocket(8);
    EXPECT_EQ(lenHeader, "20      "); 

    // Expected content
    string content = ReadFromSocket(20);
    EXPECT_EQ(content, message);
}

TEST_F(CSIOTest, SendEmptyOutput) {
    csio->displayOutput("");

    // Should only send the length header "0       "
    string lenHeader = ReadFromSocket(8);
    EXPECT_EQ(lenHeader, "0       ");
}