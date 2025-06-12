import { useState, useEffect, useCallback, useRef } from 'react';
import './mangaList.css';

const MangaList = () => {
  const [manga, setManga] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use ref to track if we're currently fetching
  const isFetching = useRef(false);

  const fetchManga = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isFetching.current || !hasMore) return;
    
    isFetching.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/manga?page=${page}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API Response:", data);
      
      // Validate response structure
      if (!data || !Array.isArray(data.data)) {
        throw new Error("Invalid data structure from API");
      }

      // Update manga list
      setManga(prev => [...prev, ...data.data]);
      
      // Determine if there's more data
      const receivedItems = data.data.length;
      const expectedItems = 30; // Your expected page size
      const moreDataAvailable = receivedItems === expectedItems;
      
      setHasMore(moreDataAvailable);
      setPage(prevPage => prevPage + 1);
      
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setHasMore(false);
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  }, [page, hasMore]);

  // Set up scroll handler
  useEffect(() => {
    const handleScroll = () => {
      // Check if we've scrolled near bottom (within 200px)
      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.body.offsetHeight;
      
      if (scrollPosition < documentHeight - 200 || loading || !hasMore) {
        return;
      }
      
      fetchManga();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchManga, loading, hasMore]);

  // Initial load
  useEffect(() => {
    fetchManga();
  }, []);

  return (
    <div className="manga-container">
      {error ? (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => {
            setPage(1);
            setManga([]);
            setHasMore(true);
            setError(null);
            fetchManga();
          }}>
            Retry
          </button>
        </div>
      ) : (
        <>
          {manga.map((item) => (
            <div key={`${item.id}-${page}`} className="manga-item">
              <h3>{item.name}</h3>
              <p>Chapter: {item.latestChapter}</p>
            </div>
          ))}
          
          {loading && (
            <div className="loading-spinner">
              Loading...
            </div>
          )}
          
          {!hasMore && manga.length > 0 && (
            <div className="end-message">
              No more manga to load
            </div>
          )}
          
          {!loading && manga.length === 0 && (
            <div className="empty-state">
              No manga found
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MangaList;