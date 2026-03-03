'use client';

import { useState } from 'react';

export default function SpatialAnalysis({ mapLayers, map }) {
  const [analysisType, setAnalysisType] = useState('proximity');
  const [radius, setRadius] = useState(5);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calculate proximity search
  const handleProximitySearch = async (centerLat, centerLon) => {
    setLoading(true);
    try {
      // Filter features within radius
      const featuresInRadius = mapLayers.filter(layer => {
        if (layer.coordinates.type === 'Point') {
          const lat = layer.coordinates.coordinates[1];
          const lon = layer.coordinates.coordinates[0];
          const distance = calculateDistance(centerLat, centerLon, lat, lon);
          return distance <= radius;
        }
        return false;
      });

      setResults(featuresInRadius);
    } catch (error) {
      console.error('[v0] Error in proximity search:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate density heatmap
  const handleDensityAnalysis = () => {
    setLoading(true);
    try {
      const density = {};

      mapLayers.forEach(layer => {
        if (layer.coordinates.type === 'Point') {
          const lat = Math.round(layer.coordinates.coordinates[1] * 10) / 10;
          const key = `${lat}`;
          density[key] = (density[key] || 0) + 1;
        }
      });

      const densityArray = Object.entries(density).map(([location, count]) => ({
        location,
        count,
        intensity: count > 10 ? 'high' : count > 5 ? 'medium' : 'low',
      }));

      setResults(densityArray);
    } catch (error) {
      console.error('[v0] Error in density analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get layer type statistics
  const handleLayerStats = () => {
    setLoading(true);
    try {
      const stats = {};

      mapLayers.forEach(layer => {
        const type = layer.layerType;
        stats[type] = (stats[type] || 0) + 1;
      });

      const statsArray = Object.entries(stats).map(([type, count]) => ({
        type,
        count,
        percentage: ((count / mapLayers.length) * 100).toFixed(1),
      }));

      setResults(statsArray);
    } catch (error) {
      console.error('[v0] Error in layer statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="spatial-analysis">
      <div className="analysis-panel">
        <h3>Spatial Analysis</h3>

        <div className="analysis-type-selector">
          <label>
            <input
              type="radio"
              value="proximity"
              checked={analysisType === 'proximity'}
              onChange={(e) => setAnalysisType(e.target.value)}
            />
            Proximity Search
          </label>
          <label>
            <input
              type="radio"
              value="density"
              checked={analysisType === 'density'}
              onChange={(e) => setAnalysisType(e.target.value)}
            />
            Density Analysis
          </label>
          <label>
            <input
              type="radio"
              value="stats"
              checked={analysisType === 'stats'}
              onChange={(e) => setAnalysisType(e.target.value)}
            />
            Layer Statistics
          </label>
        </div>

        {analysisType === 'proximity' && (
          <div className="analysis-options">
            <label>
              Radius (km):
              <input
                type="number"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              />
            </label>
            <p className="instruction">Click on the map to search nearby features</p>
          </div>
        )}

        {analysisType === 'density' && (
          <div className="analysis-options">
            <button onClick={handleDensityAnalysis} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Density'}
            </button>
          </div>
        )}

        {analysisType === 'stats' && (
          <div className="analysis-options">
            <button onClick={handleLayerStats} disabled={loading}>
              {loading ? 'Analyzing...' : 'Get Statistics'}
            </button>
          </div>
        )}

        {loading && <div className="loading-indicator">Analyzing...</div>}

        {results.length > 0 && (
          <div className="analysis-results">
            <h4>Results ({results.length})</h4>
            <div className="results-list">
              {results.map((result, idx) => (
                <div key={idx} className="result-item">
                  {result.layerName && <strong>{result.layerName}</strong>}
                  {result.type && <strong>Type: {result.type}</strong>}
                  {result.count && <span>Count: {result.count}</span>}
                  {result.percentage && <span>({result.percentage}%)</span>}
                  {result.intensity && (
                    <span
                      style={{
                        backgroundColor:
                          result.intensity === 'high'
                            ? '#e74c3c'
                            : result.intensity === 'medium'
                              ? '#f39c12'
                              : '#2ecc71',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '12px',
                      }}
                    >
                      {result.intensity}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
