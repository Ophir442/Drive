FROM gcc:latest

# installing cmake and python3
RUN apt-get update && apt-get install -y cmake && apt-get install -y python3
# configure the working directory inside the container
WORKDIR /usr/src

# copying all source files to the working directory
COPY . .

# setting an environment variable for the database directory
ENV DRIVE_STORAGE=/usr/src/file_storage
# setting an environment variable for the file names saver
ENV DRIVE_FILE_NAMES=/usr/src/file_storage/logical_db

# create the database and file names saver directory
# the -p flag creates parent directories as needed and makes no error if the directory already exists
RUN mkdir -p $DRIVE_STORAGE
RUN mkdir -p $DRIVE_FILE_NAMES

# we use cmake to build the project
RUN cmake . && make 
