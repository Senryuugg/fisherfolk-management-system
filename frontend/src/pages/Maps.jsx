'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/Maps.css';

const ncrCities = [
  {
    name: 'Navotas',
    coordinates: [14.6711, 120.8652],
    bodiesOfWater: ['Manila Bay', 'Navotas Harbor'],
    mangroves: true,
    location: 'Northern Manila Bay',
    address: 'Navotas City, NCR',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
    description: 'Major fishing port with extensive mangrove areas along Manila Bay',
  },
  {
    name: 'Malabon',
    coordinates: [14.6813, 120.8368],
    bodiesOfWater: ['Manila Bay', 'Meycauayan River'],
    mangroves: true,
    location: 'North Manila Bay',
    address: 'Malabon City, NCR',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    description: 'Coastal city with rich mangrove ecosystems and fishing grounds',
  },
  {
    name: 'Caloocan',
    coordinates: [14.6352, 120.9524],
    bodiesOfWater: ['Tullahan River', 'Manila Bay'],
    mangroves: true,
    location: 'North Manila',
    address: 'Caloocan City, NCR',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
    description: 'Urban city with important water bodies for fishing activities',
  },
  {
    name: 'Manila',
    coordinates: [14.5995, 120.9842],
    bodiesOfWater: ['Pasig River', 'Manila Bay'],
    mangroves: false,
    location: 'Central Manila',
    address: 'Manila City, NCR',
    image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop',
    description: 'Capital city with major water transportation routes',
  },
  {
    name: 'Las Piñas',
    coordinates: [14.3549, 120.9784],
    bodiesOfWater: ['Manila Bay', 'Zapote River'],
    mangroves: true,
    location: 'South Manila Bay',
    address: 'Las Piñas City, NCR',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
    description: 'Coastal city with extensive mangrove forests and fishing areas',
  },
  {
    name: 'Parañaque',
    coordinates: [14.3535, 120.9788],
    bodiesOfWater: ['Manila Bay', 'Parañaque River'],
    mangroves: true,
    location: 'South Manila Bay',
    address: 'Parañaque City, NCR',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    description: 'Port city with mangrove conservation areas and fishing communities',
  },
  {
    name: 'Pasay',
    coordinates: [14.5486, 120.9927],
    bodiesOfWater: ['Manila Bay', 'Parañaque River'],
    mangroves: false,
    location: 'Central Manila Bay',
    address: 'Pasay City, NCR',
    image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop',
    description: 'Urban coastal city with maritime commerce',
  },
];

// Fishing zone polygons in Manila Bay / NCR waters
const fishingZones = [
  {
    name: 'Navotas-Malabon Fishing Zone',
    type: 'Municipal Waters',
    color: '#e67e22',
    coordinates: [
      [14.6900, 120.8200],
      [14.6900, 120.8800],
      [14.6500, 120.8800],
      [14.6500, 120.8200],
    ],
    description: 'Primary municipal fishing zone for Navotas and Malabon fisherfolk',
  },
  {
    name: 'Manila Bay Central Fishing Zone',
    type: 'Commercial Fishing',
    color: '#8e44ad',
    coordinates: [
      [14.6200, 120.8800],
      [14.6200, 120.9500],
      [14.5500, 120.9500],
      [14.5500, 120.8800],
    ],
    description: 'Commercial fishing area in central Manila Bay',
  },
  {
    name: 'Las Pinas-Paranaque Fishing Zone',
    type: 'Municipal Waters',
    color: '#e67e22',
    coordinates: [
      [14.3800, 120.9400],
      [14.3800, 120.9900],
      [14.3300, 120.9900],
      [14.3300, 120.9400],
    ],
    description: 'Southern NCR municipal fishing grounds near Las Pinas and Paranaque',
  },
  {
    name: 'Manila Bay North Protected Zone',
    type: 'Protected Area',
    color: '#c0392b',
    coordinates: [
      [14.7000, 120.8500],
      [14.7000, 120.8900],
      [14.6700, 120.8900],
      [14.6700, 120.8500],
    ],
    description: 'Protected fishing area with seasonal restrictions for conservation',
  },
];

