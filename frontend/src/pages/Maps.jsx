'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { mapsAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/Maps.css';

// ── All 17 NCR LGUs with district, specialty, and coordinates ──────────────
const ncrLGUs = [
  // First District
  {
    name: 'Manila',
    district: 1,
    coordinates: [14.5995, 120.9842],
    bodiesOfWater: ['Manila Bay', 'Pasig River', 'Manila Harbor'],
    mangroves: false,
    location: 'Central NCR',
    address: 'City of Manila',
    image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop',
    description: 'Capital city; major hub for fisherfolk trading along Manila Bay and Pasig River estuary.',
    specialties: ['Bangus processing', 'Dried fish trade', 'Small-scale fishing along Pasig River'],
  },

  // Second District
  {
    name: 'Mandaluyong',
    district: 2,
    coordinates: [14.5794, 121.0359],
    bodiesOfWater: ['Pasig River'],
    mangroves: false,
    location: 'Central NCR',
    address: 'City of Mandaluyong',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    description: 'Urban LGU along Pasig River; limited but active small-scale river fishing community.',
    specialties: ['River fishing (Pasig River)', 'Ornamental fish trading'],
  },
  {
    name: 'Marikina',
    district: 2,
    coordinates: [14.6507, 121.1029],
    bodiesOfWater: ['Marikina River'],
    mangroves: false,
    location: 'Eastern NCR',
    address: 'City of Marikina',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
    description: 'Inland city with active freshwater fishing along the Marikina River.',
    specialties: ['Freshwater tilapia culture', 'River-based fishing'],
  },
  {
    name: 'Pasig',
    district: 2,
    coordinates: [14.5764, 121.0851],
    bodiesOfWater: ['Pasig River', 'Laguna de Bay'],
    mangroves: false,
    location: 'Eastern NCR',
    address: 'City of Pasig',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    description: 'Located along Pasig River with access to Laguna de Bay; notable for lake-based fishing.',
    specialties: ['Laguna de Bay fish culture', 'Tilapia and milkfish pen culture'],
  },
  {
    name: 'Quezon City',
    district: 2,
    coordinates: [14.6760, 121.0437],
    bodiesOfWater: ['Tullahan River', 'San Juan River'],
    mangroves: false,
    location: 'Northern NCR',
    address: 'Quezon City',
    image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop',
    description: 'Largest LGU in NCR; river systems support small-scale freshwater fishing communities.',
    specialties: ['Freshwater fishing', 'Aquaculture cooperatives'],
  },
  {
    name: 'San Juan',
    district: 2,
    coordinates: [14.6000, 121.0300],
    bodiesOfWater: ['San Juan River'],
    mangroves: false,
    location: 'Central NCR',
    address: 'City of San Juan',
    image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop',
    description: 'Smallest LGU in NCR; minor river fishing along San Juan River.',
    specialties: ['Small-scale river fishing'],
  },

  // Third District
  {
    name: 'Caloocan',
    district: 3,
    coordinates: [14.6494, 120.9670],
    bodiesOfWater: ['Tullahan River', 'Manila Bay'],
    mangroves: true,
    location: 'Northern NCR',
    address: 'City of Caloocan',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
    description: 'Northern coastal LGU with access to Manila Bay and Tullahan River.',
    specialties: ['Municipal fishing (Manila Bay)', 'Dried fish processing'],
  },
  {
    name: 'Malabon',
    district: 3,
    coordinates: [14.6619, 120.9571],
    bodiesOfWater: ['Manila Bay', 'Malabon River', 'Navotas River'],
    mangroves: true,
    location: 'Northern Manila Bay',
    address: 'City of Malabon',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    description: 'Historically one of the most productive fishing cities in NCR; renowned for fish processing.',
    specialties: ['Bagoong (shrimp paste)', 'Fish sauce (patis)', 'Fish ball manufacturing', 'Bangus milkfish farming'],
  },
  {
    name: 'Navotas',
    district: 3,
    coordinates: [14.6617, 120.9420],
    bodiesOfWater: ['Manila Bay', 'Navotas Harbor', 'Navotas River'],
    mangroves: true,
    location: 'Northern Manila Bay',
    address: 'City of Navotas',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
    description: 'Fishing capital of the Philippines; largest fishing port in Southeast Asia.',
    specialties: ['Commercial fishing hub (Navotas Fish Port)', 'Bagoong production', 'Fish sauce (patis)', 'Mussel farming', 'Ice and cold storage industry'],
  },
  {
    name: 'Valenzuela',
    district: 3,
    coordinates: [14.7011, 120.9830],
    bodiesOfWater: ['Tullahan River', 'Meycauayan River'],
    mangroves: false,
    location: 'Northern NCR',
    address: 'City of Valenzuela',
    image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop',
    description: 'Northern industrial city with river fishing communities along Tullahan and Meycauayan Rivers.',
    specialties: ['Freshwater fish culture', 'Tilapia production'],
  },

  // Fourth District
  {
    name: 'Las Pinas',
    district: 4,
    coordinates: [14.4453, 120.9833],
    bodiesOfWater: ['Manila Bay', 'Zapote River', 'Las Pinas River'],
    mangroves: true,
    location: 'Southern Manila Bay',
    address: 'City of Las Pinas',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
    description: 'Southern coastal LGU with mangrove conservation areas and active fisherfolk communities.',
    specialties: ['Mangrove ecosystem management', 'Municipal fishing (Manila Bay)', 'Seashell gathering'],
  },
  {
    name: 'Makati',
    district: 4,
    coordinates: [14.5547, 121.0244],
    bodiesOfWater: ['Pasig River'],
    mangroves: false,
    location: 'Central NCR',
    address: 'City of Makati',
    image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop',
    description: 'Financial capital; limited river fishing along Pasig River; major fish market trade.',
    specialties: ['Fish market trading hub', 'Seafood distribution'],
  },
  {
    name: 'Muntinlupa',
    district: 4,
    coordinates: [14.4081, 121.0415],
    bodiesOfWater: ['Laguna de Bay', 'Alabang River'],
    mangroves: false,
    location: 'Southern NCR',
    address: 'City of Muntinlupa',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    description: 'Southernmost city with extensive Laguna de Bay shoreline; major lake fishery.',
    specialties: ['Laguna de Bay commercial fishing', 'Fish cage aquaculture', 'Bangus and tilapia pen culture'],
  },
  {
    name: 'Paranaque',
    district: 4,
    coordinates: [14.4793, 121.0198],
    bodiesOfWater: ['Manila Bay', 'Paranaque River', 'San Dionisio Creek'],
    mangroves: true,
    location: 'Southern Manila Bay',
    address: 'City of Paranaque',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    description: 'Coastal city with significant mangrove conservation efforts and active fisherfolk.',
    specialties: ['Manila Bay municipal fishing', 'Mangrove rehabilitation', 'Crab and shrimp culture'],
  },
  {
    name: 'Pasay',
    district: 4,
    coordinates: [14.5378, 120.9930],
    bodiesOfWater: ['Manila Bay'],
    mangroves: false,
    location: 'Central Manila Bay',
    address: 'City of Pasay',
    image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop',
    description: 'Urban coastal city; fishing communities along Manila Bay near CCP Complex.',
    specialties: ['Small-scale Manila Bay fishing', 'Seafood vending'],
  },
  {
    name: 'Pateros',
    district: 4,
    coordinates: [14.5433, 121.0682],
    bodiesOfWater: ['Pateros River', 'Laguna de Bay'],
    mangroves: false,
    location: 'Eastern NCR',
    address: 'Municipality of Pateros',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
    description: 'Only municipality in NCR; historic center of balut duck egg production along the river.',
    specialties: ['Duck egg (balut) production', 'Itik (duck) farming', 'Freshwater fishing'],
  },
  {
    name: 'Taguig',
    district: 4,
    coordinates: [14.5243, 121.0792],
    bodiesOfWater: ['Laguna de Bay', 'Napindan River', 'Laguna Lake'],
    mangroves: false,
    location: 'Southeastern NCR',
    address: 'City of Taguig',
    image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop',
    description: 'Fast-growing city along Laguna de Bay; major lake fishing community in Hagonoy area.',
    specialties: ['Laguna de Bay lake fishing', 'Pen fish culture (bangus, tilapia)', 'Fish landing operations (Hagonoy Fish Port)', '2-year registration renewal (per local ordinance)'],
  },
];

