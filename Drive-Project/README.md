# Advanced System Programming - Exercise 1 (RLE Compression)

## Description
This is a CLI program that lets you save files with compression. We used the *RLE* algorithm to compress text.

We built the project using *C++, **CMake, and **Docker. We also followed **SOLID principles* and *Loose Coupling* to make sure the code is easy to change later(you will see it soon).

## Project Structure
* src/: The main source code, organized into folders:
    * UserCommands/: Contains the logic for the add, get, and search commands.
    * BackendCommands/: Contains the logic for saving files (FolderManager) and the compression algorithm (RLE).
    * IO/: Handles user input and printing to the screen (CLIManager).
* tests/: Unit tests (using Google Test).
* realStorage/: The folder where files are actually saved on your computer (But we also save your files on the docker container so that they are safe and sound.)

## How to Build and Run
### build the image:
```bash
docker-compose up --build app
```
Note: maybe after the build command you will need to press Ctrl+c (to stop the proccess) and then after you will be able to enter the run command.

### run the app in the container:
```bash
docker-compose run --rm app
```
and you are all set to go!


### A run exampale to show how it should look like:

```bash
hello
add hello1 hello
get hel
get hello1
hello
search h
hello1
add hello2 h e l l o
get hello2
h e l l o
search
search
hello2
search h
hello1
hello2
get  hello1

```


# Advanced System Programming - Updated to Ex2

## Description
This project implements a **Multi-threaded TCP File Storage Server** supporting concurrent connections from both **C++** and **Python** clients.

* **Server (C++)**: Handles business logic, file management, and compression (RLE). Supports multiple clients via threads.
* **Clients**: Connect via TCP to use (`POST`, `GET`, `DELETE`, `SEARCH`) commands to upload, retrieve, delete, and search for files.

We kept stricting to **SOLID principles** and **Loose Coupling** as we tried to do in (Ex1), ensuring a smooth transition from a local CLI (Ex1) to a networked server (Ex2).

## Project Structure
* `src/`:
    * `Server.cpp` / `Client.cpp` / `Client.py`: Network implementation.
    * `UserCommands/`: Logic for `POST`, `GET`, `DELETE`, `SEARCH` (Command Pattern).
    * `BackendCommands/`: File handling and RLE compression.
    * `IO/`: Input/Output abstraction (`Iinput`, `Ioutput`), Socket and wrappers.
* `tests/`: Unit tests.
* `realStorage/`: Persistent storage directory.

## Design Principles

Here is how our design from Exercise 1 supported the changes required for Exercise 2 without modifying "closed" code (Open/Closed Principle):

**1. Did changing command names (e.g., `add` -> `POST`) require touching "closed" code?**
* **No.** We utilized the **Command Pattern** with a registry map. We only needed to update the string key in the registration phase. The core execution logic (the **Invoker**) remained unchanged.

**2. Did adding new commands (`DELETE`) require touching "closed" code?**
* **No.** We simply created a new `DeleteCommand` class that implements our `Icommand` interface and registered it. The existing system logic treats it just like any other command.

**3. Did changing the output format (e.g., status codes) require touching "closed" code?**
* **No.** We only modified the specific **Concrete Command** classes (e.g., `AddCommand`) to update their return strings. The **Invoker/Server** code, which is intended to be "closed," remained untouched because it blindly transmits whatever the command returns without parsing it.

**4. Did switching from Console I/O to Socket I/O require touching "closed" code?**
* **No.** We relied on `Iinput` and `Ioutput` interfaces in Ex1. For Ex2, we implemented a Socket-based IO class (`CSIO`) and injected it into the commands. The commands interact with the interface, unaware of the underlying change from console to network.

## How to Build and Run

### 1. Run the Clients and Server
```bash
docker-compose up --build
docker-compose run --rm client-cpp
docker-compose run --rm client-py
``` 

### A run exampale to show how it should look like:

here is an example of parallel clients working together with the server:

![](parallel-clients-example.jpeg)

And here is an example of one client working with the server:

```
docker-compose run --rm client-cpp

search non existing content
200 Ok

get wohoooo!
404 Not Found
get go
404 Not Found
post go 
201 Created
get go
200 Ok

delete go
204 No Content
get go
404 Not Found
poST go asdfdsg asdfsadfasfasdf
201 Created
search g
200 Ok

123 bvdfgffg fff fileennn g gg go my some testingthe
```


# Advanced System Programming - Updated to Ex3

## Description
In this exercise, we upgraded our project from a TCP server to a complete **Full-Stack System**. We built a **RESTful Web Server** using **Node.js** that acts as the frontend API, while keeping our robust **C++ Server** (from Ex2) as the storage backend.

