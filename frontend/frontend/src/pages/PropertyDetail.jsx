import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertiesAPI, bookingsAPI, chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getMatterportEmbedUrl } from '../services/matterport';
import {
  FiMapPin, FiHome, FiCamera, FiMaximize, FiCalendar,
  FiMessageSquare, FiStar, FiChevronLeft,
  FiChevronRight, FiX, FiExternalLink, FiShare2, FiClock, FiKey,
  FiCheckCircle, FiUser, FiPhone, FiMail, FiPlay
} from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingMsg, setBookingMsg] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [selectedImg, setSelectedImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [bookError, setBookError] = useState('');
  const [copied, setCopied] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const tourRef = useRef(null);

  useEffect(() => {
    propertiesAPI.getById(id)
      .then((res) => setProperty(res.data))
      .catch(() => navigate('/properties'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleBook = async () => {
    setBookError('');
    setBookSuccess(false);
    try {
      await bookingsAPI.create({ property_id: property.id, message: bookingMsg, preferred_date: bookingDate });
      setBookSuccess(true);
      setBookingMsg('');
      setBookingDate('');
    } catch {
      setBookError('Booking failed. You may have already booked this property.');
    }
  };

  const handleChat = async () => {
    try {
      const res = await chatAPI.createConversation({ participant_ids: [property.landlord.id], property_id: property.id });
      navigate(`/messages/${res.data.id}`);
    } catch { navigate('/messages'); }
  };

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const allImages = useCallback(() => {
    const imgs = [];
    if (property.cover_image) imgs.push(property.cover_image);
    property.images?.forEach(img => {
      const src = img.image || img.image_url;
      if (src && src !== property.cover_image) imgs.push(src);
    });
    return imgs.length > 0 ? imgs : [FALLBACK_IMG];
  }, [property]);

  if (loading) return <div className="loading-spinner" />;
  if (!property) return null;

  const images = allImages();
  const embedTourUrl = property.virtual_tour_url ? getMatterportEmbedUrl(property.virtual_tour_url) : null;
  const isRent = property.purpose === 'rent';
  const priceLabel = isRent ? '/month' : '';

  return (
    <div className="property-detail-page">
      {/* Breadcrumb */}
      <div className="detail-breadcrumb">
        <button onClick={() => navigate('/properties')}><FiChevronLeft /> Back to Properties</button>
        <span> / </span>
        <span>{property.title}</span>
      </div>

      {/* Gallery */}
      <div className="detail-gallery">
        <div className="detail-main-img-wrap" onClick={() => setLightboxOpen(true)}>
          <img src={images[selectedImg]} alt={property.title} className="detail-main-img" />
          <div className="detail-img-overlay">
            <FiMaximize />
          </div>
        </div>
        {images.length > 1 && (
          <div className="detail-gallery-grid">
            {images.slice(0, 5).map((img, i) => (
              <button
                key={i}
                className={`gallery-thumb ${selectedImg === i ? 'active' : ''}`}
                onClick={() => setSelectedImg(i)}
              >
                <img src={img} alt="" />
              </button>
            ))}
            {images.length > 5 && (
              <button className="gallery-thumb gallery-more" onClick={() => setLightboxOpen(true)}>
                <span>+{images.length - 5}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)}><FiX /></button>
          <button className="lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); setSelectedImg((selectedImg - 1 + images.length) % images.length); }}><FiChevronLeft /></button>
          <img src={images[selectedImg]} alt="" className="lightbox-img" onClick={(e) => e.stopPropagation()} />
          <button className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); setSelectedImg((selectedImg + 1) % images.length); }}><FiChevronRight /></button>
          <div className="lightbox-counter">{selectedImg + 1} / {images.length}</div>
        </div>
      )}

      <div className="detail-content">
        <div className="detail-main">
          {/* Header */}
          <div className="detail-header">
            <div>
              <div className="detail-badges">
                <span className={`badge-purpose badge-${property.purpose}`}>
                  {isRent ? 'For Rent' : 'For Sale'}
                </span>
                <span className={`badge badge-${property.status}`}>{property.status}</span>
                <span className="badge-type-detail">{property.property_type}</span>
              </div>
              <h1>{property.title}</h1>
              <p className="detail-location"><FiMapPin /> {property.address}, {property.city}, {property.state}, {property.country}</p>
            </div>
            <div className="detail-price-box">
              <span className="detail-price">
                {parseInt(property.price).toLocaleString()} FCFA
                <small>{priceLabel}</small>
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="detail-features">
            <div className="detail-feat"><FiHome /> <strong>{property.bedroom}</strong> Beds</div>
            <div className="detail-feat"><FiCamera /> <strong>{property.bathroom}</strong> Baths</div>
            <div className="detail-feat"><FiMaximize /> <strong>{property.area_sqft}</strong> m&sup2;</div>
            <div className="detail-feat"><FiStar /> {property.is_furnished ? 'Furnished' : 'Unfurnished'}</div>
            <div className="detail-feat"><FiKey /> {isRent ? 'Rental' : 'Purchase'}</div>
          </div>

          {/* Description */}
          <div className="detail-section">
            <h3>Description</h3>
            <p>{property.description}</p>
          </div>

          {/* Amenities */}
          <div className="detail-section">
            <h3>Amenities & Features</h3>
            <div className="amenities-grid">
              <span className="amenity-item"><FiCheckCircle /> WiFi Ready</span>
              <span className="amenity-item"><FiCheckCircle /> Parking Space</span>
              <span className="amenity-item"><FiCheckCircle /> Air Conditioning</span>
              <span className="amenity-item"><FiCheckCircle /> Modern Kitchen</span>
              <span className="amenity-item"><FiCheckCircle /> Security System</span>
              <span className="amenity-item"><FiCheckCircle /> Water Supply</span>
              <span className="amenity-item"><FiCheckCircle /> Electricity</span>
              <span className="amenity-item"><FiCheckCircle /> Balcony</span>
            </div>
          </div>

          {/* Virtual Tour */}
          {embedTourUrl && (
            <div className="detail-section tour-section" ref={tourRef}>
              <h3><FiHome /> Virtual Tour</h3>
              <div className={`tour-viewer ${tourActive ? 'tour-active' : ''}`}>
                {!tourActive ? (
                  <div className="tour-poster" onClick={() => setTourActive(true)}>
                    <div className="tour-poster-bg" style={{ backgroundImage: `url(${images[0]})` }} />
                    <div className="tour-poster-overlay">
                      <div className="tour-poster-content">
                        <div className="tour-play-btn"><FiPlay /></div>
                        <h4>360&deg; Virtual Tour</h4>
                        <p>Click to explore this property in immersive 3D</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="tour-iframe-wrap">
                    <iframe
                      src={embedTourUrl}
                      title="Virtual Tour"
                      allowFullScreen
                      loading="lazy"
                    />
                    <button className="tour-close-btn" onClick={() => setTourActive(false)}>
                      <FiX /> Close Tour
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Map */}
          {property.latitude && property.longitude && (
            <div className="detail-section">
              <h3>Location</h3>
              <div className="detail-map-container">
                <MapContainer center={[parseFloat(property.latitude), parseFloat(property.longitude)]} zoom={16} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[parseFloat(property.latitude), parseFloat(property.longitude)]}>
                    <Popup>{property.title}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}

          {/* Landlord */}
          <div className="detail-section">
            <h3>Listed by</h3>
            <div className="landlord-card">
              <div className="landlord-avatar">{property.landlord?.username?.[0]?.toUpperCase()}</div>
              <div className="landlord-info">
                <strong>{property.landlord?.username}</strong>
                <span><FiMail /> {property.landlord?.email}</span>
                {property.landlord?.phone && <span><FiPhone /> {property.landlord.phone}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="detail-sidebar">
          <div className="sidebar-sticky">
            {/* Price Card */}
            <div className="sidebar-card sidebar-price-card">
              <span className="sidebar-price-label">{isRent ? 'Monthly Rent' : 'Price'}</span>
              <span className="sidebar-price">{parseInt(property.price).toLocaleString()} FCFA</span>
              {isRent && <span className="sidebar-price-sub">per month</span>}
            </div>

            {/* Booking */}
            {user && user.role === 'customer' && property.status === 'available' && !bookSuccess && (
              <div className="sidebar-card">
                <h3><FiCalendar /> Request Visit</h3>
                {bookError && <div className="alert alert-error">{bookError}</div>}
                <textarea placeholder="Your message to the landlord..." value={bookingMsg} onChange={(e) => setBookingMsg(e.target.value)} rows={3} />
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                <button className="btn-primary btn-block" onClick={handleBook}>
                  <FiCalendar /> Send Request
                </button>
              </div>
            )}
            {bookSuccess && (
              <div className="sidebar-card sidebar-success">
                <FiCheckCircle />
                <h3>Request Sent!</h3>
                <p>The landlord will contact you soon.</p>
              </div>
            )}

            {/* Contact */}
            <div className="sidebar-card">
              <h3><FiUser /> Contact</h3>
              {user ? (
                <button className="btn-secondary btn-block" onClick={handleChat}>
                  <FiMessageSquare /> Message Landlord
                </button>
              ) : (
                <>
                  <p className="sidebar-muted">Sign in to contact the landlord.</p>
                  <button className="btn-primary btn-block" onClick={() => navigate('/login')}>
                    Sign In
                  </button>
                </>
              )}
            </div>

            {/* Share */}
            <div className="sidebar-card">
              <h3><FiShare2 /> Share</h3>
              <button className="btn-share" onClick={handleCopyLink}>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            {/* Property Meta */}
            <div className="sidebar-card sidebar-meta">
              <div className="meta-row"><FiClock /> Listed {new Date(property.created_at).toLocaleDateString()}</div>
              <div className="meta-row"><FiKey /> ID: #{property.id}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