// Mangrove area polygons
const mangroveAreas = [
  {
    name: 'Navotas Mangrove Reserve',
    coordinates: [
      [14.6750, 120.8550],
      [14.6750, 120.8700],
      [14.6650, 120.8700],
      [14.6650, 120.8550],
    ],
  },
  {
    name: 'Las Pinas-Paranaque Wetland Park',
    coordinates: [
      [14.3600, 120.9650],
      [14.3600, 120.9850],
      [14.3450, 120.9850],
      [14.3450, 120.9650],
    ],
  },
  {
    name: 'Malabon Mangrove Area',
    coordinates: [
      [14.6850, 120.8300],
      [14.6850, 120.8450],
      [14.6750, 120.8450],
      [14.6750, 120.8300],
    ],
  },
];

// Water body polygons
const waterBodies = [
  {
    name: 'Manila Bay (NCR Section)',
    coordinates: [
      [14.7100, 120.8100],
      [14.7100, 120.9600],
      [14.5000, 120.9600],
      [14.5000, 120.8100],
    ],
  },
  {
    name: 'Pasig River Estuary',
    coordinates: [
      [14.6050, 120.9600],
      [14.6050, 120.9750],
      [14.5900, 120.9750],
      [14.5900, 120.9600],
    ],
  },
];

