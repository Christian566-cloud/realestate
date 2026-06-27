import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import { getMatterportEmbedUrl } from '../services/matterport';
import { FiArrowLeft, FiPlay, FiMapPin } from 'react-icons/fi';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200';

export default function VirtualTour() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [tourActive, setTourActive] = useState(false);

  useEffect(() => {
    propertiesAPI.getById(id).then((r) => setProperty(r.data)).catch(() => navigate('/properties'));
  }, [id, navigate]);

  if (!property) return <div className="loading-spinner" />;

  const rawTourUrl = property.virtual_tour_url || 'https://my.matterport.com/models/r9jtCvS35Be?section=media';
  const embedUrl = getMatterportEmbedUrl(rawTourUrl);
  const cover = property.cover_image || FALLBACK_IMG;

  return (
    <div className="virtual-tour-page">
      <div className="tour-topbar">
        <button className="btn-topbar" onClick={() => navigate(-1)}><FiArrowLeft /> Back to Property</button>
        <h2>Virtual Tour</h2>
      </div>

      <div className="tour-hero">
        {!tourActive ? (
          <div className="tour-hero-poster" onClick={() => setTourActive(true)}>
            <div className="tour-hero-bg" style={{ backgroundImage: `url(${cover})` }} />
            <div className="tour-hero-overlay">
              <div className="tour-hero-content">
                <div className="tour-hero-play"><FiPlay /></div>
                <h3>{property.title}</h3>
                <p><FiMapPin /> {property.address}, {property.city}, {property.state}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="tour-hero-embed">
            <iframe
              src={embedUrl}
              title={`Virtual Tour - ${property.title}`}
              allowFullScreen
              loading="lazy"
            />
            <button className="tour-hero-close" onClick={() => setTourActive(false)}>
              Exit Tour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