// District color mapping
const DISTRICT_COLORS = {
  1: '#1d6fa4',
  2: '#2ecc71',
  3: '#e67e22',
  4: '#9b59b6',
};

const DISTRICT_NAMES = {
  1: 'First District',
  2: 'Second District',
  3: 'Third District',
  4: 'Fourth District',
};

// Mangrove areas (within NCR bounds)
const mangroveAreas = [
  {
    name: 'Navotas-Malabon Mangrove Belt',
    coordinates: [
      [14.6750, 120.9380],
      [14.6750, 120.9520],
      [14.6550, 120.9520],
      [14.6550, 120.9380],
    ],
  },
  {
    name: 'Las Pinas-Paranaque Critical Habitat & Ecotourism Area',
    coordinates: [
      [14.4700, 120.9900],
      [14.4700, 121.0050],
      [14.4450, 121.0050],
      [14.4450, 120.9900],
    ],
  },
  {
    name: 'Caloocan Coastal Mangroves',
    coordinates: [
      [14.6600, 120.9580],
      [14.6600, 120.9680],
      [14.6500, 120.9680],
      [14.6500, 120.9580],
    ],
  },
];

// Water bodies (within NCR bounds only)
const waterBodies = [
  {
    name: 'Manila Bay (NCR Section)',
    coordinates: [
      [14.7100, 120.8500],
      [14.7100, 121.0000],
      [14.3800, 121.0000],
      [14.3800, 120.8500],
    ],
  },
  {
    name: 'Laguna de Bay (NCR Shore)',
    coordinates: [
      [14.5600, 121.1000],
      [14.5600, 121.1600],
      [14.3800, 121.1600],
      [14.3800, 121.1000],
    ],
  },
  {
    name: 'Pasig River',
    coordinates: [
      [14.6050, 120.9700],
      [14.6050, 121.1000],
      [14.5900, 121.1000],
      [14.5900, 120.9700],
    ],
  },
];

