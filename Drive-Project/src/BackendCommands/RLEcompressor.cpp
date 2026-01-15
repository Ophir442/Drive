#include "RLEcompressor.h"
#include "Icompressor.h"

using namespace std;

string RLEcompressor::compressFile(string unCompressedContent) {
    string compressedContent; // Resulting compressed string
    int n = unCompressedContent.length();
    for (int i = 0; i < n; ) {
        char currentChar = unCompressedContent[i]; // Current character to be processed
        int count = 1; // count represents the number of occurrences of the current character
        // Count consecutive occurrences of currentChar
        while (i + 1 < n && unCompressedContent[i] == unCompressedContent[i + 1]) {
            count++;
            i++;
        }
        /* Append count, "/" and currentChar to the compressed content 
        We use "/" as a delimiter between count and character
        This helps distinguish between a character that is a number, 
        and a number that represents a quantity of characters */
        compressedContent +=  to_string(count) + "/" + currentChar; // e.g., "4/A"
        i++; // Move to the next new character
    }
    return compressedContent;
}
string RLEcompressor::decompressFile(string compressedContent) {
    string decompressed; // Resulting decompressed string
    int n = compressedContent.length();
    for (int i = 0; i < n; ) {
        string countStr; // To store the count as a string, and then extract the count (which may be more than one digit)
        // Extract count (number before the '/')
        while (i < n && isdigit(compressedContent[i])) {
            countStr += compressedContent[i];
            i++;
        }
        i++; // Skip the '/' character
        char currentChar = compressedContent[i]; // The character to be repeated
        int count = stoi(countStr); // Convert count string to integer
        decompressed.append(count, currentChar); // Add currentChar 'count' times to the decompressed content
        i++; // Move to the next segment
    }
    return decompressed;
};