### Version Control & Branching Strategy
To ensure stability and keep our previous work (Ex2) safe, we followed standard version control practices:

* **Dedicated Branch (`main-Part-3`)**: Instead of overwriting the working code from the previous assignment, we created a new branch named `main-Part-3` for the Web Server implementation.
* **Safety**: This allowed us to develop the Node.js layer and experiment with the MVC architecture without the risk of breaking the stable C++ TCP Server.
* **Isolation**: By separating the new `webServer` folder from the existing `src` folder, we ensured that the core C++ logic remained untouched and functional, effectively applying the *Open/Closed Principle* at the repository level.

* **Web Server (Node.js & Express)**: Handles HTTP requests, manages Users/Permissions, and communicates with the C++ server.
* **Storage Server (C++)**: Handles the actual file persistence and compression (RLE) using threads.
* **Architecture**: We implemented an **MVC** (Model-View-Controller) architecture to separate the HTTP handling, business logic, and data management.

## Project Structure
The project is divided into two main components:

* `webServer/`: The Node.js application.
    * `controllers/`: Handles the request logic.
    * `models/`: Data logic and database management.
    * `routes/`: API endpoint definitions and middleware.
    * `app.js`: The entry point for the Express server.
* `src/`: The C++ Server implementation.
    * `Server.cpp` / `Server.h`: Main server loop and connection handling.
    * `UserCommands/`: Logic for commands like `POST`, `GET`, `DELETE`.
    * `BackendCommands/`: File management and Compression.
    * `IO/`: Socket communication wrapper.
* `realStorage/`: Persistent storage directory.

## Key Design Choices & Architecture

### 1. The Architecture Flow (Microservices Style)
We built a layered system where each part has a specific job:
1.  **Client**: Sends HTTP requests to our Web Server.
2.  **Node.js (API Gateway)**: Acts as the "Manager". It authenticates users and verifies permissions via the `PermissionController` and `authorizer` middleware.
3.  **The Bridge (WebClient)**: If the request is valid, Node.js opens a TCP socket to the C++ server using the `WebClient` model, treating the C++ server as a microservice.
4.  **C++ Server**: The "Worker". It receives simple text commands and handles the I/O operations (writing/reading files).

### 2. Permissions & Security
We added a security layer entirely within the Node.js application:
* **Logic**: Before any operation (like deleting a file), the `PermissionController` checks if the requesting user (identified by `userID` header) has the required role (`View` or `Edit`).
* **Efficiency**: This check happens in memory (Node.js). If a user lacks permission, the request is rejected immediately, without ever bothering the C++ server.

## How to Build and Run

### 1. Build via Docker
To build and run the entire system (Web Server + C++ Server):
For first time use:
```bash
docker-compose up --build
```
For second+ time use:
```bash
docker-compose up
```

And after that just open a new terminal and run the curl commands : )


### A run exampale to show how it should look like:

Below is a recorded session demonstrating the system's capabilities, including user registration, file management, and permission enforcement.

