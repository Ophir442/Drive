#ifndef ICOMPRESSOR_H
#define ICOMPRESSOR_H

#include <string>
using namespace std;

// Interface declaration
class Icompressor {
public:
    
    // Compresses file content and returns the compressed content.
    virtual string compressFile(string unCompressedContent) = 0; 
    
    // Decompresses file content returns the decompressed content.
    virtual string decompressFile(string compressedContent) = 0;

    // no need for constructor in Interfaces.
    // virtual destructor (every Interface should have a virtual destructor)
    virtual ~Icompressor() = default;
};

#endif