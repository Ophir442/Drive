#ifndef RLECOMPRESSOR_H
#define RLECOMPRESSOR_H

#include "Icompressor.h"
#include <string>

using namespace std;

class RLEcompressor: public Icompressor {
    public:
    
    // Returns the compressed content
    string compressFile(string unCompressedContent) override;
    
    // Returns the decompressed content
    string decompressFile(string compressedContent) override;
    
    // virtual destructor
    ~RLEcompressor() override = default;
};

#endif