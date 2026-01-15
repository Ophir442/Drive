#include <gtest/gtest.h>
#include "GetCommand.h"
#include "IdataBaseHandler.h"
#include "Icompressor.h"
#include <string>
#include <vector>
#include <map>

using namespace std;

// --- Mocks ---

class MockDataBaseHandlerGet : public IdataBaseHandler {
public:
    map<string, string> storedFiles; 
    
    bool isExists(const string fileName) override {
        return storedFiles.find(fileName) != storedFiles.end();
    }

    string getContent(const string fileName) override {
        if (isExists(fileName)) {
            return storedFiles[fileName];
        }
        throw runtime_error("File not found");
    }

    // Unused
    bool insertFile(const string, const string, const filesystem::path) override { return true; }
    vector<string> getAllFileNames() override { return {}; }
    bool deleteFile(const string) override { return false; }
};

class MockCompressorGet : public Icompressor {
    public:
        // Simulate decompression by removing a prefix
        string decompressFile(string compressedContent) override {
            if (compressedContent.find("COMPRESSED_") == 0) {
                 return compressedContent.substr(11); 
            }
            return compressedContent;
        }
        
        // Unused
        string compressFile(string) override { return ""; }
};

// --- Fixture ---

class GetCommandTest : public ::testing::Test {
protected:
    MockDataBaseHandlerGet* mockDB;
    MockCompressorGet* mockCompressor;
    GetCommand* getCmd;

    void SetUp() override {
        mockDB = new MockDataBaseHandlerGet();
        mockCompressor = new MockCompressorGet();
        getCmd = new GetCommand(mockDB, mockCompressor); 
    }

    void TearDown() override {
        delete getCmd;
        delete mockDB;
        delete mockCompressor;
    }

    void ExecuteAndVerify(const string& args, int expectedCode, const string& expectedOutput = "") {
        pair<int, string> result = getCmd->execute(args);
        EXPECT_EQ(result.first, expectedCode) << "Status code mismatch for args: " << args;
        if (expectedCode == 200) {
            EXPECT_EQ(result.second, expectedOutput) << "Content mismatch";
        }
    }
};

// --- Tests ---

TEST_F(GetCommandTest, SanityCheck) {
    // Setup DB
    mockDB->storedFiles["test.txt"] = "COMPRESSED_Hello World";
    mockDB->storedFiles["data"] = "COMPRESSED_123456";

    ExecuteAndVerify("test.txt", 200, "Hello World");
    ExecuteAndVerify("data", 200, "123456");
}

TEST_F(GetCommandTest, FileNotFound) {
    ExecuteAndVerify("ghost.txt", 404);
}

TEST_F(GetCommandTest, InvalidArguments) {
    ExecuteAndVerify("", 400);           // Empty
    ExecuteAndVerify("file with spaces", 400); // Spaces not allowed
}