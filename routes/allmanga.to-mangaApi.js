// This code defines an Express.js router for handling requests related to manga from the allmanga.to API.
const express = require('express');
const axios = require('axios');
const router = express.Router();
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
      page: 1,
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

// ========================
// 🔹 Manga Information Endpoint
// ========================
// This endpoint fetches detailed information about a specific manga
// from the allmanga.to API using the manga's unique ID
// 
// Parameters:
// :id → The unique identifier for the manga (e.g., "6p79x8anqerHnKj4m")
router.get('/:id', async (req, res) => {
  // ========================
  // 🔹 Step 1: Extract and Prepare Request Data
  // ========================
  // Get the manga ID from the URL parameters
  const mangaId = req.params.id;

  // ========================
  // 🔹 Step 2: Build the Query Variables
  // ========================
  // These variables will be sent to the AllAnime API
  // _id → The manga ID we want to look up
  // search → Filters to apply (exclude adult/unknown content)
  const variables = {
    _id: mangaId,
    // search: {
    //   allowAdult: false,    // Don't include adult content
    //   allowUnknown: false,  // Don't include unknown/unspecified content
    // }
  };

  // ========================
  // 🔹 Step 3: Configure API Extensions
  // ========================
  // This tells AllAnime which specific GraphQL query we want to run
  // The hash acts like a unique identifier for the query we're requesting
  const extensions = {
    persistedQuery: {
      version: 1,  // Query version
      sha256Hash: "529b0770601c7e04c98566c7b7bb3f75178930ae18b3084592d8af2b591a009f"  // Unique query identifier
    }
  };

  // ========================
  // 🔹 Step 4: Construct the API URL
  // ========================
  // We need to:
  // 1. Convert our variables/extensions to JSON strings
  // 2. URL-encode them so they're safe to use in a URL
  // Result looks like: https://api.allanime.day/api?variables={...}&extensions={...}
  const url = 'https://api.allanime.day/api' +
    '?variables=' + encodeURIComponent(JSON.stringify(variables)) +
    '&extensions=' + encodeURIComponent(JSON.stringify(extensions));

  // ========================
  // 🔹 Step 5: Make the API Request to https://api.allanime.day/api
  // ========================
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0', // Pretend to be a web browser
        'Referer': 'https://allmanga.to/',  // Required by API for authentication
        'Accept': '*/*',             // Accept any response format
      }
    });

    // ========================
    // 🔹 Step 6: Handle the Response
    // ========================
    const mangaInfo = response.data;  // 🔹This is an object containing manga details

    // Check if we actually got manga data
    if (!mangaInfo) {
      // If no data exists, return a 404 Not Found error
      return res.status(404).json({ error: 'Manga not found in API response' });
    } else {
      // If data exists, return it as JSON
      return res.json(mangaInfo);
    }

  // ========================
  // 🔹 Error Handling
  // ========================
  } catch (error) {
    // Log detailed error to server console for debugging
    console.error('Failed to fetch manga info:', error.response?.data || error.message);
    
    // Send a user-friendly error message
    return res.status(500).json({ 
      error: 'Failed to fetch manga info',
      details: error.message  // Optional: include error details for debugging
    });
  }
});


// ========================
// 🔹 Manga Chapter Pictures Endpoint
// ========================
// This endpoint fetches all image URLs for a specific manga chapter
// from the AllAnime API using the manga ID and chapter identifier
//
// Parameters:
// :mangaId → The unique identifier for the manga (e.g., "6p79x8anqerHnKj4m")
// :chapterString → The chapter identifier (e.g., "1", "15", "2")
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
      },
        timeout: 10000 // ← Request will fail if it takes longer than 10s
    });
    // ========================
    // 🔹 Step 4: Parse and return the response
    // ========================
    //
    // Get the chapter images data from the API response
    const chapterPictureUrls = response.data.data.chapterPages.edges; // 🔹This is an object containing manga chapter images urls

    // Return the raw data exactly as received from the API
    return res.json(chapterPictureUrls);

    // ========================
    // 🔹 Step 5: Handle errors
    // ========================
  } catch (err) {
    // Log the full error to the backend terminal for debugging
    console.error(err.response?.data || err.message);
    //Timeout error (10s passed)
    if (err.code === 'ECONNABORTED'){
      res.status(504).json({ error: 'Server took too long to respond!' });
    }// AllAnime API Error (404, 500, etc.)
    else if (err.response){
      res.status(err.response.status).json({ error: 'AllAnime API error!' });
    }// Network Error (No internet, etc.)
    else{
      res.status(500).json({ error: 'Failed to fetch chapter pages' });
    };
  }

});











    // Send the result back as JSON
    // return res.json({
    // // 1. Creating an 'images' array with processed image data
    //   images: data[0].pictureUrls.map(img => ({
    //     // For each image in pictureUrls array:
    //     url: `${data[0].pictureUrlHead}${img.url}`, // 2. Combine base URL with relative path
    //     number: img.num // 3. Include the image number/order
    //   })),
    
    //   // 4. Adding chapter metadata in 'chapterInfo' object
    //   chapterInfo: {
    //     title: data[0].notes, // 5. Chapter title/notes
    //     number: data[0].chapterString, // 6. Chapter number as string
    //     totalPages: data[0].pictureUrls.length // 7. Total count of images
    //   }
    // // 8. Note: Not including limit/offset since API ignores them
    // });



// // Process both edges to create a fallback system
// const primarySource = data[0];  // First streamer (e.g., YoutubeAnime)
// const fallbackSource = data[1]; // Second streamer (e.g., F4S)

// const images = primarySource.pictureUrls.map((img, index) => ({
//   number: img.num,
//   // Primary URL
//   primaryUrl: `${primarySource.pictureUrlHead}${img.url}`,
//   // Fallback URL (from second source)
//   fallbackUrl: fallbackSource?.pictureUrls[index] 
//     ? `${fallbackSource.pictureUrlHead}${fallbackSource.pictureUrls[index].url}`
//     : null,
//   // Combined URL - frontend can try primary first, then fallback
//   url: [
//     `${primarySource.pictureUrlHead}${img.url}`,
//     fallbackSource && `${fallbackSource.pictureUrlHead}${fallbackSource.pictureUrls[index]?.url}`
//   ].filter(Boolean)
// }));

// return res.json({
//   images,
//   chapterInfo: {
//     title: primarySource.notes || fallbackSource?.notes,
//     number: primarySource.chapterString,
//     totalPages: primarySource.pictureUrls.length,
//     sources: [
//       {
//         streamer: primarySource.streamerId,
//         baseUrl: primarySource.pictureUrlHead
//       },
//       {
//         streamer: fallbackSource?.streamerId,
//         baseUrl: fallbackSource?.pictureUrlHead
//       }
//     ]
//   }
// });
// export file
module.exports = router;