# ☁️ CloudDrive - Google Drive Clone

A full-stack cloud storage application implementing a Google Drive-like service with file management, sharing capabilities, and user authentication. Built as part of the Advanced System Programming course.

**Created by:** Ophir Finchelstein | 216639542

🔗 **Repository:** [GitHub - AdvancedSystemProgramming](https://github.com/shemesh7/AdvancedSystemProgramming)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Design Patterns](#design-patterns)
- [Testing](#testing)
- [Project Structure](#project-structure)

---

## Overview

CloudDrive is a three-tier microservices application that provides cloud file storage. Think of it as your own personal Google Drive - store files, organize them in folders, and share with others.

**Core Capabilities:**
- 📁 **File Operations** - Upload, download, edit, rename, and delete files/folders
- 👥 **Sharing System** - Share files with view/edit permissions
- ⭐ **Organization** - Star favorites, recent files tracking, trash with restore
- 🔍 **Search** - Full-text search across file names and content
- 🗜️ **Compression** - RLE compression for efficient storage

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT CLIENT (Port 3000)                 │
│              User Interface & File Management               │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              NODE.JS WEB SERVER (Port 3000)                 │
│         API Gateway, Authentication & Business Logic        │
│    • User Management    • Permission Control                │
│    • File Metadata      • Search Functionality              │
└──────────────────────────┬──────────────────────────────────┘
                           │ TCP Socket (Binary Protocol)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              C++ STORAGE SERVER (Port 8080)                 │
│            File Persistence & Compression Engine            │
│    • Thread Pool        • RLE Compression                   │
│    • File System I/O    • Concurrent Access Control         │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **React Client** | User interface, authentication flow, file browser UI |
| **Node.js Server** | REST API, user/permission management, file metadata |
| **C++ Server** | Physical file storage, compression, thread management |

**How it works:** The React frontend sends HTTP requests to the Node.js server, which handles user accounts, permissions, and file metadata. When actual file content needs to be stored or retrieved, the Node.js server communicates with the C++ server over TCP sockets.

---

## Features

### 📂 File Management
- Create, upload, download, and delete files
- Create folders and organize files hierarchically
- Rename files and move between folders
- View file details (size, type, dates, owner)

### 👥 Sharing & Permissions
| Permission | Access Level |
|------------|-------------|
| **View** | Read-only access |
| **Edit** | Read + modify access |

- Share files with other users via email
- Owner-only actions: manage permissions, permanent delete
- Remove your own access from shared files

### 🗂️ Organization
- **My Drive** - Files you own
- **Shared with me** - Files others shared with you
- **Starred** - Mark important files as favorites
- **Recent** - Recently accessed files (sorted by access time)
- **Trash** - Soft-deleted files with restore capability

### 🔍 Search
- Search by file name (case-insensitive)
- Full-text content search for text files
- Results filtered by user permissions

### 🎨 UI Features
- List and Grid view modes
- Dark/Light theme toggle
- Multi-select for bulk operations
- Right-click context menu
- Sortable columns (name, date, size)

---

## Technology Stack

### Backend (C++)
| Technology | Purpose |
|------------|---------|
| C++17 | Core language |
| CMake | Build system |
| POSIX Threads | Concurrency (Thread Pool) |
| TCP Sockets | Network communication |
| Google Test | Unit testing |

### Web Server (Node.js)
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js v5.2.1 | Web framework |
| In-memory Maps | Data storage (volatile) |

### Frontend (React)
| Technology | Purpose |
|------------|---------|
| React 18.2.0 | UI framework |
| React Router v7.12.0 | Client-side routing |
| Bootstrap 5.3.8 | Styling |
| Context API | State management |

### DevOps
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |

---

## Installation

### Prerequisites
- Docker and Docker Compose installed
- Git

### 🚀 Quick Start (Docker)

```bash
# 1. Clone the repository
git clone https://github.com/shemesh7/AdvancedSystemProgramming.git
cd AdvancedSystemProgramming

# 2. Build and run
docker-compose up --build

# 3. Open browser at http://localhost:3000
```

### Manual Setup (Development)

#### C++ Server
```bash
cd Drive-Project
mkdir build && cd build
cmake ..
make
./server 8080
```

#### Node.js Server
```bash
cd Drive-Project/webServer
npm install
node app.js
```

#### React Client
```bash
cd Drive-Project/react-client
npm install
npm start
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DRIVE_STORAGE` | `/usr/src/file_storage` | Physical file storage directory |
| `DRIVE_FILE_NAMES` | `/usr/src/file_storage/logical_db` | Metadata storage directory |
| `THREAD_POOL_SIZE` | `10` | Number of worker threads |

---

## Usage

### Getting Started

1. **Register** - Create an account with name, email, password (8+ chars, alphanumeric)
2. **Login** - Enter your credentials to access your drive
3. **Create files** - Click "New" → choose File or Folder
4. **Share** - Right-click a file → Share → Enter email → Choose permission level

### Basic Operations

| Action | How to |
|--------|--------|
| Upload file | Click "New" → File → Enter name and content |
| Create folder | Click "New" → Folder → Enter name |
| Share file | Right-click → Share → Enter email + permission |
| Search | Type in the search bar (searches names and content) |
| Delete | Right-click → Delete (moves to Trash) |
| Restore | Go to Trash → Right-click → Restore |

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users` | Register new user |
| `POST` | `/api/tokens` | Login (returns user ID) |
| `GET` | `/api/users/:id` | Get user information |

### File Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/files` | Get all accessible files |
| `POST` | `/api/files` | Create new file/folder |
| `GET` | `/api/files/:id` | Get file content |
| `PATCH` | `/api/files/:id` | Update file name/content |
| `DELETE` | `/api/files/:id` | Move to trash |
| `DELETE` | `/api/files/:id/permanent` | Permanently delete |

### Special Views

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/files/shared` | Files shared with you |
| `GET` | `/api/files/starred` | Your starred files |
| `GET` | `/api/files/recent` | Recently accessed files |
| `GET` | `/api/files/trash` | Trashed files |
| `DELETE` | `/api/files/trash` | Empty trash |

### File Actions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/files/:id/star` | Toggle star status |
| `POST` | `/api/files/:id/restore` | Restore from trash |
| `DELETE` | `/api/files/:id/access` | Remove your access |

### Permission Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/files/:id/permissions` | Get all permissions |
| `POST` | `/api/files/:id/permissions` | Add permission |
| `PATCH` | `/api/files/:id/permissions/:pid` | Update permission |
| `DELETE` | `/api/files/:id/permissions/:pid` | Remove permission |

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/search/:query` | Search files by name/content |

### Request/Response Examples

**Register User:**
```json
POST /api/users
{
  "name": "John Doe",
  "gmail": "john@example.com",
  "password": "password123",
  "image": "https://example.com/avatar.jpg"
}
```

**Create File:**
```json
POST /api/files
Authorization: Bearer <userID>
{
  "nameOfFile": "document.txt",
  "content": "File content here",
  "isDir": false
}
```

**Share File:**
```json
POST /api/files/1/permissions
Authorization: Bearer <userID>
{
  "email": "friend@example.com",
  "privilege": "edit"
}
```

---

## Design Patterns

### Command Pattern
Each file operation is encapsulated as a command object implementing `ICommand`:
- `AddCommand` - Create/upload files
- `GetCommand` - Retrieve file content
- `DeleteCommand` - Remove files
- `SearchCommand` - Search files

Commands are registered in a map and executed dynamically:
```cpp
map<string, ICommands*> commands;
commands["POST"] = new AddCommand(db, compressor);
commands["GET"] = new GetCommand(db, compressor);
```

### Strategy Pattern
Interchangeable implementations for:
- **Compression:** `Icompressor` → `RLEcompressor`
- **Execution:** `IExecutor` → `ThreadPoolExecutor`, `ClientThreadExecutor`
- **I/O:** `IInput/IOutput` → `CLIManager`, `CSIO`

### Thread Pool Pattern
Fixed-size pool of worker threads handles concurrent client connections efficiently. Uses `SafeQueue` for thread-safe task distribution.

### MVC Pattern (Node.js)
- **Models:** `User`, `FileInfo`, `Permission`, `DataBase`
- **Controllers:** `userController`, `FolderController`, `PermissionController`
- **Routes:** `router.js` with RESTful endpoints

### SOLID Principles Applied
- **Single Responsibility:** Each class has one purpose
- **Open/Closed:** New commands added without modifying existing code
- **Liskov Substitution:** Interfaces allow interchangeable implementations
- **Interface Segregation:** Focused, minimal interfaces
- **Dependency Inversion:** Dependencies injected via constructors

---

## Compression Algorithm

### RLE (Run-Length Encoding)

Files are automatically compressed before storage to save space.

**How it works:**
```
Input:  "AAABBBCCCD"
Output: "3A3B3C1D"
```
Repeated characters are stored as `<count><character>`.

**Implementation:** `src/BackendCommands/RLEcompressor.cpp`

---

## Testing

### Running Tests
```bash
# With Docker
docker-compose run --rm tests

# Manual
cd Drive-Project/build
./runTests
```

### Test Coverage

| Test File | Coverage |
|-----------|----------|
| `tests-compressor.cpp` | RLE compression/decompression |
| `tests-FolderManager.cpp` | File storage operations |
| `tests-CLIManager.cpp` | Command-line parsing |
| `tests-CSIO.cpp` | TCP socket I/O |
| `Add-tests.cpp` | AddCommand functionality |
| `Get-tests.cpp` | GetCommand functionality |
| `Delete-tests.cpp` | DeleteCommand functionality |
| `Search-tests.cpp` | SearchCommand functionality |
| `CommandWrapper-tests.cpp` | Response formatting |

---

## Project Structure

```
Drive-Project/
├── src/
│   ├── ServerMain.cpp              # Server entry point
│   ├── Server.h/cpp                # TCP server implementation
│   ├── Client.h/cpp                # C++ test client
│   ├── App.h/cpp                   # Command dispatcher
│   │
│   ├── UserCommands/               # Command implementations
│   │   ├── Icommand.h              # Command interface
│   │   ├── AddCommand.h/cpp        # POST - File creation
│   │   ├── GetCommand.h/cpp        # GET - File retrieval
│   │   ├── DeleteCommand.h/cpp     # DELETE - File deletion
│   │   └── SearchCommand.h/cpp     # SEARCH - File search
│   │
│   ├── BackendCommands/            # Infrastructure
│   │   ├── FolderManager.h/cpp     # File system storage with reader-writer locks
│   │   ├── RLEcompressor.h/cpp     # Compression algorithm
│   │   ├── ThreadPool.h/cpp        # Thread pool implementation
│   │   ├── ThreadPoolExecutor.h/cpp# Executor using thread pool
│   │   └── SafeQueue.h/cpp         # Thread-safe FIFO queue
│   │
│   └── IO/                         # Input/Output abstraction
│       ├── CLIManager.h/cpp        # Console I/O
│       ├── CSIO.h/cpp              # Socket I/O (Client-Server)
│       └── CommandWrapper.h/cpp    # Response formatting
│
├── webServer/
│   ├── app.js                      # Express server entry point
│   ├── routes/
│   │   ├── router.js               # API route definitions
│   │   └── authorizer.js           # Auth middleware
│   ├── controllers/
│   │   ├── userController.js       # User registration/login
│   │   ├── FolderController.js     # File CRUD operations
│   │   ├── PermissionController.js # Permission management
│   │   └── SearchController.js     # Search functionality
│   └── models/
│       ├── DataBase.js             # In-memory database singleton
│       ├── user.js                 # User model
│       ├── FileInfo.js             # File metadata model
│       ├── Permission.js           # Permission model
│       └── webClient.js            # TCP client to C++ server
│
├── react-client/
│   └── src/
│       ├── App.js                  # Root component with routing
│       ├── Login.js                # Login page
│       ├── Register.js             # Registration page
│       ├── api.js                  # API client wrapper
│       └── Home-Components/
│           ├── Home.js             # Main dashboard
│           ├── Header.js           # Navigation header
│           ├── Sidebar.js          # Side navigation
│           ├── FileList.js         # File display (list/grid)
│           ├── ContextMenu.js      # Right-click menu
│           ├── DetailsPanel.js     # File details sidebar
│           └── modals/             # Dialog components
│
├── tests/                          # Google Test unit tests
├── CMakeLists.txt                  # CMake build configuration
├── Dockerfile                      # C++ server container
├── docker-compose.yml              # Multi-container setup
└── README.md
```

---

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `server` | 8080 | C++ storage server |
| `web-server` | 3000 | Node.js API server |
| `client-cpp` | - | C++ test client |
| `client-py` | - | Python test client |
| `tests` | - | Unit test runner |

### Docker Commands

```bash
# Start all services
docker-compose up

# Rebuild and start
docker-compose up --build

# Run tests only
docker-compose run --rm tests

# Stop all services
docker-compose down

# View logs
docker-compose logs -f web-server
```

---

## Security Notes

⚠️ **Current Implementation (Educational Purpose):**
- Passwords stored as plain text
- User ID used as authentication token
- In-memory database (data lost on restart)

**For Production, consider:**
- bcrypt/argon2 for password hashing
- JWT with expiration
- HTTPS/TLS encryption
- Persistent database (MongoDB/PostgreSQL)
- Rate limiting and input sanitization

---

## License

This project was developed as part of the **Advanced System Programming** course.
