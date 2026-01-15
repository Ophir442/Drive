const net = require('net');

class WebClient {
    constructor() {
        this.serverHost = 'server';  // Docker service name for C++ server
        this.serverPort = 8080;      // Port where C++ server listens

        this.client = new net.Socket();
        this.isConnected = false;

        // Request queue to prevent concurrent requests from interfering with each other
        this.requestQueue = [];
        this.isProcessing = false;

        this.connect();
    }

    connect() {
        this.client.connect(this.serverPort, this.serverHost, () => {
            this.isConnected = true;
        });

        this.client.on('error', (err) => {
            console.error('Connection error:', err.message); // DEBUG
            this.isConnected = false;
        });

        this.client.on('close', () => {
            this.isConnected = false;
        });
    }

    /**
     * Sends a command to the C++ server and returns the response as a Promise.
     * Requests are queued to prevent responses from getting mixed up between users.
     * @param {string} command
     * @returns {Promise<string>}
     */
    send(command) {
        return new Promise((resolve, reject) => {
            // Add request to queue
            this.requestQueue.push({ command, resolve, reject });

            // Process queue if not already processing
            this.processQueue();
        });
    }

    /**
     * Processes requests one at a time to prevent response mixing
     */
    processQueue() {
        // If already processing or queue is empty, do nothing
        if (this.isProcessing || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const { command, resolve, reject } = this.requestQueue.shift();

        if (!this.isConnected) {
            this.client.connect(this.serverPort, this.serverHost);
            this.isProcessing = false;
            reject(new Error("500 Internal Server Error: C++ Server disconnected"));
            // Try next request in queue
            this.processQueue();
            return;
        }

        let buffer = Buffer.alloc(0);
        let expectedLength = 0;

        // ON DATA: This is the callback function that handles incoming data chunks.
        // TCP streams may split data, so we accumulate chunks until we have the full message.
        const onData = (chunk) => {
            buffer = Buffer.concat([buffer, chunk]);

            // Parse Header: First 8 bytes indicate the total message length.
            if (expectedLength === 0 && buffer.length >= 8) {
                const header = buffer.toString('utf8', 0, 8);
                expectedLength = parseInt(header.trim());
            }

            // Full Message Received: If buffer contains header + content, we are done.
            if (expectedLength !== 0 && buffer.length >= 8 + expectedLength) {
                const response = buffer.toString('utf8', 8, 8 + expectedLength);

                cleanup();

                // RESOLVE: Fulfills the Promise and sends the response back to the Controller.
                resolve(response);

                // Process next request in queue
                this.isProcessing = false;
                this.processQueue();
            }
        };

        const onError = (err) => {
            cleanup();
            reject(err);

            // Process next request in queue
            this.isProcessing = false;
            this.processQueue();
        };

        const cleanup = () => {
            this.client.removeListener('data', onData);
            this.client.removeListener('error', onError);
        };

        // EVENT REGISTRATION:
        // We MUST register the listeners BEFORE writing data.
        // 'on' keeps listening for chunks. 'once' listens for a single error event.
        this.client.on('data', onData);
        this.client.once('error', onError);

        // WRITE: Physically sends the command string to the C++ server.
        // Why is this at the end?
        // Because code runs synchronously. We must set up the listeners ("this.client.on('data', ...)")
        // before we send data.
        this.client.write(command + '\n');
    }
}

module.exports = new WebClient();
