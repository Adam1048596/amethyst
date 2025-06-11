const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
  try {
    const query = `
      query ($page: Int, $limit: Int, $translationType: VaildTranslationTypeEnumType, $countryOrigin: VaildCountryOriginEnumType) {
        shows(page: $page, limit: $limit, translationType: $translationType, countryOrigin: $countryOrigin) {
          pageInfo { total }
          edges {
            _id
            name
            type
            availableEpisodes
            lastUpdateEnd
          }
        }
      }
    `;

    const variables = {
      limit: 30,
      page: 1,
      translationType: "sub",
      countryOrigin: "ALL"
    };

    const response = await axios.post('https://api.allanime.day/api', {
      query,
      variables
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://allanime.day/'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch anime:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch anime', details: error.response?.data || error.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
