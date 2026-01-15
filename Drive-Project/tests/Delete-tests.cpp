#include "gtest/gtest.h"
#include "DeleteCommand.h"
#include "IdataBaseHandler.h"
#include <string>
#include <vector>
#include <map>

using namespace std;

// --- Mocks ---

class MockDataBaseHandlerDelete : public IdataBaseHandler {
public:
    map<string, string> storedFiles; 
    
    bool isExists(const string fileName) override {
        return storedFiles.find(fileName) != storedFiles.end();
    }

    bool deleteFile(const string fileName) override {
        return storedFiles.erase(fileName) > 0;
    }

    // Unused
    bool insertFile(const string, const string, const filesystem::path) override { return true; }
    vector<string> getAllFileNames() override { return {}; }
    string getContent(const string) override { return ""; }
};

// --- Fixture ---

class DeleteCommandTest : public ::testing::Test {
protected:
    MockDataBaseHandlerDelete* mockDB;
    DeleteCommand* deleteCmd;

    void SetUp() override {
        mockDB = new MockDataBaseHandlerDelete();
        deleteCmd = new DeleteCommand(mockDB); 
    }

    void TearDown() override {
        delete deleteCmd;
        delete mockDB;
    }
};

// --- Tests ---

TEST_F(DeleteCommandTest, SanityDelete) {
    mockDB->storedFiles["junk.txt"] = "rubbish";
    
    // Expect 204 No Content for successful delete
    pair<int, string> result = deleteCmd->execute("junk.txt");
    EXPECT_EQ(result.first, 204);
    
    // Verify it's actually gone from the mock
    EXPECT_FALSE(mockDB->isExists("junk.txt"));
}

TEST_F(DeleteCommandTest, DeleteNonExistent) {
    // Expect 404 Not Found
    pair<int, string> result = deleteCmd->execute("ghost.txt");
    EXPECT_EQ(result.first, 404);
}

TEST_F(DeleteCommandTest, InvalidArguments) {
    // Expect 400 Bad Request
    EXPECT_EQ(deleteCmd->execute("").first, 400);
    EXPECT_EQ(deleteCmd->execute("file with spaces").first, 400);
}