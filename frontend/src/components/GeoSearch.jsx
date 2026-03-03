'use client';

import { useState } from 'react';

const API_URL = 'http://localhost:5000/api';

export default function GeoSearch({ map }) {
  const [searchMode, setSearchMode] = useState('keyword');
  const [searchTerm, setSearchTerm] = useState('');
  const [bounds, setBounds] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  const handleKeywordSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      // Search across multiple resource types
      const [fisherfolk, boats, gear] = await Promise.all([
        fetch(
          `${API_URL}/fisherfolk?search=${searchTerm}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        ).then(r => r.json()),
        fetch(
          `${API_URL}/boats?search=${searchTerm}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        ).then(r => r.json()),
        fetch(
          `${API_URL}/gears?search=${searchTerm}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        ).then(r => r.json()),
      ]);

      const combined = [
        ...(fisherfolk || []).map(f => ({ ...f, type: 'Fisherfolk' })),
        ...(boats || []).map(b => ({ ...b, type: 'Boat' })),
        ...(gear || []).map(g => ({ ...g, type: 'Gear' })),
      ];

      setResults(combined);
    } catch (error) {
      console.error('[v0] Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoundingBoxSearch = (e) => {
    e.preventDefault();
    if (!map) {
      console.error('Map not available');
      return;
    }

    setLoading(true);
    try {
      const bbox = map.getBounds();
      const southWest = bbox.getSouthWest();
      const northEast = bbox.getNorthEast();

      setBounds({
        minLat: southWest.lat,
        maxLat: northEast.lat,
        minLon: southWest.lng,
        maxLon: northEast.lng,
      });

      // This would be implemented on the backend with geospatial queries
      console.log('[v0] Bounding box search:', {
        minLat: southWest.lat,
        maxLat: northEast.lat,
        minLon: southWest.lng,
        maxLon: northEast.lng,
      });

      setResults([]);
    } catch (error) {
      console.error('[v0] Bounding box search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result) => {
    setSelectedResult(result);

    // Center map on result if coordinates exist
    if (result.province && result.cityMunicipality && map) {
      // This would typically use a geocoding service to convert address to coordinates
      console.log('[v0] Selected result:', result);
    }
  };

  return (
    <div className="geo-search">
      <div className="search-panel">
        <h3>Geospatial Search</h3>

        <div className="search-mode-tabs">
          <button
            className={`tab ${searchMode === 'keyword' ? 'active' : ''}`}
            onClick={() => setSearchMode('keyword')}
          >
            Keyword
          </button>
          <button
            className={`tab ${searchMode === 'bbox' ? 'active' : ''}`}
            onClick={() => setSearchMode('bbox')}
          >
            Bounding Box
          </button>
          <button
            className={`tab ${searchMode === 'location' ? 'active' : ''}`}
            onClick={() => setSearchMode('location')}
          >
            By Location
          </button>
        </div>

        {searchMode === 'keyword' && (
          <form onSubmit={handleKeywordSearch}>
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search fisherfolk, boats, gears..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        )}

        {searchMode === 'bbox' && (
          <form onSubmit={handleBoundingBoxSearch}>
            <p className="instruction">Search within the current map view</p>
            <button type="submit" disabled={loading || !map}>
              {loading ? 'Searching...' : 'Search This Area'}
            </button>
          </form>
        )}

        {searchMode === 'location' && (
          <div className="location-search">
            <p className="instruction">Searches by province or city</p>
            <select>
              <option value="">Select Province</option>
              <option value="Iloilo">Iloilo</option>
              <option value="Capiz">Capiz</option>
              <option value="Antique">Antique</option>
            </select>
            <select>
              <option value="">Select City/Municipality</option>
              <option value="Iloilo City">Iloilo City</option>
              <option value="Roxas City">Roxas City</option>
            </select>
          </div>
        )}

        {results.length > 0 && (
          <div className="search-results">
            <h4>Results ({results.length})</h4>
            <div className="results-list">
              {results.slice(0, 10).map((result, idx) => (
                <div
                  key={idx}
                  className={`result-item ${selectedResult?._id === result._id ? 'selected' : ''}`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="result-header">
                    <strong>{result.firstName || result.boatName || result.gearType}</strong>
                    <span className="result-type">{result.type}</span>
                  </div>
                  <div className="result-details">
                    {result.lastName && <span>{result.lastName}</span>}
                    {result.province && <span>{result.province}</span>}
                    {result.cityMunicipality && <span>{result.cityMunicipality}</span>}
                  </div>
                </div>
              ))}
            </div>
            {results.length > 10 && <p className="show-more">+ {results.length - 10} more results</p>}
          </div>
        )}

        {selectedResult && (
          <div className="selected-result-details">
            <h4>Details</h4>
            <div className="details-content">
              <p>
                <strong>Type:</strong> {selectedResult.type}
              </p>
              {selectedResult.firstName && (
                <>
                  <p>
                    <strong>Name:</strong> {selectedResult.firstName} {selectedResult.lastName}
                  </p>
                  {selectedResult.age && (
                    <p>
                      <strong>Age:</strong> {selectedResult.age}
                    </p>
                  )}
                </>
              )}
              {selectedResult.boatName && (
                <p>
                  <strong>Boat Name:</strong> {selectedResult.boatName}
                </p>
              )}
              {selectedResult.gearType && (
                <p>
                  <strong>Gear Type:</strong> {selectedResult.gearType}
                </p>
              )}
              {selectedResult.province && (
                <p>
                  <strong>Location:</strong> {selectedResult.province},
                  {selectedResult.cityMunicipality}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
