'use client';

import { useState, useEffect } from 'react';

export default function MapMeasurement({ map, mapRef }) {
  const [measurementMode, setMeasurementMode] = useState(null);
  const [points, setPoints] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalArea, setTotalArea] = useState(0);

  // Haversine formula for distance calculation
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
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

  // Calculate polygon area using Shoelace formula
  const calculatePolygonArea = (coords) => {
    if (coords.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const lat1 = coords[i][0];
      const lon1 = coords[i][1];
      const lat2 = coords[(i + 1) % coords.length][0];
      const lon2 = coords[(i + 1) % coords.length][1];

      area += (lon1 * lat2 - lon2 * lat1);
    }

    // Convert to square kilometers (approximate)
    area = Math.abs(area) / 2;
    const earthRadius = 6371;
    const squareKm = (area * earthRadius * earthRadius) / (111 * 111);

    return squareKm;
  };

  useEffect(() => {
    if (!map) return;

    const handleMapClick = (e) => {
      if (measurementMode === 'distance' || measurementMode === 'area') {
        const newPoint = [e.latlng.lat, e.latlng.lng];
        const newPoints = [...points, newPoint];
        setPoints(newPoints);

        // Add marker
        if (window.L) {
          const marker = window.L.circleMarker(newPoint, {
            radius: 5,
            fillColor: '#f39c12',
            color: '#fff',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.7,
          });
          marker.addTo(map);

          // Add point number popup
          marker.bindPopup(`Point ${newPoints.length}`).openPopup();

          // Draw line between consecutive points
          if (newPoints.length > 1) {
            const prevPoint = newPoints[newPoints.length - 2];
            const polyline = window.L.polyline([prevPoint, newPoint], {
              color: '#f39c12',
              weight: 2,
              opacity: 0.7,
            });
            polyline.addTo(map);

            // Calculate and display distance for this segment
            const segmentDistance = calculateDistance(
              prevPoint[0],
              prevPoint[1],
              newPoint[0],
              newPoint[1]
            );

            const newMeasurements = [...measurements, segmentDistance];
            setMeasurements(newMeasurements);

            const total = newMeasurements.reduce((a, b) => a + b, 0);
            setTotalDistance(total);
          }
        }
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, measurementMode, points, measurements]);

  const handleStartMeasurement = (mode) => {
    setMeasurementMode(measurementMode === mode ? null : mode);
    setPoints([]);
    setMeasurements([]);
    setTotalDistance(0);
    setTotalArea(0);
  };

  const handleCalculateArea = () => {
    if (points.length >= 3) {
      const area = calculatePolygonArea(points);
      setTotalArea(area);

      // Draw polygon
      if (window.L) {
        const polygon = window.L.polygon(points, {
          color: '#f39c12',
          weight: 2,
          opacity: 0.6,
          fillColor: '#f39c12',
          fillOpacity: 0.15,
        });
        polygon.addTo(map);
      }
    }
  };

  const handleReset = () => {
    setMeasurementMode(null);
    setPoints([]);
    setMeasurements([]);
    setTotalDistance(0);
    setTotalArea(0);
    // Clear map features (ideally, refresh the map)
  };

  return (
    <div className="map-measurement">
      <div className="measurement-controls">
        <button
          onClick={() => handleStartMeasurement('distance')}
          className={`measurement-btn ${measurementMode === 'distance' ? 'active' : ''}`}
        >
          Measure Distance
        </button>
        <button
          onClick={() => handleStartMeasurement('area')}
          className={`measurement-btn ${measurementMode === 'area' ? 'active' : ''}`}
        >
          Measure Area
        </button>
        <button onClick={handleReset} className="measurement-btn reset">
          Reset
        </button>
      </div>

      {measurementMode && (
        <div className="measurement-info">
          <div className="info-item">
            <label>Mode:</label>
            <span>{measurementMode === 'distance' ? 'Distance' : 'Area'}</span>
          </div>
          <div className="info-item">
            <label>Points:</label>
            <span>{points.length}</span>
          </div>
          {measurementMode === 'distance' && totalDistance > 0 && (
            <div className="info-item">
              <label>Total Distance:</label>
              <span>{totalDistance.toFixed(2)} km</span>
            </div>
          )}
          {measurementMode === 'area' && points.length >= 3 && (
            <>
              <button onClick={handleCalculateArea} className="measurement-btn">
                Calculate Area
              </button>
              {totalArea > 0 && (
                <div className="info-item">
                  <label>Total Area:</label>
                  <span>{totalArea.toFixed(2)} km²</span>
                </div>
              )}
            </>
          )}
          <p className="instruction-text">
            {measurementMode === 'distance'
              ? 'Click on the map to add points for distance measurement'
              : 'Click on the map to create a polygon for area measurement. Need at least 3 points.'}
          </p>
        </div>
      )}
    </div>
  );
}
