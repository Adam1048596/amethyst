const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

//get manga list
app.get('/', async (req, res) => {
  try {
    const url = 'https://api.allanime.day/api';

    const variables = {
      isManga: true,
      limit: 30,
      page: 1,
      translationType: "sub",
      countryOrigin: "ALL"
    };

    const extensions = {
      persistedQuery: {
        version: 1,
        sha256Hash: "a27e57ef5de5bae714db701fb7b5cf57e13d57938fc6256f7d5c70a975d11f3d"
      }
    };

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

    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch manga:', error.message);
    res.status(500).json({ error: 'Failed to fetch manga' });
  }
});
//get manga info
app.get('/manga/:id', async (req, res) => {
  const mangaId = req.params.id;

  const variables = {
    _id: mangaId,
    search: {
      allowAdult: false,
      allowUnknown: false,
    }
  };

  const extensions = {
    persistedQuery: {
      version: 1,
      sha256Hash: "529b0770601c7e04c98566c7b7bb3f75178930ae18b3084592d8af2b591a009f"
    }
  };

  const url = 'https://api.allanime.day/api' +
    '?variables=' + encodeURIComponent(JSON.stringify(variables)) +
    '&extensions=' + encodeURIComponent(JSON.stringify(extensions));

  try {
    const response = await axios.get(url, {
      headers: {
        'Accept': '*/*',
        'Referer': 'https://allmanga.to/',
        'User-Agent': 'Mozilla/5.0',
      }
    });

    // Check if data exists and return it
    if (response.data && response.data.data && response.data.data.manga) {
      return res.json(response.data.data.manga);
    } else {
      return res.status(404).json({ error: 'Manga not found in API response' });
    }
  } catch (error) {
    console.error('Failed to fetch manga info:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to fetch manga info' });
  }
});

//get manga chapters
app.get('/manga/:mangaId/chapter/:chapterString', async (req, res) => {
  const { mangaId, chapterString } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  const variables = {
    mangaId,
    translationType: 'sub',
    chapterString,
    limit,
    offset
  };
  const extensions = {
    persistedQuery: {
      version: 1,
      sha256Hash: '121996b57011b69386b65ca8fc9e202046fc20bf68b8c8128de0d0e92a681195'
    }
  };

  try {
    const response = await axios.get('https://api.allanime.day/api', {
      params: {
        variables: JSON.stringify(variables),
        extensions: JSON.stringify(extensions),
      },
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://youtu-chan.com/',
        'Accept': '*/*'
      }
    });

    const data = response.data.data;
    // The actual field path may vary; here's a guess:
    const pages = data.chapterPages || data.pages || [];
    const hasNext = pages.length === limit;
    res.json({ pages, limit, offset, hasNext });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch chapter pages' });
  }
});





// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
