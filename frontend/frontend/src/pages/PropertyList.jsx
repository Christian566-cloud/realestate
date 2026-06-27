import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { FiSearch, FiSliders, FiX } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const PROPERTY_TYPES = ['', 'apartment', 'house', 'villa', 'studio', 'office', 'land', 'commercial'];
const STATUSES = ['', 'available', 'rented', 'sold'];
const CAMEROON_CENTER = [4.0511, 9.7679];
const CITIES = ['', 'Yaoundé', 'Douala'];

export default function PropertyList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    property_type: searchParams.get('property_type') || '',
    purpose: searchParams.get('purpose') || '',
    status: searchParams.get('status') || '',
    price_min: '',
    price_max: '',
    bedroom: '',
    city: searchParams.get('city') || '',
  });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    if (filters.price_min) params.price__gte = filters.price_min;
    if (filters.price_max) params.price__lte = filters.price_max;
    if (filters.bedroom) params.bedroom__gte = filters.bedroom;
    if (filters.search) params.search = filters.search;
    try {
      const res = await propertiesAPI.getAll(params);
      setProperties(res.data);
    } catch { setProperties([]); }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    const sp = new URLSearchParams(searchParams);
    if (value) sp.set(key, value); else sp.delete(key);
    setSearchParams(sp);
  };

  const clearFilters = () => {
    setFilters({ search: '', property_type: '', purpose: '', status: '', price_min: '', price_max: '', bedroom: '', city: '' });
    setSearchParams({});
  };

  return (
    <div className="property-list-page">
      <div className="list-header">
        <h1>Properties</h1>
        <div className="list-search-bar">
          <FiSearch />
          <input type="text" placeholder="Search properties..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
          <button className={`btn-filter ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
            <FiSliders /> Filters
          </button>
        </div>
      </div>

      <div className={`list-content ${showFilters ? 'with-filters' : ''}`}>
        {showFilters && (
          <aside className="filters-panel">
            <div className="filter-header">
              <h3>Filters</h3>
              <button onClick={clearFilters}><FiX /> Clear</button>
            </div>
            <div className="filter-group">
              <label>Property Type</label>
              <select value={filters.property_type} onChange={(e) => handleFilterChange('property_type', e.target.value)}>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t || 'All Types'}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Purpose</label>
              <select value={filters.purpose} onChange={(e) => handleFilterChange('purpose', e.target.value)}>
                <option value="">All</option>
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s || 'All Status'}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Min Price (FCFA)</label>
              <input type="number" value={filters.price_min} onChange={(e) => handleFilterChange('price_min', e.target.value)} />
            </div>
            <div className="filter-group">
              <label>Max Price (FCFA)</label>
              <input type="number" value={filters.price_max} onChange={(e) => handleFilterChange('price_max', e.target.value)} />
            </div>
            <div className="filter-group">
              <label>Min Bedrooms</label>
              <input type="number" value={filters.bedroom} onChange={(e) => handleFilterChange('bedroom', e.target.value)} />
            </div>
            <div className="filter-group">
              <label>City</label>
              <select value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)}>
                {CITIES.map((c) => <option key={c} value={c}>{c || 'All Cities'}</option>)}
              </select>
            </div>
          </aside>
        )}

        <div className="list-main">
          {loading ? (
            <div className="loading-spinner" />
          ) : properties.length === 0 ? (
            <div className="empty-state">
              <h3>No properties found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="property-grid">
              {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </div>

      <div className="map-section">
        <h2>Map View</h2>
        <div className="map-container" style={{ height: 400 }}>
          <MapContainer center={CAMEROON_CENTER} zoom={12} scrollWheelZoom={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {properties.filter(p => p.latitude && p.longitude).map((p) => (
              <Marker key={p.id} position={[parseFloat(p.latitude), parseFloat(p.longitude)]}>
                <Popup><strong>{p.title}</strong><br />{parseInt(p.price).toLocaleString()} FCFA<br />{p.state}, {p.city}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
