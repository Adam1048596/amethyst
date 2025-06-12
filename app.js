// import EXPRESS & routers
const express = require('express');
const cors = require('cors'); // Import cors
const mangaRouter = require('./routes/allmanga.to-mangaApi.js');
// Create an Express application instance
const server = express();

server.use(cors());  // Enable CORS for all origins
// Test basic route
server.get('/', (req, res) => {
  res.send('Server is running');
});
// Routes
server.use('/manga', mangaRouter);









// Start the server
const port = 5000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});