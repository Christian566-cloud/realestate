import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import {
  FiSearch, FiHome, FiMapPin, FiShield, FiTrendingUp, FiArrowRight, FiChevronRight
} from 'react-icons/fi';

const HERO_BG =
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=80';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    propertiesAPI.getAll({ status: 'available' })
      .then((r) => setProperties(r.data))
      .catch(() => {});
  }, []);

  const filtered = properties
    .filter(
      (p) =>
        !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.city?.toLowerCase().includes(search.toLowerCase()) ||
        p.state?.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 6);

  return (
    <div>
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.65)), url(${HERO_BG})`,
        }}
      >
        <div className="hero-content">
          <h1>Find Your Dream Property in Cameroon</h1>
          <p>
            Discover properties for rent and sale in Yaoundé, Douala, and beyond.
            Your perfect home is just a click away.
          </p>
          <div className="hero-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by city, property name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Link to="/properties" className="btn-primary">
              Explore <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-row">
          <div className="feature-item">
            <div className="feature-icon-wrap">
              <FiHome />
            </div>
            <h3>Wide Selection</h3>
            <p>Thousands of properties across Yaoundé, Douala, and major cities</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrap">
              <FiMapPin />
            </div>
            <h3>Geo Location</h3>
            <p>Find properties near you with interactive maps</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrap">
              <FiTrendingUp />
            </div>
            <h3>Virtual Tours</h3>
            <p>Immersive 3D tours powered by Matterport</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrap">
              <FiShield />
            </div>
            <h3>Secure Booking</h3>
            <p>Safe and transparent booking process</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Featured Properties</h2>
          <Link to="/properties" className="btn-secondary">
            View All <FiChevronRight />
          </Link>
        </div>
        <div className="property-grid">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <h2>Are You a Landlord?</h2>
          <p>
            List your property and reach thousands of potential buyers and renters looking
            for their perfect home in Cameroon.
          </p>
          <Link to="/register" className="btn-primary btn-large">
            List Your Property Now
          </Link>
        </div>
      </section>
    </div>
  );
}