**1. Register User "Bob"**
```bash
curl -i -X POST http://localhost:3000/api/users \
-H "Content-Type: application/json" \
-d '{"name": "Bob", "gmail": "bob@example.com", "password": "bobpass", "image": "bob.png"}'
```
Response:
```HTTP
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 25
ETag: W/"19-VlT9+ePzcAqsAO2Nc5VR7vY+jnk"
Date: Sat, 27 Dec 2025 16:43:49 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"message":"201 Created"}
```
2. Register User "Charlie"
```bash
curl -i -X POST http://localhost:3000/api/users \
-H "Content-Type: application/json" \
-d '{"name": "Charlie", "gmail": "charlie@example.com", "password": "charliepass", "image": "charlie.png"}'
```
Response:
```HTTP
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 25
ETag: W/"19-VlT9+ePzcAqsAO2Nc5VR7vY+jnk"
Date: Sat, 27 Dec 2025 16:44:08 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"message":"201 Created"}
```
3. Login as Bob (to get User ID)
```bash
curl -i -X POST http://localhost:3000/api/tokens \
-H "Content-Type: application/json" \
-d '{"gmail": "bob@example.com", "password": "bobpass"}'
```
Response:
```HTTP
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 12
ETag: W/"c-30g1PsOUXVKHhhSY73JS2x0bP2g"
Date: Sat, 27 Dec 2025 16:44:57 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"userID":1}
```
4. Bob (ID 1) Creates a File
```bash
curl -i -X POST http://localhost:3000/api/files \
-H "Content-Type: application/json" \
-H "x-user-id: 1" \
-d '{"nameOfFile": "project.txt", "content": "Top secret project info", "isDir": false}'
```
Response:
```HTTP
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 58
ETag: W/"3a-7JGmXR+4UEYZBT+KQRi0yVx5Rtw"
Date: Sat, 27 Dec 2025 16:45:30 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"FID":1,"name":"project.txt","isDir":false,"ownerID":"1"}
```
5. Unauthorized User (ID 2) Tries to Grant Permission
```bash
curl -i -X POST http://localhost:3000/api/files/1/permissions \
-H "Content-Type: application/json" \
-H "x-user-id: 2" \
-d '{"PuserID": 3, "role": "view"}'
```
Response:
```HTTP
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 27
ETag: W/"1b-jCX6s13nU50BXGFcEYfOShVHTH8"
Date: Sat, 27 Dec 2025 16:45:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"message":"Access Denied"}
```
6. Bob (ID 1) Grants "View" Permission to User 3
```bash
curl -i -X POST http://localhost:3000/api/files/1/permissions \
-H "Content-Type: application/json" \
-H "x-user-id: 1" \
-d '{"PuserID": 3, "role": "view"}'
```
Response:
```HTTP
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 45
ETag: W/"2d-4IwTKJHdAHt00I4RGDPOrBS+h5Q"
Date: Sat, 27 Dec 2025 16:46:16 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"pid":2,"fileID":1,"userID":3,"role":"view"}
```
7. User 2 Tries to View the File (Without Permission)
```bash
curl -i -X GET http://localhost:3000/api/files/1 \
-H "x-user-id: 2"
```
Response:
```HTTP
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 69
ETag: W/"45-ybViNVti91X+KUWuWYnoErNW+mg"
Date: Sat, 27 Dec 2025 16:47:05 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"message":"Forbidden: You do not have permission to view this file"}
```
8. Bob (ID 1) Grants "View" Permission to User 2
```bash
curl -i -X POST http://localhost:3000/api/files/1/permissions \
-H "Content-Type: application/json" \
-H "x-user-id: 1" \
-d '{"PuserID": 2, "role": "view"}'
```
Response:
```HTTP
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 45
ETag: W/"2d-63F5r0+0/C3bHqn3UfImDRR2WfI"
Date: Sat, 27 Dec 2025 16:48:35 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"pid":3,"fileID":1,"userID":2,"role":"view"}
```
9. User 2 Views the File (Now Authorized)
```bash
curl -i -X GET http://localhost:3000/api/files/1 \
-H "x-user-id: 2"
```
Response:
```HTTP
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 37
ETag: W/"25-caU0oHqdBiEgYciht8Wu9kftJqc"
Date: Sat, 27 Dec 2025 16:48:47 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"content":"Top secret project info"}
```
10. User 2 Tries to Delete the File (Only Owner Can Delete)
```bash
curl -i -X DELETE http://localhost:3000/api/files/1 \
-H "x-user-id: 2"
```
Response:
```HTTP
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 71
ETag: W/"47-7LkqilLYbuL0l/yP0h8NeaMDGxo"
Date: Sat, 27 Dec 2025 16:49:52 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"message":"Forbidden: You do not have permission to delete this file"}
```
11. Bob (ID 1) Upgrades User 2's Permission to "Edit"
```bash
curl -i -X PATCH http://localhost:3000/api/files/1/permissions/3 \
-H "Content-Type: application/json" \
-H "x-user-id: 1" \
-d '{"role": "edit"}'
```
Response:
```HTTP
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 45
ETag: W/"2d-WUsPUTRtJ+j1kPX1MOUBZurSSKs"
Date: Sat, 27 Dec 2025 16:49:27 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"pid":3,"fileID":1,"userID":2,"role":"edit"}
```
12. User 2 Edits the File (Now Authorized)
```bash
curl -i -X PATCH http://localhost:3000/api/files/1 \
-H "Content-Type: application/json" \
-H "x-user-id: 2" \
-d '{"newNameOfFile":"updatedProject.txt", "newContent": "Charlie updated this content!"}'
```
Response:
```HTTP
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 58
ETag: W/"3a-Hj5/9k+1lMNC+KQRi0yVx5Rtw"
Date: Sat, 27 Dec 2025 16:49:40 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"FID":1,"name":"project.txt","isDir":false,"ownerID":"1"}
```
13. Bob (Owner) Deletes the File
```bash
curl -i -X DELETE http://localhost:3000/api/files/1 \
-H "x-user-id: 1"
```
Response:
```HTTP
HTTP/1.1 204 No Content
X-Powered-By: Express
ETag: W/"18-DIYPLm2D+mkvH+NLdl71+4YzCeA"
Date: Sat, 27 Dec 2025 16:49:57 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```