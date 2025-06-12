import React, { useState, useEffect } from 'react';
import './mangaList.css'; // You can remove this if not using it

function MangaList() {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/manga')
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched data:', data);

        const edges = data?.data?.mangas?.edges || [];

        const formattedList = edges.map((manga) => ({
          id: manga._id,
          title: manga.name,
          image: `https://api.allanime.day/${manga.thumbnail}`,
        }));

        setMangaList(formattedList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading manga...</p>;

  if (mangaList.length === 0) {
    return <p>No manga found.</p>;
  }

  return (
    <div style={styles.grid}>
      {mangaList.map((manga) => (
        <div key={manga.id} style={styles.card}>
          <img src={manga.image} alt={manga.title} style={styles.image} />
          <p style={styles.title}>{manga.title}</p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '20px',
    padding: '20px',
  },
  card: {
    background: '#f4f4f4',
    borderRadius: '10px',
    padding: '10px',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  title: {
    marginTop: '10px',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
};

export default MangaList;
