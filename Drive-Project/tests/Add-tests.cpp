#include <gtest/gtest.h>
#include "AddCommand.h"
#include "IdataBaseHandler.h"
#include "Icompressor.h"
#include <filesystem>
#include <string>
#include <vector>
#include <cstdlib> // for getenv, setenv
#include <fstream>
#include <map>

using namespace std;

// --- Mocks ---

// Mock Database to isolate AddCommand logic
class MockDataBaseHandler : public IdataBaseHandler {
public:
    map<string, string> storedFiles; 
    
    bool isExists(const string fileName) override {
        return storedFiles.find(fileName) != storedFiles.end();
    }

    bool insertFile(const string fileName, const string content, const filesystem::path filePath) override {
        // Simulate failure if file exists (though AddCommand usually checks isExists first)
        if (storedFiles.find(fileName) != storedFiles.end()) {
            return false;
        }
        storedFiles[fileName] = content;
        return true;
    }

    // Unused interface methods
    vector<string> getAllFileNames() override { return {}; }
    string getContent(const string fileName) override { return ""; }
    bool deleteFile(const string fileName) override { return false; }
};

// Mock Compressor to ensure predictable content
class MockCompressor : public Icompressor {
public:
    string compressFile(string unCompressedContent) override {
        return "COMPRESSED_" + unCompressedContent;
    }
    
    string decompressFile(string compressedContent) override {
        if (compressedContent.rfind("COMPRESSED_", 0) == 0) {
            return compressedContent.substr(11);
        }
        return compressedContent;
    }
};

// --- Fixture Class ---

class AddCommandTest : public ::testing::Test {
protected:
    MockDataBaseHandler* mockDB;
    MockCompressor* mockCompressor;
    AddCommand* addCmd;
    filesystem::path testStoragePath;

    void SetUp() override {
        // Setup environment variable for storage path
        setenv("DRIVE_STORAGE", "./test_storage_env", 1);
        testStoragePath = "./test_storage_env";
        filesystem::create_directories(testStoragePath);

        // Initialize mocks and command
        mockDB = new MockDataBaseHandler();
        mockCompressor = new MockCompressor();
        addCmd = new AddCommand(mockDB, mockCompressor); 
    }

    void TearDown() override {
        delete addCmd;
        delete mockDB;
        delete mockCompressor;
        filesystem::remove_all(testStoragePath);
    }

    // Helper to execute and verify results
    void AddFileTest(const string& args, int expectedStatusCode) {
        // Execute the command
        pair<int, string> result = addCmd->execute(args);

        // Verify status code matches
        EXPECT_EQ(result.first, expectedStatusCode) << "Failed for args: '" << args << "'";

        // If we expected success (201), verify the DB state
        if (expectedStatusCode == 201) {
            // Parse args to verify content
            size_t splitPos = args.find(' ');
            ASSERT_NE(splitPos, string::npos);
            
            string fileName = args.substr(0, splitPos);
            string content = args.substr(splitPos + 1);
            string expectedStored = "COMPRESSED_" + content;

            EXPECT_TRUE(mockDB->isExists(fileName));
            EXPECT_EQ(mockDB->storedFiles[fileName], expectedStored);
        }
    }
};

// --- Tests ---

// 1. Basic Functionality
TEST_F(AddCommandTest, SanityAdd) {
    AddFileTest("file.txt Hello World", 201);
    AddFileTest("data.dat 1234567890", 201);
    AddFileTest("single.txt Word", 201);
}

// 2. Duplicate File Check
TEST_F(AddCommandTest, FileAlreadyExists) {
    // First add should succeed
    AddFileTest("dup.txt FirstContent", 201);
    
    // Second add with same name should fail with 404 (as per AddCommand.cpp implementation)
    // Note: The implementation returns 404 if dataBase->isExists(filename) is true.
    AddFileTest("dup.txt SecondContent", 404);
    
    // Verify content wasn't overwritten
    EXPECT_EQ(mockDB->storedFiles["dup.txt"], "COMPRESSED_FirstContent");
}

// 3. Bad Requests (Validation Logic)
TEST_F(AddCommandTest, BadRequestValidation) {
    // Empty arguments
    AddFileTest("", 400);

    // Missing content (no space separator)
    AddFileTest("only_filename.txt", 400);

    // Empty filename (space at start implies filename is "")
    AddFileTest(" ContentWithNoName", 400);

    // Filename contains null character
    // We construct a string with explicit length to include \0
    string nullNameArgs("file\0name.txt content", 20);
    AddFileTest(nullNameArgs, 400);

    // Filename contains forbidden characters (tab or newline)
    // Note: spaces in filename are naturally impossible with the current split logic, 
    // but tabs/newlines are caught by isValid.
    AddFileTest("file\tname.txt content", 400);
    AddFileTest("file\nname.txt content", 400);
}

// 4. Edge Cases
TEST_F(AddCommandTest, EdgeCases) {
    // Very long content
    string longContent(1000, 'A');
    AddFileTest("long.txt " + longContent, 201);

    // Filename with allowed special characters
    AddFileTest("specials!@#$%.txt content", 201);

    // Content with spaces
    AddFileTest("spaces.txt content with many spaces", 201);
}