export default function Maps() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentPage] = useState('maps');
  const [selectedLGU, setSelectedLGU] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterMangroves, setFilterMangroves] = useState('all');
  const [showLegend, setShowLegend] = useState(true);
  const [cityStats, setCityStats] = useState({});
  const [showSatellite, setShowSatellite] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    lguMarkers: true,
    mangroves: true,
    waterBodies: true,
  });
  const [coordinateDisplay, setCoordinateDisplay] = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const layersRef = useRef({});

  useEffect(() => {
    loadLeaflet();
    fetchCityStats();
  }, []);

  const fetchCityStats = async () => {
    try {
      const res = await mapsAPI.getCityStats();
      const map = {};
      (res.data || []).forEach((s) => { if (s.city) map[s.city] = s; });
      setCityStats(map);
    } catch {
      // non-fatal
    }
  };

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (showSatellite) {
      if (layersRef.current.street) mapInstanceRef.current.removeLayer(layersRef.current.street);
      if (layersRef.current.satellite) mapInstanceRef.current.addLayer(layersRef.current.satellite);
    } else {
      if (layersRef.current.satellite) mapInstanceRef.current.removeLayer(layersRef.current.satellite);
      if (layersRef.current.street) mapInstanceRef.current.addLayer(layersRef.current.street);
    }
  }, [showSatellite]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    Object.values(markersRef.current).forEach((m) => {
      if (activeLayers.lguMarkers) { if (!map.hasLayer(m)) map.addLayer(m); }
      else { if (map.hasLayer(m)) map.removeLayer(m); }
    });
    if (layersRef.current.mangroveGroup) {
      if (activeLayers.mangroves) { if (!map.hasLayer(layersRef.current.mangroveGroup)) map.addLayer(layersRef.current.mangroveGroup); }
      else { if (map.hasLayer(layersRef.current.mangroveGroup)) map.removeLayer(layersRef.current.mangroveGroup); }
    }
    if (layersRef.current.waterBodyGroup) {
      if (activeLayers.waterBodies) { if (!map.hasLayer(layersRef.current.waterBodyGroup)) map.addLayer(layersRef.current.waterBodyGroup); }
      else { if (map.hasLayer(layersRef.current.waterBodyGroup)) map.removeLayer(layersRef.current.waterBodyGroup); }
    }
  }, [activeLayers]);

  const loadLeaflet = () => {
    if (window.L) { initializeMap(); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => initializeMap();
    document.body.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Center on NCR and restrict bounds to NCR only
    const NCR_BOUNDS = window.L.latLngBounds(
      [14.3500, 120.8500], // SW corner
      [14.7500, 121.2000]  // NE corner
    );

    const map = window.L.map(mapRef.current, {
      maxBounds: NCR_BOUNDS,
      maxBoundsViscosity: 1.0,
      minZoom: 10,
    }).setView([14.5547, 121.0244], 11);

    const streetLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    });
    const satelliteLayer = window.L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles © Esri', maxZoom: 18 }
    );
    streetLayer.addTo(map);
    layersRef.current.street = streetLayer;
    layersRef.current.satellite = satelliteLayer;

    // Water bodies
    const waterBodyGroup = window.L.layerGroup();
    waterBodies.forEach((wb) => {
      window.L.polygon(wb.coordinates, {
        color: '#3498db', weight: 1, opacity: 0.4,
        fillColor: '#3498db', fillOpacity: 0.12,
      }).bindPopup(`<b>${wb.name}</b><br><span style="color:#3498db;">Water Body</span>`)
        .addTo(waterBodyGroup);
    });
    waterBodyGroup.addTo(map);
    layersRef.current.waterBodyGroup = waterBodyGroup;

    // Mangrove areas
    const mangroveGroup = window.L.layerGroup();
    mangroveAreas.forEach((ma) => {
      window.L.polygon(ma.coordinates, {
        color: '#27ae60', weight: 2, opacity: 0.7,
        fillColor: '#27ae60', fillOpacity: 0.25, dashArray: '6, 4',
      }).bindPopup(`<b>${ma.name}</b><br><span style="color:#27ae60;">Mangrove Area</span>`)
        .addTo(mangroveGroup);
    });
    mangroveGroup.addTo(map);
    layersRef.current.mangroveGroup = mangroveGroup;

    // LGU markers — colored by district
    ncrLGUs.forEach((lgu) => {
      const color = DISTRICT_COLORS[lgu.district];
      const marker = window.L.circleMarker(lgu.coordinates, {
        radius: 9,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      });

      marker.bindPopup(
        `<div style="min-width:160px;">` +
        `<b style="font-size:14px;">${lgu.name}</b><br>` +
        `<span style="color:${color};font-weight:600;font-size:11px;">${DISTRICT_NAMES[lgu.district]}</span><br>` +
        `<span style="font-size:11px;color:#555;">${lgu.bodiesOfWater.join(', ')}</span>` +
        `</div>`
      );

      marker.on('click', () => setSelectedLGU(lgu));
      marker.addTo(map);
      markersRef.current[lgu.name] = marker;
    });

    map.on('mousemove', (e) => {
      setCoordinateDisplay({ lat: e.latlng.lat.toFixed(5), lng: e.latlng.lng.toFixed(5) });
    });

    mapInstanceRef.current = map;
  };

  const handleLGUSelect = (lgu) => {
    setSelectedLGU(lgu);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(lgu.coordinates, 13);
      const marker = markersRef.current[lgu.name];
      if (marker) marker.openPopup();
    }
  };

  const filteredLGUs = ncrLGUs.filter((lgu) => {
    const matchSearch = lgu.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDistrict = filterDistrict === 'all' || String(lgu.district) === filterDistrict;
    const matchMangrove =
      filterMangroves === 'all' ||
      (filterMangroves === 'with' && lgu.mangroves) ||
      (filterMangroves === 'without' && !lgu.mangroves);
    return matchSearch && matchDistrict && matchMangrove;
  });

  const exportGeoJSON = () => {
    const geoJSON = {
      type: 'FeatureCollection',
      features: ncrLGUs.map((lgu) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lgu.coordinates[1], lgu.coordinates[0]] },
        properties: { name: lgu.name, district: lgu.district, mangroves: lgu.mangroves, specialties: lgu.specialties },
      })),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(geoJSON, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'ncr-lgus.geojson'; a.click();
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={() => {}} onLogout={logout} />
      <div className="main-content">
        <Header title="MAPS" user={user} />
        <div className="maps-content">

          {/* ── Filter Panel ───────────────────────────────────────────────── */}
          <div className="maps-filter-section">
            <div className="filter-top">
              <h3>NCR LGU FISHING AREAS</h3>
              <button className="export-btn" onClick={exportGeoJSON}>Download GeoJSON</button>
            </div>
            <div className="maps-filters-grid">
              <input
                type="text"
                placeholder="Search LGU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="maps-search-input"
              />
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="maps-filter-select"
              >
                <option value="all">All Districts</option>
                <option value="1">First District</option>
                <option value="2">Second District</option>
                <option value="3">Third District</option>
                <option value="4">Fourth District</option>
              </select>
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
                  <button className={`layer-btn ${!showSatellite ? 'active' : ''}`} onClick={() => setShowSatellite(false)}>Street Map</button>
                  <button className={`layer-btn ${showSatellite ? 'active' : ''}`} onClick={() => setShowSatellite(true)}>Satellite</button>
                </div>
              </div>
              <div className="control-group">
                <label>Feature Layers</label>
                <div className="feature-toggles">
                  <label className="feature-label">
                    <input type="checkbox" checked={activeLayers.lguMarkers} onChange={(e) => setActiveLayers(p => ({ ...p, lguMarkers: e.target.checked }))} />
                    LGU Markers
                  </label>
                  <label className="feature-label">
                    <input type="checkbox" checked={activeLayers.mangroves} onChange={(e) => setActiveLayers(p => ({ ...p, mangroves: e.target.checked }))} />
                    Mangrove Areas
                  </label>
                  <label className="feature-label">
                    <input type="checkbox" checked={activeLayers.waterBodies} onChange={(e) => setActiveLayers(p => ({ ...p, waterBodies: e.target.checked }))} />
                    Water Bodies
                  </label>
                </div>
              </div>
              {coordinateDisplay && (
                <div className="coordinate-info">
                  <p>Lat: {coordinateDisplay.lat}</p>
                  <p>Lng: {coordinateDisplay.lng}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Map + Sidebar ──────────────────────────────────────────────── */}
          <div className="maps-layout">
            <div className="map-section">
              <div className="map-container" ref={mapRef}></div>

              {showLegend && (
                <div className="maps-legend">
                  <div className="legend-header">
                    <h4>Legend</h4>
                    <button className="legend-close" onClick={() => setShowLegend(false)}>×</button>
                  </div>
                  <p className="legend-section-label">Districts</p>
                  {Object.entries(DISTRICT_NAMES).map(([d, name]) => (
                    <div key={d} className="legend-item">
                      <span className="legend-dot" style={{ background: DISTRICT_COLORS[d] }}></span>
                      <span>{name}</span>
                    </div>
                  ))}
                  <p className="legend-section-label" style={{ marginTop: 10 }}>Overlays</p>
                  <div className="legend-item">
                    <span className="legend-icon mangrove-icon"></span>
                    <span>Mangrove Areas</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon water-icon"></span>
                    <span>Water Bodies</span>
                  </div>
                </div>
              )}
            </div>

            <div className="cities-panel">
              <div className="panel-header">
                <h3>NCR LGUs ({filteredLGUs.length} / 17)</h3>
                <button className="toggle-legend" onClick={() => setShowLegend(!showLegend)}>Legend</button>
              </div>
              <div className="cities-list">
                {filteredLGUs.length === 0 ? (
                  <div className="no-results">No LGUs match your filters</div>
                ) : (
                  filteredLGUs.map((lgu) => (
                    <button
                      key={lgu.name}
                      className={`city-btn ${selectedLGU?.name === lgu.name ? 'active' : ''}`}
                      onClick={() => handleLGUSelect(lgu)}
                    >
                      <span className="city-name">{lgu.name}</span>
                      <span
                        className="city-badge district-badge"
                        style={{ background: DISTRICT_COLORS[lgu.district] + '22', color: DISTRICT_COLORS[lgu.district], border: `1px solid ${DISTRICT_COLORS[lgu.district]}55` }}
                      >
                        D{lgu.district}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── LGU Detail Card ─────────────────────────��──────────────────── */}
          {selectedLGU && (
            <div className="city-details">
              <div className="detail-header">
                <div>
                  <h2>{selectedLGU.name}</h2>
                  <span
                    className="district-tag"
                    style={{ background: DISTRICT_COLORS[selectedLGU.district], color: '#fff' }}
                  >
                    {DISTRICT_NAMES[selectedLGU.district]}
                  </span>
                </div>
                <button className="close-btn" onClick={() => setSelectedLGU(null)}>×</button>
              </div>

              <div className="detail-content">
                <div className="detail-image">
                  <img src={selectedLGU.image} alt={selectedLGU.name} crossOrigin="anonymous" />
                </div>

                <div className="detail-info">
                  <div className="info-section">
                    <h4>Address</h4>
                    <p>{selectedLGU.address}</p>
                  </div>
                  <div className="info-section">
                    <h4>Bodies of Water</h4>
                    <div className="water-list">
                      {selectedLGU.bodiesOfWater.map((w) => (
                        <span key={w} className="water-tag">{w}</span>
                      ))}
                    </div>
                  </div>
                  <div className="info-section">
                    <h4>District Specialties</h4>
                    <ul className="specialties-list">
                      {selectedLGU.specialties.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="info-section">
                    <h4>Mangroves</h4>
                    <p className={selectedLGU.mangroves ? 'has-mangroves' : 'no-mangroves'}>
                      {selectedLGU.mangroves ? 'Present' : 'Not present'}
                    </p>
                  </div>
                  <div className="info-section">
                    <h4>Description</h4>
                    <p>{selectedLGU.description}</p>
                  </div>
                  <div className="info-section city-live-stats">
                    <h4>Live Database Stats</h4>
                    {cityStats[selectedLGU.name] ? (
                      <div className="live-stats-grid">
                        <div className="live-stat">
                          <span className="live-stat-label">Registered Fisherfolk</span>
                          <span className="live-stat-value">{cityStats[selectedLGU.name].fisherfolk ?? 0}</span>
                        </div>
                        <div className="live-stat">
                          <span className="live-stat-label">Registered Boats</span>
                          <span className="live-stat-value">{cityStats[selectedLGU.name].boats ?? 0}</span>
                        </div>
                        <div className="live-stat">
                          <span className="live-stat-label">Organizations</span>
                          <span className="live-stat-value">{cityStats[selectedLGU.name].organizations ?? 0}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="no-stats">No records in database yet for this LGU.</p>
                    )}
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
