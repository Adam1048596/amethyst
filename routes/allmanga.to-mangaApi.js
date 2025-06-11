// This code defines an Express.js router for handling requests related to manga from the allmanga.to API.
const express = require('express');
const axios = require('axios');
const router = express.Router();

// This endpoint fetches a list of manga from the allmanga.to API
// The response structure from the API is expected to be like this:{
  // data: {},        The parsed JSON response from the API
  // status: 200,     HTTP status code
  // headers: {},     Response headers
  // config: {},      Axios configuration
  // request: {}      The underlying HTTP request
  // }
router.get('/', async (req, res) => {
  // Define the base URL for the API
  const url = 'https://api.allanime.day/api';
  
  // The variables object contains the parameters for the request
  const variables = {
      isManga: true,
      limit: 30,
      page: 10,
      translationType: "sub",
      countryOrigin: "ALL"
    };
    
    // The extensions object contains additional parameters for the request
  const extensions = {
      persistedQuery: {
        version: 1,
        sha256Hash: "a27e57ef5de5bae714db701fb7b5cf57e13d57938fc6256f7d5c70a975d11f3d"
      }
    };
    
    // Make a GET request to the API with the constructed URL and parameters
    // The URL is constructed with query parameters for variables and extensions
  try {
    const response = await axios.get(url, {
      params: {
        variables: JSON.stringify(variables),
        extensions: JSON.stringify(extensions)
      },
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://allmanga.to/"
      }
    });

    // get the data from the response object
    // The data is expected to be an array of manga objects
    const mangaList = response.data;

    // return mangaList from the API response
    // Check if mangaList contains the expected data structure
    // If mangaList is empty or does not contain the expected data, return a 404 error
    if (!mangaList) {
      return res.status(404).json({ error: 'No manga found' });
    } else { return res.json(mangaList); }

  // Error Handling:
  // Catches failures (network issues, invalid responses, etc.)
  // Logs detailed error to your server console
  // Sends user-friendly 500 error with JSON response
  } catch (error) {
    console.error('Failed to fetch manga:', error.message);
    res.status(500).json({ error: 'Failed to fetch manga' });
  }
});

// get manga information by ID
// This endpoint fetches information about a specific manga by its ID from the allmanga.to API
router.get('/:id', async (req, res) => {
  // Extract the manga ID from the request parameters
  const mangaId = req.params.id;

  // The variables object contains the parameters for the request
  const variables = {
    _id: mangaId,
    search: {
      allowAdult: false,
      allowUnknown: false,
    }
  };

  // The extensions object contains additional parameters for the request
  const extensions = {
    persistedQuery: {
      version: 1,
      sha256Hash: "529b0770601c7e04c98566c7b7bb3f75178930ae18b3084592d8af2b591a009f"
    }
  };
  // Construct the URL for the API request
  // The URL is constructed with query parameters for variables and extensions
  const url = 'https://api.allanime.day/api' +
    '?variables=' + encodeURIComponent(JSON.stringify(variables)) +
    '&extensions=' + encodeURIComponent(JSON.stringify(extensions));

  // Make a GET request to the API with the constructed URL and parameters
  try {
    const response = await axios.get(url, {
      headers: {
        'Accept': '*/*',
        'Referer': 'https://allmanga.to/',
        'User-Agent': 'Mozilla/5.0',
      }
    });

    // get the data from the response object
    // The data is expected to be an object containing manga information
    const mangaInfo = response.data;

    // Extract the manga information from the response data
    if (!response.data) {
      return res.status(404).json({ error: 'Manga not found in API response' });
    } else {return res.json(mangaInfo);}

  // Error Handling:
  // Catches failures (network issues, invalid responses, etc.)
  // Logs detailed error to your server console
  // Sends user-friendly 500 error with JSON response
  } catch (error) {
    console.error('Failed to fetch manga info:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to fetch manga info' });
  }
});


// Route: Get manga chapter pages (images) for a specific manga and chapter
router.get('/:mangaId/chapter/:chapterString', async (req, res) => {
  // ========================
  // 🔹 Step 1: Extract URL parameters and query params
  // ========================
  // :mangaId → the unique ID of the manga
  // :chapterString → the chapter identifier (like "001", "special-2", etc.)
  // ?limit → how many pages to return (optional, default is 10)
  // ?offset → how many pages to skip (optional, default is 0)
  const variables = {
    mangaId: req.params.mangaId,
    chapterString: req.params.chapterString,
    translationType: 'sub', // Always fetch the subbed version (subtitles, not dubbed)
    limit: parseInt(req.query.limit || 10),  // Number of pages to get
    offset: parseInt(req.query.offset || 0), // Skip first `offset` pages (for pagination)
  };

  // ========================
  // 🔹 Step 2: Build the required "extensions" object
  // ========================
  // This tells the AllAnime API which specific GraphQL query to run.
  // The hash is required for it to understand what type of data we're asking for.
  const extensions = {
    persistedQuery: {
      version: 1,
      sha256Hash: '121996b57011b69386b65ca8fc9e202046fc20bf68b8c8128de0d0e92a681195'
    }
  };

  try {
    // ========================
    // 🔹 Step 3: Make a GET request to the AllAnime API
    // ========================
    const response = await axios.get('https://api.allanime.day/api', {
      params: {
        // The API expects the parameters to be passed as JSON strings
        variables: JSON.stringify(variables),
        extensions: JSON.stringify(extensions),
      },
      headers: {
        'User-Agent': 'Mozilla/5.0',               // Simulates a real browser
        'Referer': 'https://youtu-chan.com/',      // Required by API for validation
        'Accept': '*/*'                            // Accept all types of responses
      }
    });

    // ========================
    // 🔹 Step 4: Parse and return the response
    // ========================
    const data = response.data.data;

    // Get the list of pages for the chapter (may differ depending on the API's response shape)
    const pages = data.chapterPages || data.pages || [];

    // Detect if there may be more pages to load
    // This is useful for frontend pagination or infinite scroll
    const hasNext = pages.length === variables.limit;

    // Send the result back as JSON
    return res.json({
      pages,       // array of image URLs or page data
      limit: variables.limit,    // how many pages returned
      offset: variables.offset,  // how many were skipped
      hasNext      // true if more pages might exist
    });

  } catch (err) {
    // ========================
    // 🔹 Step 5: Handle errors gracefully
    // ========================
    // Log the full error to the backend terminal for debugging
    console.error(err.response?.data || err.message);

    // Send a clean 500 Internal Server Error message to the client
    res.status(500).json({ error: 'Failed to fetch chapter pages' });
  }
});

// export file
module.exports = router;