export default function Maps() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('maps');
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMangroves, setFilterMangroves] = useState('all');
  const [showLegend, setShowLegend] = useState(true);
  
  // Layer management
  const [activeLayers, setActiveLayers] = useState({
    cities: true,
    mangroves: true,
    waterBodies: true,
    fishingZones: true,
    bufferZones: false,
  });
  
  // Satellite imagery
  const [showSatellite, setShowSatellite] = useState(false);
  
  // Spatial analysis
  const [analysisMode, setAnalysisMode] = useState(null);
  const [analysisPoints, setAnalysisPoints] = useState([]);
  const [bufferRadius, setBufferRadius] = useState(5);
  const [spatialResults, setSpatialResults] = useState(null);
  
  // Coordinate transformation
  const [coordinateDisplay, setCoordinateDisplay] = useState(null);
  
  // Data editing and versioning
  const [editingCity, setEditingCity] = useState(null);
  const [dataVersions, setDataVersions] = useState([]);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const layersRef = useRef({});
  const polylineRef = useRef(null);

  useEffect(() => {
    loadLeaflet();
  }, []);

  // Handle layer visibility
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Toggle satellite/street map
    if (showSatellite) {
      if (layersRef.current.street) mapInstanceRef.current.removeLayer(layersRef.current.street);
      if (layersRef.current.satellite) mapInstanceRef.current.addLayer(layersRef.current.satellite);
    } else {
      if (layersRef.current.satellite) mapInstanceRef.current.removeLayer(layersRef.current.satellite);
      if (layersRef.current.street) mapInstanceRef.current.addLayer(layersRef.current.street);
    }
  }, [showSatellite]);

  // Handle feature layer visibility
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Toggle city markers
    Object.keys(markersRef.current).forEach(cityName => {
      const marker = markersRef.current[cityName];
      if (marker) {
        if (activeLayers.cities) {
          if (!map.hasLayer(marker)) map.addLayer(marker);
        } else {
          if (map.hasLayer(marker)) map.removeLayer(marker);
        }
      }
    });

    // Toggle mangrove area polygons
    if (layersRef.current.mangroveGroup) {
      if (activeLayers.mangroves) {
        if (!map.hasLayer(layersRef.current.mangroveGroup)) map.addLayer(layersRef.current.mangroveGroup);
      } else {
        if (map.hasLayer(layersRef.current.mangroveGroup)) map.removeLayer(layersRef.current.mangroveGroup);
      }
    }

    // Toggle water body polygons
    if (layersRef.current.waterBodyGroup) {
      if (activeLayers.waterBodies) {
        if (!map.hasLayer(layersRef.current.waterBodyGroup)) map.addLayer(layersRef.current.waterBodyGroup);
      } else {
        if (map.hasLayer(layersRef.current.waterBodyGroup)) map.removeLayer(layersRef.current.waterBodyGroup);
      }
    }

    // Toggle fishing zone polygons
    if (layersRef.current.fishingZoneGroup) {
      if (activeLayers.fishingZones) {
        if (!map.hasLayer(layersRef.current.fishingZoneGroup)) map.addLayer(layersRef.current.fishingZoneGroup);
      } else {
        if (map.hasLayer(layersRef.current.fishingZoneGroup)) map.removeLayer(layersRef.current.fishingZoneGroup);
      }
    }
  }, [activeLayers]);

  // Redraw buffer zone when radius changes
  useEffect(() => {
    if (analysisMode === 'buffer' && spatialResults && spatialResults.type === 'buffer' && layersRef.current.bufferZone) {
      // Redraw the buffer zone with new radius
      const currentCenter = layersRef.current.bufferZone.getLatLng();
      createBufferZone([currentCenter.lat, currentCenter.lng], bufferRadius);
      
      // Update spatial results with new radius
      const citiesInBuffer = queryCitiesInRadius(currentCenter.lat, currentCenter.lng, bufferRadius);
      setSpatialResults({
        type: 'buffer',
        radius: bufferRadius,
        citiesFound: citiesInBuffer.length,
        cities: citiesInBuffer,
      });
    }
  }, [bufferRadius]);

  const loadLeaflet = () => {
    if (window.L) {
      initializeMap();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => {
      initializeMap();
    };
    document.body.appendChild(script);
  };

  // Haversine formula for distance calculation
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Spatial query: find cities within radius
  const queryCitiesInRadius = (centerLat, centerLon, radiusKm) => {
    return ncrCities.filter(city => {
      const distance = calculateDistance(centerLat, centerLon, city.coordinates[0], city.coordinates[1]);
      return distance <= radiusKm;
    });
  };

  // Create buffer zone visualization
  const createBufferZone = (centerCoords, radiusKm) => {
    if (!mapInstanceRef.current) return;
    
    if (layersRef.current.bufferZone) {
      mapInstanceRef.current.removeLayer(layersRef.current.bufferZone);
    }

    const circle = window.L.circle(centerCoords, {
      radius: radiusKm * 1000,
      color: '#f39c12',
      weight: 2,
      opacity: 0.5,
      fillOpacity: 0.1,
      fillColor: '#f39c12',
    });

    circle.addTo(mapInstanceRef.current);
    layersRef.current.bufferZone = circle;
  };

  // Handle map click for spatial analysis
  const handleMapClick = (e) => {
    if (analysisMode === 'distance') {
      const newPoint = [e.latlng.lat, e.latlng.lng];
      setAnalysisPoints(prev => [...prev, newPoint]);

      if (analysisPoints.length > 0) {
        const distance = calculateDistance(
          analysisPoints[analysisPoints.length - 1][0],
          analysisPoints[analysisPoints.length - 1][1],
          newPoint[0],
          newPoint[1]
        );

        setSpatialResults({
          type: 'distance',
          distance: distance.toFixed(2),
          points: analysisPoints.length + 1,
        });
      }
    } else if (analysisMode === 'buffer') {
      const citiesInBuffer = queryCitiesInRadius(e.latlng.lat, e.latlng.lng, bufferRadius);
      createBufferZone([e.latlng.lat, e.latlng.lng], bufferRadius);
      setSpatialResults({
        type: 'buffer',
        radius: bufferRadius,
        citiesFound: citiesInBuffer.length,
        cities: citiesInBuffer,
      });
    }
  };

  // Export data as GeoJSON
  const exportGeoJSON = () => {
    const geoJSON = {
      type: 'FeatureCollection',
      features: ncrCities.map(city => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [city.coordinates[1], city.coordinates[0]],
        },
        properties: {
          name: city.name,
          mangroves: city.mangroves,
          bodiesOfWater: city.bodiesOfWater,
        },
      })),
    };

    const dataStr = JSON.stringify(geoJSON, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nrc-fishing-areas.geojson';
    link.click();
  };

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = window.L.map(mapRef.current).setView([14.6091, 120.9824], 11);

    // Street map layer
    const streetLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    });

    // Satellite layer
    const satelliteLayer = window.L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles © Esri',
        maxZoom: 18,
      }
    );

    streetLayer.addTo(map);
    layersRef.current.street = streetLayer;
    layersRef.current.satellite = satelliteLayer;

    // --- Water body polygon layer ---
    const waterBodyGroup = window.L.layerGroup();
    waterBodies.forEach((wb) => {
      const polygon = window.L.polygon(wb.coordinates, {
        color: '#3498db',
        weight: 2,
        opacity: 0.5,
        fillColor: '#3498db',
        fillOpacity: 0.15,
      });
      polygon.bindPopup(`<b>${wb.name}</b><br><span style="color:#3498db;">Water Body</span>`);
      polygon.addTo(waterBodyGroup);
    });
    waterBodyGroup.addTo(map);
    layersRef.current.waterBodyGroup = waterBodyGroup;

    // --- Mangrove area polygon layer ---
    const mangroveGroup = window.L.layerGroup();
    mangroveAreas.forEach((ma) => {
      const polygon = window.L.polygon(ma.coordinates, {
        color: '#2ecc71',
        weight: 2,
        opacity: 0.6,
        fillColor: '#2ecc71',
        fillOpacity: 0.25,
        dashArray: '5, 5',
      });
      polygon.bindPopup(`<b>${ma.name}</b><br><span style="color:#2ecc71;">Mangrove Area</span>`);
      polygon.addTo(mangroveGroup);
    });
    mangroveGroup.addTo(map);
    layersRef.current.mangroveGroup = mangroveGroup;

    // --- Fishing zone polygon layer ---
    const fishingZoneGroup = window.L.layerGroup();
    fishingZones.forEach((fz) => {
      const polygon = window.L.polygon(fz.coordinates, {
        color: fz.color,
        weight: 2,
        opacity: 0.7,
        fillColor: fz.color,
        fillOpacity: 0.2,
        dashArray: fz.type === 'Protected Area' ? '10, 6' : null,
      });
      polygon.bindPopup(
        `<b>${fz.name}</b><br>` +
        `<span style="color:${fz.color};font-weight:600;">${fz.type}</span><br>` +
        `<span style="font-size:12px;">${fz.description}</span>`
      );
      polygon.addTo(fishingZoneGroup);
    });
    fishingZoneGroup.addTo(map);
    layersRef.current.fishingZoneGroup = fishingZoneGroup;

    // --- City markers (on top) ---
    ncrCities.forEach((city) => {
      const marker = window.L.circleMarker(city.coordinates, {
        radius: 10,
        fillColor: city.mangroves ? '#2ecc71' : '#3498db',
        color: '#fff',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.7,
      });

      marker.bindPopup(`<b>${city.name}</b><br>${city.bodiesOfWater.join(', ')}`);

      marker.on('click', () => {
        setSelectedCity(city);
      });

      marker.addTo(map);
      markersRef.current[city.name] = marker;
    });

    // Add map click handler for spatial analysis
    map.on('click', handleMapClick);

    // Coordinate display on mouse move
    map.on('mousemove', (e) => {
      setCoordinateDisplay({
        lat: e.latlng.lat.toFixed(6),
        lng: e.latlng.lng.toFixed(6),
      });
    });

    mapInstanceRef.current = map;
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(city.coordinates, 13);
      const marker = markersRef.current[city.name];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const filteredCities = ncrCities.filter((city) => {
    const matchesSearch = city.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMangroves =
      filterMangroves === 'all' ||
      (filterMangroves === 'with' && city.mangroves) ||
      (filterMangroves === 'without' && !city.mangroves);
    return matchesSearch && matchesMangroves;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setFilterMangroves('all');
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="main-content">
        <Header title="MAPS - NCR FISHING AREAS" user={user} />
        <div className="maps-content">
          <div className="maps-filter-section">
            <div className="filter-top">
              <h3>SEARCH FISHING AREAS</h3>
              <button className="export-btn" onClick={exportGeoJSON}>
                Download GeoJSON
              </button>
            </div>
            <div className="maps-filters-grid">
              <input
                type="text"
                placeholder="Search city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="maps-search-input"
              />
              <select
                value={filterMangroves}
                onChange={(e) => setFilterMangroves(e.target.value)}
                className="maps-filter-select"
              >
                <option value="all">All Features</option>
                <option value="with">With Mangroves</option>
                <option value="without">Without Mangroves</option>
              </select>
            </div>

            <div className="gis-controls-section">
              <div className="control-group">
                <label>Map Layer</label>
                <div className="layer-buttons">
                  <button
                    className={`layer-btn ${!showSatellite ? 'active' : ''}`}
                    onClick={() => setShowSatellite(false)}
                  >
                    Street Map
                  </button>
                  <button
                    className={`layer-btn ${showSatellite ? 'active' : ''}`}
                    onClick={() => setShowSatellite(true)}
                  >
                    Satellite
                  </button>
                </div>
              </div>

              <div className="control-group">
                <label>Feature Layers</label>
                <div className="feature-toggles">
                  <label className="feature-label">
                    <input
                      type="checkbox"
                      checked={activeLayers.cities}
                      onChange={(e) => setActiveLayers(prev => ({ ...prev, cities: e.target.checked }))}
                    />
                    Cities & Towns
                  </label>
                  <label className="feature-label">
                    <input
                      type="checkbox"
                      checked={activeLayers.mangroves}
                      onChange={(e) => setActiveLayers(prev => ({ ...prev, mangroves: e.target.checked }))}
                    />
                    Mangrove Areas
                  </label>
                  <label className="feature-label">
                    <input
                      type="checkbox"
                      checked={activeLayers.waterBodies}
                      onChange={(e) => setActiveLayers(prev => ({ ...prev, waterBodies: e.target.checked }))}
                    />
                    Water Bodies
                  </label>
                  <label className="feature-label">
                    <input
                      type="checkbox"
                      checked={activeLayers.fishingZones}
                      onChange={(e) => setActiveLayers(prev => ({ ...prev, fishingZones: e.target.checked }))}
                    />
                    Fishing Zones
                  </label>
                </div>
              </div>

              <div className="control-group">
                <label>Spatial Analysis</label>
                <div className="analysis-buttons">
                  <button
                    className={`analysis-btn ${analysisMode === 'distance' ? 'active' : ''}`}
                    onClick={() => {
                      setAnalysisMode(analysisMode === 'distance' ? null : 'distance');
                      setAnalysisPoints([]);
                      setSpatialResults(null);
                    }}
                  >
                    Measure Distance
                  </button>
                  <button
                    className={`analysis-btn ${analysisMode === 'buffer' ? 'active' : ''}`}
                    onClick={() => {
                      setAnalysisMode(analysisMode === 'buffer' ? null : 'buffer');
                      setSpatialResults(null);
                    }}
                  >
                    Buffer Zone
                  </button>
                </div>
                {analysisMode === 'buffer' && (
                  <div className="buffer-input-group">
                    <label>Radius (km):</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={bufferRadius}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 1 && value <= 50) {
                          setBufferRadius(value);
                        }
                      }}
                      className="buffer-input"
                      placeholder="Enter radius in km"
                    />
                    <span className="buffer-value">{bufferRadius} km</span>
                  </div>
                )}
              </div>

              {coordinateDisplay && (
                <div className="coordinate-info">
                  <p>Lat: {coordinateDisplay.lat}</p>
                  <p>Lng: {coordinateDisplay.lng}</p>
                </div>
              )}
            </div>
          </div>

          <div className="maps-layout">
            <div className="map-section">
              <div className="map-container" ref={mapRef}></div>
              {showLegend && (
                <div className="maps-legend">
                  <div className="legend-header">
                    <h4>Legend</h4>
                    <button className="legend-close" onClick={() => setShowLegend(false)}>
                      ×
                    </button>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon mangrove-icon"></span>
                    <span>Mangrove Areas</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon water-icon"></span>
                    <span>Water Bodies</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon municipal-zone-icon"></span>
                    <span>Municipal Fishing Zone</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon commercial-zone-icon"></span>
                    <span>Commercial Fishing Zone</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon protected-zone-icon"></span>
                    <span>Protected Area</span>
                  </div>
                </div>
              )}
            </div>

            <div className="cities-panel">
              <div className="panel-header">
                <h3>NCR Cities ({filteredCities.length})</h3>
                <button className="toggle-legend" onClick={() => setShowLegend(!showLegend)}>
                  ≡
                </button>
              </div>
              <div className="cities-list">
                {filteredCities.length === 0 ? (
                  <div className="no-results">No cities match your filters</div>
                ) : (
                  filteredCities.map((city) => (
                    <button
                      key={city.name}
                      className={`city-btn ${selectedCity?.name === city.name ? 'active' : ''}`}
                      onClick={() => handleCitySelect(city)}
                    >
                      <span className="city-name">{city.name}</span>
                      <span className={`city-badge ${city.mangroves ? 'mangrove' : 'water'}`}>
                        {city.mangroves ? '🌿 Mangroves' : '🌊 Water'}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {spatialResults && (
            <div className="spatial-results-panel">
              <div className="results-header">
                <h3>Spatial Analysis Results</h3>
                <button className="close-results" onClick={() => setSpatialResults(null)}>×</button>
              </div>
              {spatialResults.type === 'distance' && (
                <div className="results-content">
                  <p><strong>Distance:</strong> {spatialResults.distance} km</p>
                  <p><strong>Points Measured:</strong> {spatialResults.points}</p>
                  <button className="clear-analysis-btn" onClick={() => {
                    setAnalysisPoints([]);
                    setSpatialResults(null);
                  }}>
                    Clear Measurement
                  </button>
                </div>
              )}
              {spatialResults.type === 'buffer' && (
                <div className="results-content">
                  <p><strong>Buffer Radius:</strong> {spatialResults.radius} km</p>
                  <p><strong>Cities Found:</strong> {spatialResults.citiesFound}</p>
                  {spatialResults.cities.length > 0 && (
                    <div className="cities-in-buffer">
                      <strong>Cities in Buffer:</strong>
                      <ul>
                        {spatialResults.cities.map(city => (
                          <li key={city.name}>{city.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedCity && (
            <div className="city-details">
              <div className="detail-header">
                <h2>{selectedCity.name}</h2>
                <button className="close-btn" onClick={() => setSelectedCity(null)}>
                  ×
                </button>
              </div>

              <div className="detail-content">
                <div className="detail-image">
                  <img src={selectedCity.image} alt={selectedCity.name} />
                </div>

                <div className="detail-info">
                  <div className="info-section">
                    <h4>Location</h4>
                    <p>{selectedCity.location}</p>
                  </div>

                  <div className="info-section">
                    <h4>Address</h4>
                    <p>{selectedCity.address}</p>
                  </div>

                  <div className="info-section">
                    <h4>Bodies of Water</h4>
                    <div className="water-list">
                      {selectedCity.bodiesOfWater.map((water) => (
                        <span key={water} className="water-tag">
                          {water}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="info-section">
                    <h4>Mangroves</h4>
                    <p className={selectedCity.mangroves ? 'has-mangroves' : 'no-mangroves'}>
                      {selectedCity.mangroves ? '✓ Present' : '✗ Not present'}
                    </p>
                  </div>

                  <div className="info-section">
                    <h4>Description</h4>
                    <p>{selectedCity.description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
