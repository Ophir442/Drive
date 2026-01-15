#include <gtest/gtest.h>
#include "FolderManager.h"
#include <filesystem>
#include <fstream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;
namespace fs = std::filesystem;

class FolderManagerTest : public ::testing::Test {
protected:
    FolderManager* folderManager;
    fs::path testStoragePath;
    fs::path testLogicalPath;

    void SetUp() override {
        // Define paths for test environment
        testStoragePath = "./test_fm_storage";
        testLogicalPath = "./test_fm_logical";
        
        // Ensure clean state
        if (fs::exists(testStoragePath)) fs::remove_all(testStoragePath);
        if (fs::exists(testLogicalPath)) fs::remove_all(testLogicalPath);
        
        fs::create_directories(testStoragePath);
        fs::create_directories(testLogicalPath);
        
        // Initialize FolderManager
        folderManager = new FolderManager(testStoragePath, testLogicalPath);
    }

    void TearDown() override {
        delete folderManager;
        fs::remove_all(testStoragePath);
        fs::remove_all(testLogicalPath);
    }
};

// Deletion
TEST_F(FolderManagerTest, DeleteFile) {
    string fileName = "todelete.txt";
    folderManager->insertFile(fileName, "data", "");
    
    EXPECT_TRUE(folderManager->isExists(fileName));
    
    EXPECT_TRUE(folderManager->deleteFile(fileName));
    EXPECT_FALSE(folderManager->isExists(fileName));
    
    // Deleting non-existent file
    EXPECT_FALSE(folderManager->deleteFile(fileName));
}

// Get All File Names
TEST_F(FolderManagerTest, GetAllFileNames) {
    vector<string> expected = {"a.txt", "b.txt", "c.txt"};
    
    for(const string& name : expected) {
        folderManager->insertFile(name, "content", "");
    }
    
    vector<string> actual = folderManager->getAllFileNames();
    
    // Sort both to ensure order-independent comparison
    sort(expected.begin(), expected.end());
    sort(actual.begin(), actual.end());
    
    EXPECT_EQ(actual, expected);
}

// Error Handling
TEST_F(FolderManagerTest, GetNonExistentContent) {
    // getContent throws exception if file doesn't exist
    EXPECT_THROW(folderManager->getContent("ghost.txt"), std::exception);
}