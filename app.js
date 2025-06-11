// import EXPRESS & routers
const express = require('express');
const mangaRouter = require('./routes/allmanga.to-mangaApi.js');
// Create an Express application instance
const server = express();


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