import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertiesAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiPlus, FiEdit2, FiTrash2, FiHome, FiCalendar, FiMessageSquare,
  FiDollarSign, FiMapPin, FiGrid, FiCheckCircle, FiXCircle,
  FiClock, FiEye, FiToggleLeft, FiUser, FiMail, FiPhone, FiChevronDown
} from 'react-icons/fi';

const EMPTY_FORM = {
  title: '', description: '', price: '', address: '', city: '', state: '', zip_code: '',
  property_type: 'apartment', purpose: 'rent', bedroom: 1, bathroom: 1, area_sqft: '',
  is_furnished: false, virtual_tour_url: '', latitude: '', longitude: '',
  country: 'Cameroon', status: 'available',
};

export default function LandlordDashboard() {
  const { user } = useAuth();
  const [myProperties, setMyProperties] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('properties');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = () => {
    propertiesAPI.getMine().then(r => setMyProperties(r.data)).catch(() => {});
    bookingsAPI.getAll().then(r => setMyBookings(r.data)).catch(() => {});
  };

  useEffect(() => { loadData(); }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM); setImageFiles([]); setEditing(null); setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanedForm = { ...form };
      if (!cleanedForm.latitude) delete cleanedForm.latitude;
      if (!cleanedForm.longitude) delete cleanedForm.longitude;
      if (!cleanedForm.virtual_tour_url) delete cleanedForm.virtual_tour_url;
      if (!cleanedForm.bedroom) cleanedForm.bedroom = 1;
      if (!cleanedForm.bathroom) cleanedForm.bathroom = 1;

      let propertyRes;
      if (editing) propertyRes = await propertiesAPI.update(editing.id, cleanedForm);
      else propertyRes = await propertiesAPI.create(cleanedForm);

      const propertyId = editing ? editing.id : propertyRes.data.id;
      if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          await propertiesAPI.uploadImage(propertyId, imageFiles[i], i === 0 && !editing);
        }
      }
      resetForm();
      loadData();
    } catch { alert('Failed to save property'); }
  };

  const handleEdit = (prop) => {
    setForm({
      title: prop.title, description: prop.description, price: prop.price, address: prop.address,
      city: prop.city, state: prop.state, zip_code: prop.zip_code, property_type: prop.property_type,
      purpose: prop.purpose || 'rent',
      bedroom: prop.bedroom, bathroom: prop.bathroom, area_sqft: prop.area_sqft,
      is_furnished: prop.is_furnished, virtual_tour_url: prop.virtual_tour_url || '',
      latitude: prop.latitude || '', longitude: prop.longitude || '', country: prop.country, status: prop.status,
    });
    setImageFiles([]); setEditing(prop); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this property?')) {
      await propertiesAPI.delete(id);
      setMyProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleQuickStatus = async (prop, newStatus) => {
    const label = newStatus === 'rented' ? 'Rented' : 'Sold';
    if (window.confirm(`Mark "${prop.title}" as ${label}?`)) {
      try { await propertiesAPI.update(prop.id, { status: newStatus }); loadData(); }
      catch { alert('Failed to update status'); }
    }
  };

  const handleBookingAction = async (id, status) => {
    await bookingsAPI.update(id, { status });
    loadData();
  };

  const totalRevenue = myProperties.filter(p => p.status === 'rented' || p.status === 'sold').length;
  const availableCount = myProperties.filter(p => p.status === 'available').length;
  const pendingBookings = myBookings.filter(b => b.status === 'pending').length;

  const statusColor = (s) => {
    const map = { available: '#00b894', rented: '#fdcb6e', sold: '#ff7675', pending: '#ffeaa7', confirmed: '#55efc4', cancelled: '#ff7675', completed: '#6c5ce7' };
    return map[s] || '#64748b';
  };

  return (
    <div className="ld-page">
      <div className="ld-layout">
        {/* Sidebar */}
        <aside className="ld-sidebar">
          <div className="ld-profile">
            <div className="ld-avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <h3>{user?.username}</h3>
            <span className="ld-role">Landlord</span>
            <div className="ld-contact">
              <span><FiMail /> {user?.email}</span>
              {user?.phone && <span><FiPhone /> {user.phone}</span>}
            </div>
          </div>
          <nav className="ld-nav">
            <button className={`ld-nav-item ${activeTab === 'properties' ? 'active' : ''}`} onClick={() => setActiveTab('properties')}>
              <FiGrid /> <span>My Properties</span> <span className="ld-nav-count">{myProperties.length}</span>
            </button>
            <button className={`ld-nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
              <FiCalendar /> <span>Bookings</span> {pendingBookings > 0 && <span className="ld-badge">{pendingBookings}</span>}
            </button>
          </nav>
          <div className="ld-sidebar-footer">
            <FiHome /> RealEstate Cameroon
          </div>
        </aside>

        {/* Main */}
        <div className="ld-main">
          <div className="ld-topbar">
            <div>
              <h1>Dashboard</h1>
              <p>Welcome back, {user?.username}</p>
            </div>
            <button className="btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
              <FiPlus /> {showForm ? 'Cancel' : 'New Property'}
            </button>
          </div>

          {/* Stats */}
          <div className="ld-stats">
            <div className="ld-stat" style={{ '--stat-color': '#6c5ce7' }}>
              <div className="ld-stat-icon"><FiHome /></div>
              <div className="ld-stat-body">
                <span className="ld-stat-num">{myProperties.length}</span>
                <span className="ld-stat-label">Total Properties</span>
              </div>
            </div>
            <div className="ld-stat" style={{ '--stat-color': '#00b894' }}>
              <div className="ld-stat-icon"><FiCheckCircle /></div>
              <div className="ld-stat-body">
                <span className="ld-stat-num">{availableCount}</span>
                <span className="ld-stat-label">Available</span>
              </div>
            </div>
            <div className="ld-stat" style={{ '--stat-color': '#e17055' }}>
              <div className="ld-stat-icon"><FiDollarSign /></div>
              <div className="ld-stat-body">
                <span className="ld-stat-num">{totalRevenue}</span>
                <span className="ld-stat-label">{totalRevenue === 1 ? 'Deal Closed' : 'Deals Closed'}</span>
              </div>
            </div>
            <div className="ld-stat" style={{ '--stat-color': '#fdcb6e' }}>
              <div className="ld-stat-icon"><FiClock /></div>
              <div className="ld-stat-body">
                <span className="ld-stat-num">{pendingBookings}</span>
                <span className="ld-stat-label">Pending Requests</span>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'properties' && (
            <div>
              {/* Form Panel */}
              {showForm && (
                <div className="ld-form-panel">
                  <div className="ld-form-header">
                    <h2>{editing ? 'Edit Property' : 'Add New Property'}</h2>
                    <button className="ld-form-close" onClick={() => setShowForm(false)}><FiXCircle /></button>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="ld-form-grid">
                      <div className="ld-form-section">
                        <h3>Basic Info</h3>
                        <div className="form-group"><label>Title</label><input name="title" value={form.title} onChange={handleChange} required /></div>
                        <div className="form-group"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} required /></div>
                        <div className="form-row">
                          <div className="form-group"><label>Price (FCFA)</label><input name="price" type="number" value={form.price} onChange={handleChange} required /></div>
                          <div className="form-group"><label>Area (m&sup2;)</label><input name="area_sqft" type="number" value={form.area_sqft} onChange={handleChange} required /></div>
                        </div>
                        <div className="form-row">
                          <div className="form-group"><label>Property Type</label>
                            <select name="property_type" value={form.property_type} onChange={handleChange}>
                              <option value="apartment">Apartment</option><option value="house">House</option>
                              <option value="villa">Villa</option><option value="studio">Studio</option>
                              <option value="office">Office</option><option value="land">Land</option>
                              <option value="commercial">Commercial</option>
                            </select>
                          </div>
                          <div className="form-group"><label>Purpose</label>
                            <select name="purpose" value={form.purpose} onChange={handleChange}>
                              <option value="rent">For Rent</option><option value="sale">For Sale</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group"><label>Bedrooms</label><input name="bedroom" type="number" value={form.bedroom} onChange={handleChange} /></div>
                          <div className="form-group"><label>Bathrooms</label><input name="bathroom" type="number" value={form.bathroom} onChange={handleChange} /></div>
                        </div>
                        <div className="checkbox-group">
                          <label><input name="is_furnished" type="checkbox" checked={form.is_furnished} onChange={handleChange} /> Furnished</label>
                        </div>
                      </div>
                      <div className="ld-form-section">
                        <h3>Location</h3>
                        <div className="form-group"><label>Address</label><input name="address" value={form.address} onChange={handleChange} required /></div>
                        <div className="form-row">
                          <div className="form-group"><label>City</label>
                            <select name="city" value={form.city} onChange={handleChange} required>
                              <option value="">Select city</option>
                              <option value="Yaoundé">Yaoundé</option><option value="Douala">Douala</option>
                            </select>
                          </div>
                          <div className="form-group"><label>Quarter</label><input name="state" value={form.state} onChange={handleChange} placeholder="e.g. Bastos" required /></div>
                        </div>
                        <div className="form-row">
                          <div className="form-group"><label>Postal Code</label><input name="zip_code" value={form.zip_code} onChange={handleChange} /></div>
                          <div className="form-group"><label>Country</label><input name="country" value={form.country} onChange={handleChange} /></div>
                        </div>
                        <div className="form-row">
                          <div className="form-group"><label>Latitude</label><input name="latitude" value={form.latitude} onChange={handleChange} placeholder="3.8667" /></div>
                          <div className="form-group"><label>Longitude</label><input name="longitude" value={form.longitude} onChange={handleChange} placeholder="11.5167" /></div>
                        </div>
                        <div className="form-group"><label>Status</label>
                          <select name="status" value={form.status} onChange={handleChange}>
                            <option value="available">Available</option><option value="rented">Rented</option><option value="sold">Sold</option>
                          </select>
                        </div>
                      </div>
                      <div className="ld-form-section">
                        <h3>Media</h3>
                        <div className="form-group"><label>Virtual Tour URL</label><input name="virtual_tour_url" value={form.virtual_tour_url} onChange={handleChange} placeholder="https://my.matterport.com/..." /></div>
                        <div className="form-group">
                          <label>Property Images</label>
                          <div className="ld-file-input">
                            <input type="file" multiple accept="image/*" id="file-input" onChange={(e) => setImageFiles(Array.from(e.target.files))} />
                            <label htmlFor="file-input">
                              <FiPlus /> {imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'Upload Images'}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ld-form-actions">
                      <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                      <button type="submit" className="btn-primary">{editing ? 'Update Property' : 'Create Property'}</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Properties Table */}
              <div className="ld-table-wrap">
                <div className="ld-table-header">
                  <h2>My Properties</h2>
                  <span className="ld-table-count">{myProperties.length} total</span>
                </div>
                {myProperties.length === 0 ? (
                  <div className="empty-state"><p>No properties yet. Click "New Property" to get started.</p></div>
                ) : (
                  <div className="ld-table">
                    <div className="ld-table-head">
                      <span className="th-prop">Property</span>
                      <span className="th-status">Status</span>
                      <span className="th-price">Price</span>
                      <span className="th-type">Type</span>
                      <span className="th-views">Views</span>
                      <span className="th-actions">Actions</span>
                    </div>
                    {myProperties.map(prop => (
                      <div key={prop.id} className="ld-table-row">
                        <div className="td-prop">
                          <img src={prop.cover_image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200'} alt="" />
                          <div>
                            <strong>{prop.title}</strong>
                            <span><FiMapPin /> {prop.city}, {prop.state}</span>
                          </div>
                        </div>
                        <div className="td-status">
                          <span className="ld-dot" style={{ background: statusColor(prop.status) }} />
                          <span className="ld-status-label">{prop.status}</span>
                        </div>
                        <div className="td-price">
                          {parseInt(prop.price).toLocaleString()} FCFA
                          {prop.purpose === 'rent' && <small>/mo</small>}
                        </div>
                        <div className="td-type">{prop.property_type}</div>
                        <div className="td-views">—</div>
                        <div className="td-actions">
                          {prop.status === 'available' && (
                            <button className="td-btn td-btn-claim" onClick={() => handleQuickStatus(prop, prop.purpose === 'rent' ? 'rented' : 'sold')} title="Mark as claimed">
                              <FiCheckCircle /> {prop.purpose === 'rent' ? 'Rented' : 'Sold'}
                            </button>
                          )}
                          <button className="td-btn td-btn-edit" onClick={() => handleEdit(prop)} title="Edit"><FiEdit2 /></button>
                          <Link to={`/properties/${prop.id}`} className="td-btn td-btn-view" title="View"><FiEye /></Link>
                          <button className="td-btn td-btn-del" onClick={() => handleDelete(prop.id)} title="Delete"><FiTrash2 /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="ld-table-wrap">
              <div className="ld-table-header">
                <h2>Incoming Bookings</h2>
                <span className="ld-table-count">{myBookings.length} total</span>
              </div>
              {myBookings.length === 0 ? (
                <div className="empty-state"><p>No booking requests yet.</p></div>
              ) : (
                <div className="ld-booking-list">
                  {myBookings.map(booking => (
                    <div key={booking.id} className="ld-booking-card">
                      <div className="ld-booking-side">
                        <div className="ld-booking-icon">
                          <FiUser />
                        </div>
                      </div>
                      <div className="ld-booking-body">
                        <div className="ld-booking-top">
                          <div>
                            <strong>{booking.property?.title || 'Property'}</strong>
                            <span className="ld-booking-customer">{booking.customer?.username} &mdash; {booking.customer?.email}</span>
                          </div>
                          <span className={`ld-booking-status ${booking.status}`} style={{ borderColor: statusColor(booking.status), color: statusColor(booking.status) }}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="ld-booking-details">
                          <span><FiCalendar /> {booking.preferred_date || 'Date not set'}</span>
                          {booking.message && <span><FiMessageSquare /> "{booking.message}"</span>}
                        </div>
                      </div>
                      {booking.status === 'pending' && (
                        <div className="ld-booking-actions">
                          <button className="ld-btn-confirm" onClick={() => handleBookingAction(booking.id, 'confirmed')}>
                            <FiCheckCircle /> Confirm
                          </button>
                          <button className="ld-btn-reject" onClick={() => handleBookingAction(booking.id, 'cancelled')}>
                            <FiXCircle /> Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
