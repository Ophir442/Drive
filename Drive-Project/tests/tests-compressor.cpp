#include <gtest/gtest.h>
#include "RLEcompressor.h"
#include <string>

using namespace std;

// Fixture Class (Setup/Teardown)
class RLECompressorTest : public ::testing::Test {
protected:
    RLEcompressor* compressor;
    void SetUp() override { compressor = new RLEcompressor(); }
    void TearDown() override { delete compressor; }
};

// --- Test Cases ---

// 1. Basic Functionality
TEST_F(RLECompressorTest, StandardCompression) {
    EXPECT_EQ(compressor->compressFile("AAA"), "3/A");           
    EXPECT_EQ(compressor->decompressFile("3/A"), "AAA");

    EXPECT_EQ(compressor->compressFile("AABBBC"), "2/A3/B1/C");  
    EXPECT_EQ(compressor->decompressFile("2/A3/B1/C"), "AABBBC");

    EXPECT_EQ(compressor->compressFile("WWWWBBBWWB"), "4/W3/B2/W1/B");
    EXPECT_EQ(compressor->decompressFile("4/W3/B2/W1/B"), "WWWWBBBWWB");

    EXPECT_EQ(compressor->compressFile("Z"), "1/Z");
    EXPECT_EQ(compressor->decompressFile("1/Z"), "Z");
}

// 2. Special Characters
TEST_F(RLECompressorTest, SpecialCharacters) {
    EXPECT_EQ(compressor->compressFile("11"), "2/1"); 
    EXPECT_EQ(compressor->decompressFile("2/1"), "11");

    EXPECT_EQ(compressor->compressFile("///"), "3//");
    EXPECT_EQ(compressor->decompressFile("3//"), "///");

    EXPECT_EQ(compressor->compressFile("   "), "3/ ");
    EXPECT_EQ(compressor->decompressFile("3/ "), "   ");

    EXPECT_EQ(compressor->compressFile("  \t\n"), "2/ 1/\t1/\n");
    EXPECT_EQ(compressor->decompressFile("2/ 1/\t1/\n"), "  \t\n");

    EXPECT_EQ(compressor->compressFile("@#$"), "1/@1/#1/$");
    EXPECT_EQ(compressor->decompressFile("1/@1/#1/$"), "@#$");
}

// 3. Edge Cases & Stress Tests
TEST_F(RLECompressorTest, ComplexScenarios) {
    EXPECT_EQ(compressor->compressFile(""), "");
    EXPECT_EQ(compressor->decompressFile(""), "");

    EXPECT_EQ(compressor->compressFile("111111111111"), "12/1");
    EXPECT_EQ(compressor->decompressFile("12/1"), "111111111111");

    EXPECT_EQ(compressor->compressFile("1212122222222221111111111121212"), "1/11/21/11/21/110/211/11/21/11/21/11/2");
    EXPECT_EQ(compressor->decompressFile("1/11/21/11/21/110/211/11/21/11/21/11/2"), "1212122222222221111111111121212");

    EXPECT_EQ(compressor->compressFile("1212"), "1/11/21/11/2");
    EXPECT_EQ(compressor->decompressFile("1/11/21/11/2"), "1212");

    // Null Character Handling
    string withNull(3, 'A'); withNull[1] = '\0'; // "A\0A"
    string expectedNull = "1/A1/"; expectedNull += '\0'; expectedNull += "1/A";

    EXPECT_EQ(compressor->compressFile(withNull), expectedNull);
    EXPECT_EQ(compressor->decompressFile(expectedNull), withNull);
}

// 4. Integration
TEST_F(RLECompressorTest, RoundTripIntegrity) {
    string heavyString = "WWWWBBBWWB1212///   ";
    string compressed = compressor->compressFile(heavyString);
    string decompressed = compressor->decompressFile(compressed);
    
    EXPECT_EQ(decompressed, heavyString);
}