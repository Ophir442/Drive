cmake_minimum_required(VERSION 3.14)
project(MyProject)

# GoogleTest requires at least C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/03597a01ee50ed33e9dfd640b249b4be3799d395.zip
)
# For Windows: Prevent overriding the parent project's compiler/linker settings
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# Include the directory for your source files
include_directories(src/BackendCommands src/UserCommands src/IO src)



# --- Target 1: Server ---
add_executable(server
  src/ServerMain.cpp
  src/Server.cpp

  src/App.cpp

  src/BackendCommands/RLEcompressor.cpp
  src/BackendCommands/FolderManager.cpp
  src/BackendCommands/ClientThreadExecutor.cpp
  src/BackendCommands/ThreadPoolExecutor.cpp
  src/BackendCommands/ThreadPool.cpp
  src/BackendCommands/SafeQueue.cpp
  src/IO/CLIManager.cpp
  src/IO/CSIO.cpp
  src/IO/CommandWrapper.cpp

  src/UserCommands/AddCommand.cpp
  src/UserCommands/GetCommand.cpp
  src/UserCommands/SearchCommand.cpp
  src/UserCommands/DeleteCommand.cpp
)

# --- Target 2: Client cpp ---
add_executable(client_cpp
  src/Client.cpp
  src/IO/CLIManager.cpp
)

#client python is already compiled, no need to add here

# --- Target 3: The Tests ---

add_executable(runTests
    # RLEcompressor tests
    src/BackendCommands/RLEcompressor.cpp
    tests/tests-compressor.cpp

    # FileHandler tests 
    src/BackendCommands/FolderManager.cpp
    tests/tests-FolderManager.cpp

    # CLIManager tests
    src/IO/CLIManager.cpp
    tests/tests-CLIManager.cpp

    # CSIO tests
    src/IO/CSIO.cpp
    tests/tests-CSIO.cpp

    # AddCommand tests
    src/UserCommands/AddCommand.cpp
    tests/Add-tests.cpp

    # GetCommand tests
    src/UserCommands/GetCommand.cpp
    tests/Get-tests.cpp

    #SearchCommand tests
    src/UserCommands/SearchCommand.cpp
    tests/Search-tests.cpp

    # DeleteCommand tests
    src/UserCommands/DeleteCommand.cpp
    tests/Delete-tests.cpp

    # server tests
    src/Server.cpp
    # tests/Server-tests.cpp

    # command wrapper tests
    src/IO/CommandWrapper.cpp
    tests/CommandWrapper-tests.cpp

    # extra files needed for testing
    src/IO/CSIO.cpp
    src/App.cpp
    src/BackendCommands/ClientThreadExecutor.cpp
)

target_link_libraries(runTests gtest_main)