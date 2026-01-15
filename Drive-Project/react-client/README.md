# Advanced System Programming - Exercise 4 (React Google Drive Clone)

## Description
In this exercise, we built a **React Web Application** that serves as a Google Drive clone. The application communicates with the Node.js Web Server from Exercise 3, displaying real and dynamic data while supporting multiple users with JWT authentication.

The goal was to create a fully functional file management system that mirrors the Google Drive experience as closely as possible.

### Key Technologies
* **React** - Frontend framework with components, hooks (useState, useRef), and React Router
* **CSS/Bootstrap** - Styling inspired by Google Drive's visual design
* **JWT Authentication** - Secure user authentication with token-based authorization
* **RESTful API** - Communication with the Ex3 Node.js server

## Project Structure
```
react-client/
├── src/
│   ├── Home-Components/
│   │   ├── Home.js          # Main dashboard component
│   │   ├── Home.css         # Styles for the home page
│   │   ├── Header.js        # Top navigation bar
│   │   ├── Sidebar.js       # Left navigation menu
│   │   ├── FileList.js      # File/folder display component
│   │   ├── ContextMenu.js   # Right-click context menu
│   │   ├── DetailsPanel.js  # File details sidebar
│   │   ├── Icon.js          # Google Material Icons component
│   │   ├── index.js         # Component exports
│   │   └── modals/
│   │       ├── Modal.js         # Base modal component
│   │       ├── FileModal.js     # File viewer/editor modal
│   │       ├── NewItemModal.js  # Create file/folder modal
│   │       ├── ShareModal.js    # Share permissions modal
│   │       ├── MoveModal.js     # Move file/folder modal
│   │       ├── RenameModal.js   # Rename modal
│   │       └── index.js         # Modal exports
│   ├── App.js              # Main app with routing and context
│   ├── App.css             # Global app styles
│   ├── Login.js            # Login screen component
│   ├── Register.js         # Registration screen component
│   ├── api.js              # API service for server communication
│   ├── index.js            # App entry point
│   └── index.css           # Global styles
├── public/
│   └── index.html
├── Dockerfile
└── package.json
```

## Features Implemented

### Authentication
- **Login Screen** - Email and password authentication
- **Registration Screen** - User registration with name, email, password, and profile image
- **Input Validation** - Password must be at least 8 characters with only letters and numbers
- **JWT Token** - Secure token-based authentication for all API requests
- **Protected Routes** - Unauthorized users are redirected to login

### Main Dashboard (Google Drive Clone)
- **Top Menu Bar**
  - Search functionality with real-time results
  - User profile display (name and image)
  - Dark/Light mode toggle
  - Logout option

- **Side Menu**
  - Home view with suggested folders and recent files
  - My Drive - browse all files and folders
  - Shared with me - files shared by other users
  - Recent - recently accessed files
  - Starred - favorite files
  - Trash - deleted files with restore/permanent delete options

### File Operations
- **View Files** - Display text files, images, and PDFs
- **Create** - New files and folders
- **Upload** - Upload images and PDF files
- **Edit** - Edit text file content
- **Rename** - Rename files and folders
- **Move** - Move items between folders
- **Delete** - Move to trash (soft delete)
- **Restore** - Restore from trash
- **Permanent Delete** - Permanently remove files
- **Star/Unstar** - Mark files as favorites
- **Share** - Grant view/edit permissions to other users

### UI Features
- **List/Grid View** - Toggle between view modes
- **Drag & Drop** - Move files by dragging to folders
- **Context Menu** - Right-click menu for file operations
- **Details Panel** - View file information (size, owner, dates)
- **Keyboard Shortcuts** - Arrow keys, Enter, Delete, F2, Ctrl+I
- **Dark/Light Theme** - Toggle application theme

## How to Build and Run

### Prerequisites
- Docker and Docker Compose installed

### 1. Build and Run the Entire System
From the root project directory:

**First time (build all containers):**
```bash
docker-compose up --build
```

**Subsequent runs:**
```bash
docker-compose up
```

This starts three services:
- **C++ Storage Server** (port 8080) - File storage backend
- **Node.js Web Server** (port 3000) - REST API
- **React Client** (port 3001) - Web application

### 2. Access the Application
Open your browser and navigate to:
```
http://localhost:3001
```

## Usage Examples

### 1. Register a New User
- Click "Create account" on the login page
- Fill in: Display name, Email, Password (min 8 chars, letters/numbers only)
- Optionally upload a profile picture
- Click "Create Account"

### 2. Login
- Enter your registered email and password
- Click "Sign in"

### 3. Create a File/Folder
- Click the "+ New" button in the sidebar
- Choose "New folder" or "New file"
- For files: create empty or upload an image/PDF

### 4. Share a File
- Right-click on a file
- Select "Share"
- Enter the email of the user to share with
- Select permission level (View/Edit)

### 5. Toggle Dark Mode
- Click the moon/sun icon in the top menu bar

## Screenshots

### Login Screen
The login screen features Google Drive-inspired design with email and password fields.

### Main Dashboard
The main view displays files and folders with a sidebar for navigation and a top bar for search and user options.

### File Viewer
Files open in a modal with options to edit (text files), download (images/PDFs), and manage.

## Design Decisions

### Component Architecture
We followed React best practices by dividing the application into reusable components:
- **Context Providers** - Theme and Auth contexts for global state
- **Custom Hooks** - useState and useRef for local state management
- **React Router** - Single-page application with client-side routing

### API Communication
All data is fetched from the server - no hardcoded data:
- Files and folders come from `/api/files`
- User authentication via `/api/tokens`
- All operations (create, update, delete) go through the API

### Security
- JWT tokens stored in localStorage
- Token attached to all API requests via Authorization header
- Protected routes redirect unauthenticated users
- Input validation on both client and server side

## Notes
- The application requires the Node.js server (Ex3) to be running
- All file data is stored on the C++ storage server
- Profile images are stored as base64 in the user data
