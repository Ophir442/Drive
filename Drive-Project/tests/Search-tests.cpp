#include <gtest/gtest.h>
#include "SearchCommand.h"
#include "IdataBaseHandler.h"
#include "Icompressor.h"
#include <string>
#include <vector>
#include <map>

using namespace std;

// --- Mocks ---

class MockDataBaseHandlerSearch : public IdataBaseHandler {
public:
    map<string, string> storedFiles; 
    
    vector<string> getAllFileNames() override { 
        vector<string> names;
        for(auto const& [key, val] : storedFiles) {
            names.push_back(key);
        }
        return names;
    }

    string getContent(const string fileName) override {
        return storedFiles[fileName];
    }

    // Unused
    bool isExists(const string) override { return false; }
    bool insertFile(const string, const string, const filesystem::path) override { return true; }
    bool deleteFile(const string) override { return false; }
};

class MockCompressorSearch : public Icompressor {
    public:
        string decompressFile(string compressedContent) override {
            // Simple pass-through or mock logic
            return compressedContent; 
        }
        // Unused
        string compressFile(string) override { return ""; }
};

// --- Fixture ---

class SearchCommandTest : public ::testing::Test {
protected:
    MockDataBaseHandlerSearch* mockDB;
    MockCompressorSearch* mockCompressor;
    SearchCommand* searchCmd;

    void SetUp() override {
        mockDB = new MockDataBaseHandlerSearch();
        mockCompressor = new MockCompressorSearch();
        searchCmd = new SearchCommand(mockDB, mockCompressor); 
    }

    void TearDown() override {
        delete searchCmd;
        delete mockDB;
        delete mockCompressor;
    }
};

// --- Tests ---

TEST_F(SearchCommandTest, FoundInFilename) {
    mockDB->storedFiles["apple.txt"] = "some content";
    mockDB->storedFiles["banana.txt"] = "other content";
    
    pair<int, string> result = searchCmd->execute("apple");
    
    EXPECT_EQ(result.first, 200);
    // Note: SearchCommand accumulates results. 
    // If order matters, implementation iterates map (usually sorted by key).
    EXPECT_NE(result.second.find("apple.txt"), string::npos);
}

TEST_F(SearchCommandTest, FoundInContent) {
    mockDB->storedFiles["doc1.txt"] = "hidden treasure inside";
    mockDB->storedFiles["doc2.txt"] = "nothing here";
    
    pair<int, string> result = searchCmd->execute("treasure");
    
    EXPECT_EQ(result.first, 200);
    EXPECT_EQ(result.second, "doc1.txt");
}

TEST_F(SearchCommandTest, MultipleMatches) {
    mockDB->storedFiles["test1.txt"] = "common";
    mockDB->storedFiles["test2.txt"] = "common";
    
    pair<int, string> result = searchCmd->execute("common");
    
    EXPECT_EQ(result.first, 200);
    // Should contain both, separated by space
    EXPECT_TRUE(result.second == "test1.txt test2.txt" || result.second == "test2.txt test1.txt");
}

TEST_F(SearchCommandTest, NotFound) {
    mockDB->storedFiles["a.txt"] = "abc";
    
    pair<int, string> result = searchCmd->execute("xyz");
    
    EXPECT_EQ(result.first, 200);
    EXPECT_EQ(result.second, ""); // Empty string if nothing found
}

TEST_F(SearchCommandTest, InvalidArgs) {
    pair<int, string> result = searchCmd->execute("");
    EXPECT_EQ(result.first, 400);
}