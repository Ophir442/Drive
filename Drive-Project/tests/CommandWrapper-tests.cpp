#include <gtest/gtest.h>
#include "CommandWrapper.h"
#include "Icommand.h"
#include <string>
#include <iostream>
#include <sstream>

using namespace std;

// Mock command class for testing
class MockCommand : public ICommands {
private:
    int statusCode;
    string output;
    bool shouldThrowRuntime;
    bool shouldThrowGeneric;

public:
    MockCommand(int code, const string& out = "", bool throwRuntime = false, bool throwGeneric = false) 
        : statusCode(code), output(out), shouldThrowRuntime(throwRuntime), shouldThrowGeneric(throwGeneric) {}

    pair<int, string> execute(const string& args) const override {
        if (shouldThrowRuntime) {
            throw runtime_error("Runtime error occurred");
        }
        if (shouldThrowGeneric) {
            throw exception();
        }
        return {statusCode, output};
    }
};

// --- Fixture Class ---
class CommandWrapperTest : public ::testing::Test {
protected:
    CommandWrapper* wrapper;

    void SetUp() override {
        wrapper = new CommandWrapper();
    }

    void TearDown() override {
        delete wrapper;
    }
};

// --- Test Cases ---

// Test that non-200 status codes don't append captured data
TEST_F(CommandWrapperTest, FormatOutputNon200WithData) {
    // STATUS_CREATED with data - should not append
    string result = wrapper->formatOutput(CommandWrapper::STATUS_CREATED, "Some data");
    EXPECT_EQ(result, "201 Created\n");

    // STATUS_NO_CONTENT with data - should not append
    result = wrapper->formatOutput(CommandWrapper::STATUS_NO_CONTENT, "No content data");
    EXPECT_EQ(result, "204 No Content\n");

    // STATUS_BAD_REQUEST with data - should not append
    result = wrapper->formatOutput(CommandWrapper::STATUS_BAD_REQUEST, "Error data");
    EXPECT_EQ(result, "400 Bad Request\n");

    // STATUS_NOT_FOUND with data - should not append
    result = wrapper->formatOutput(CommandWrapper::STATUS_NOT_FOUND, "Not found data");
    EXPECT_EQ(result, "404 Not Found\n");

    // STATUS_INTERNAL_SERVER_ERROR with data - should not append
    result = wrapper->formatOutput(CommandWrapper::STATUS_INTERNAL_SERVER_ERROR, "Server error data");
    EXPECT_EQ(result, "500 Internal Server Error\n");
}

// Test error handling for null commands
TEST_F(CommandWrapperTest, NullCommandHandling) {
    string result = wrapper->executeCommand(nullptr, "some args");
    EXPECT_EQ(result, "400 Bad Request\n");

    // Test with empty args
    result = wrapper->executeCommand(nullptr, "");
    EXPECT_EQ(result, "400 Bad Request\n");
}

// Test integration with command execution
TEST_F(CommandWrapperTest, IntegrationWithCommandExecution) {
    // Test successful command execution with output (200)
    MockCommand* successCmd = new MockCommand(CommandWrapper::STATUS_OK, "File content here");
    string result = wrapper->executeCommand(successCmd, "filename.txt");
    EXPECT_EQ(result, "200 Ok\n\nFile content here\n");
    delete successCmd;

    // Test command with no output (201)
    MockCommand* noOutputCmd = new MockCommand(CommandWrapper::STATUS_CREATED, "");
    result = wrapper->executeCommand(noOutputCmd, "newfile.txt content");
    EXPECT_EQ(result, "201 Created\n");
    delete noOutputCmd;

    // Test successful deletion with no content (204)
    MockCommand* deleteCmd = new MockCommand(CommandWrapper::STATUS_NO_CONTENT, "");
    result = wrapper->executeCommand(deleteCmd, "file_to_delete.txt");
    EXPECT_EQ(result, "204 No Content\n");
    delete deleteCmd;

    // Test bad request - invalid input (400)
    MockCommand* badRequestCmd = new MockCommand(CommandWrapper::STATUS_BAD_REQUEST, "");
    result = wrapper->executeCommand(badRequestCmd, "invalid input");
    EXPECT_EQ(result, "400 Bad Request\n");
    delete badRequestCmd;

    // Test command returning not found error (404)
    MockCommand* errorCmd = new MockCommand(CommandWrapper::STATUS_NOT_FOUND, "");
    result = wrapper->executeCommand(errorCmd, "nonexistent.txt");
    EXPECT_EQ(result, "404 Not Found\n");
    delete errorCmd;

    // Test internal server error (500)
    MockCommand* serverErrorCmd = new MockCommand(CommandWrapper::STATUS_INTERNAL_SERVER_ERROR, "");
    result = wrapper->executeCommand(serverErrorCmd, "problematic_file.txt");
    EXPECT_EQ(result, "500 Internal Server Error\n");
    delete serverErrorCmd;
}

// Test edge cases
TEST_F(CommandWrapperTest, EdgeCases) {
    // Test with very long output
    string longOutput(1000, 'A');
    MockCommand* longCmd = new MockCommand(CommandWrapper::STATUS_OK, longOutput);
    string result = wrapper->executeCommand(longCmd, "");
    EXPECT_EQ(result, "200 Ok\n\n" + longOutput + "\n");
    delete longCmd;

    // Test with special characters in output
    MockCommand* specialCmd = new MockCommand(CommandWrapper::STATUS_OK, "Special: !@#$%^&*()");
    result = wrapper->executeCommand(specialCmd, "");
    EXPECT_EQ(result, "200 Ok\n\nSpecial: !@#$%^&*()\n");
    delete specialCmd;

    // Test with simple args
    MockCommand* simpleCmd = new MockCommand(CommandWrapper::STATUS_OK, "Output");
    result = wrapper->executeCommand(simpleCmd, "");
    EXPECT_EQ(result, "200 Ok\n\nOutput\n");
    delete simpleCmd;

    // Test output already ending with newline
    MockCommand* cmd = new MockCommand(CommandWrapper::STATUS_OK, "Output with newline\n");
    result = wrapper->executeCommand(cmd, "");
    EXPECT_EQ(result, "200 Ok\n\nOutput with newline\n");
    delete cmd;
}