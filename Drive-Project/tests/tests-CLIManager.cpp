#include <gtest/gtest.h>
#include "CLIManager.h"
#include "Icommand.h"
#include <sstream>
#include <iostream>
#include <vector>
#include <map>

using namespace std;

class CLIManagerTest : public ::testing::Test {
protected:
    CLIManager* cliManager;
    stringstream testInput;
    stringstream testOutput;
    streambuf* origCin;
    streambuf* origCout;
    map<string, ICommands*> mockCommands; // CLIManager constructor needs this

    void SetUp() override {
        // Redirect std::cin and std::cout to our stringstreams
        origCin = cin.rdbuf(testInput.rdbuf());
        origCout = cout.rdbuf(testOutput.rdbuf());
        
        // CRITICAL: Clear cin's error state (EOF/Fail) from any previous usage
        cin.clear();
        
        cliManager = new CLIManager(mockCommands);
    }

    void TearDown() override {
        // Restore standard streams
        cin.rdbuf(origCin);
        cout.rdbuf(origCout);
        delete cliManager;
    }
    
    // Helper to reset streams for next test case within same test
    void ResetStreams() {
        testInput.str("");
        testInput.clear(); // Clear stringstream state
        
        testOutput.str("");
        testOutput.clear();
        
        // CRITICAL: Clear std::cin's state. 
        // Since cin is tied to testInput's buffer, if testInput hit EOF, cin sets eofbit.
        // We must clear this bit to read again.
        cin.clear();
    }
};

// 1. Test getCommandAndArgs Parsing
TEST_F(CLIManagerTest, ParseCommandAndArgs) {
    // Case A: Command with arguments
    // We add \n to simulate user pressing enter, though getline handles EOF too.
    testInput.str("add myFile.txt content\n");
    vector<string> result = cliManager->getCommandAndArgs();
    
    ASSERT_EQ(result.size(), 2);
    EXPECT_EQ(result[0], "add");
    EXPECT_EQ(result[1], "myFile.txt content");

    // Case B: Command without arguments
    ResetStreams(); // This now correctly clears cin.clear()
    testInput.str("search\n");
    result = cliManager->getCommandAndArgs();
    
    ASSERT_EQ(result.size(), 1);
    EXPECT_EQ(result[0], "search");
}

// 2. Test Empty Input Exception
TEST_F(CLIManagerTest, EmptyInputThrows) {
    // Simulate empty line (user just hits enter)
    testInput.str("\n"); 
    
    // Depending on implementation, CLIManager might throw exception for empty input
    // The provided CLIManager.cpp throws exception() if stringCLIInput.empty()
    EXPECT_THROW(cliManager->getCommandAndArgs(), std::exception);
}

// 3. Test Display Output
TEST_F(CLIManagerTest, DisplayOutput) {
    string expectedOutput = "200 Ok\n\nContent";
    cliManager->displayOutput(expectedOutput);
    
    EXPECT_EQ(testOutput.str(), expectedOutput);
}