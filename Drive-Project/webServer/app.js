const express = require('express')  // Import the Express library
const cors = require('cors');       // Import CORS middleware
const app = express()               // Create server

app.use(express.json({ limit: '50mb' }));                        // Enable JSON body parsing with size limit of 50mb (for large images/PDFs)
app.use(express.urlencoded({ limit: '50mb', extended: true }));  // Enable URL-encoded body parsing with size limit of 50mb
app.use(cors());                    // Enable CORS for all routes (now react-client can access the API)

const fileRoutes = require('./routes/router');   // Import router

app.use('/api', fileRoutes); // every request to /api/ will be handled by fileRoutes

app.listen(3000) // Start the server on port 3000