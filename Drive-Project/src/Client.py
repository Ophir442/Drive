#!/usr/bin/env python3
"""
Python client for the drive application.
Connects to the C++ server and sends commands via TCP socket.
Mirrors the C++ Client implementation with CLIManager behavior.
"""

import socket
import sys
from typing import List


class CLIManager:
    """Manages command-line interface input and output, mirroring C++ CLIManager."""
    
    def __init__(self):
        """Initialize the CLIManager."""
        pass
    
    def get_command_and_args(self) -> List[str]:
        """
        Get command and arguments from user input.
        Mirrors C++ CLIManager::getCommandAndArgs() behavior.
        
        Returns:
            List with two elements: [command, arguments]
            - command: The first word before the space
            - arguments: Everything after the first space
        
        Raises:
            Exception: If input doesn't contain a space (invalid format)
        """
        string_cli_input = input()  # Read a full line of input from the user
        # check if input is empty
        if not string_cli_input:
            raise Exception() #Invalid input
        
        # Check if there is a space to separate command and arguments
        if ' ' not in string_cli_input:
            return string_cli_input # No arguments, return the whole input as command
        
        # Split at first space
        space_index = string_cli_input.find(' ')
        command = string_cli_input[:space_index]  # First part is the command
        arguments = string_cli_input[space_index + 1:]  # Rest is the arguments
        
        return [command, arguments]
    
    def display_output(self, output: str) -> None:
        """
        Display output to the user.
        Mirrors C++ CLIManager::displayOutput() behavior.
        
        Args:
            output: The output string to display
        """
        print(output, end = '')  # Print without adding extra newline


class Client:
    """Client class to communicate with the drive server."""
    
    def __init__(self, server_ip: str, server_port: int, cli_manager: CLIManager):
        """
        Initialize the client with server connection details and CLIManager.
        Mirrors C++ Client constructor.
        
        Args:
            server_ip: IP address or hostname of the server
            server_port: Port number the server is listening on
            cli_manager: CLIManager instance for handling I/O
        """
        self.server_ip = server_ip
        self.server_port = server_port
        self.cli_manager = cli_manager
    
    def send(self, sock: socket.socket, msg: str) -> None:
        """
        Send a message to the server.
        Mirrors C++ Client::send() behavior.
        
        Args:
            sock: The socket to send through
            msg: The message string to send
        
        Raises:
            Exception: If sending fails
        """
        msg_bytes = msg.encode('utf-8')
        total_sent = 0
        msg_len = len(msg_bytes)
        
        while total_sent < msg_len:
            sent = sock.send(msg_bytes[total_sent:])
            if sent == 0:
                raise Exception("Failed to send data to server")
            total_sent += sent
    
    def receive(self, sock: socket.socket) -> str:
        """
        Receive a message from the server.
        First receives the length (8 bytes), then receives the actual message.
        Mirrors C++ Client::receive(int sock) behavior.
        
        Args:
            sock: The socket to receive from
        
        Returns:
            The received message as a string
        
        Raises:
            Exception: If receiving fails or connection is closed
        """
        # Receive the length of the incoming message (8 bytes)
        length_buffer = sock.recv(8)
        if not length_buffer:
            raise Exception("Connection closed by server")
        
        if len(length_buffer) == 0:
            raise Exception("Connection closed by server")
        
        message_length = int(length_buffer.decode('utf-8').strip())
        return self._receive_exact(sock, message_length)
    
    def _receive_exact(self, sock: socket.socket, length: int) -> str:
        """
        Receive exactly 'length' bytes from the server.
        Mirrors C++ Client::receive(int sock, int length) behavior.
        
        Args:
            sock: The socket to receive from
            length: Number of bytes to receive
        
        Returns:
            The received data as a string
        
        Raises:
            Exception: If receiving fails
        """
        received_data = b''
        total_received = 0
        
        while total_received < length:
            buffer_size = 4096
            to_receive = min(buffer_size, length - total_received)
            received = sock.recv(to_receive)
            
            if not received or len(received) == 0:
                raise Exception("Connection closed")
            
            received_data += received
            total_received += len(received)
        
        return received_data.decode('utf-8')
    
    def run(self) -> None:
        """
        Main client loop. Connects to server, takes user input via CLIManager,
        sends commands, and displays responses.
        Mirrors C++ Client::run() behavior.
        
        Raises:
            Exception: If connection or communication fails
        """
        # Create socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        
        if sock is None:
            raise Exception("Failed to create socket")
        
        try:
            # Connect to server
            sock.connect((self.server_ip, self.server_port))
            
            # Main command loop - mirrors C++ while(true) loop
            while True:
                # Clear message for each new command
                message = ""
                
                # Get command from CLI using CLIManager
                try:
                    vector_message = self.cli_manager.get_command_and_args()
                except Exception:
                    self.cli_manager.display_output("400 Bad Request\n")
                    continue  # Empty input, prompt again
                
                # Build message from command parts
                for part in vector_message:
                    message += part + " "
                
                # Remove trailing space and add newline
                if message and message[-1] == ' ':
                    message = message[:-1]
                message += "\n"
                
                # Send command to server
                self.send(sock, message)
                
                # Receive response from server
                response = self.receive(sock)
                
                # Display response to user (via CLIManager)
                self.cli_manager.display_output(response)
                
        except Exception as e:
            sock.close()
            raise  # Rethrow exception to be handled by caller
        finally:
            sock.close()


def main():
    """Main entry point for the client application. Mirrors C++ main() function."""
    if len(sys.argv) != 3:
        raise Exception("Invalid arguments")
    
    server_ip = sys.argv[1]
    server_port = int(sys.argv[2])
    
    # Create CLIManager (empty commands map, matching C++ client main)
    cli_manager = CLIManager()
    
    # Create and run client
    client = Client(server_ip, server_port, cli_manager)
    
    try:
        client.run()
    except Exception:
        # Silently handle exception, matching C++ behavior
        pass


if __name__ == "__main__":
    main()