import { Link } from 'react-router-dom';
import { FiMapPin, FiHome, FiCamera, FiMaximize, FiStar, FiExternalLink } from 'react-icons/fi';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80';

export default function PropertyCard({ property }) {
  const p = property;
  const title = p.title?.length > 45 ? p.title.slice(0, 42) + '...' : p.title;

  return (
    <div className="property-card">
      <Link to={`/properties/${p.id}`} className="card-img-link">
        <div className="card-img-wrap">
          <img
            src={p.cover_image || FALLBACK_IMG}
            alt={p.title}
            loading="lazy"
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
          />
          <div className="card-badges">
            <span className={`badge-purpose-sm badge-${p.purpose}`}>
              {p.purpose === 'rent' ? 'Rent' : 'Sale'}
            </span>
            <span className={`badge-status-sm badge-${p.status}`}>{p.status}</span>
          </div>
          {p.is_furnished && <span className="badge-furnished"><FiStar /> Furnished</span>}
          <div className="card-type-tag">{p.property_type}</div>
        </div>
      </Link>
      <div className="card-body">
        <Link to={`/properties/${p.id}`} className="card-title-link">
          <h3 title={p.title}>{title}</h3>
        </Link>
        <p className="card-location"><FiMapPin /> {p.state}, {p.city}</p>
        <div className="card-features">
          <span><FiHome /> {p.bedroom} Beds</span>
          <span><FiCamera /> {p.bathroom} Baths</span>
          <span><FiMaximize /> {p.area_sqft} m&sup2;</span>
        </div>
        <div className="card-footer">
          <span className="card-price">
            {Number(p.price).toLocaleString()} FCFA
            {p.purpose === 'rent' && <small>/mo</small>}
          </span>
          <div className="card-footer-actions">
            {p.virtual_tour_url && (
              <Link to={`/virtual-tour/${p.id}`} className="btn-card-sm-outline" title="Virtual Tour">
                <FiExternalLink />
              </Link>
            )}
            <Link to={`/properties/${p.id}`} className="btn-card-sm">Details</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
