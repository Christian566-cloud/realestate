import { useState, useEffect } from 'react';
import { bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FiCalendar, FiMapPin, FiDollarSign, FiClock, FiCheck, FiAlertCircle, FiX
} from 'react-icons/fi';

export default function Dashboard() {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsAPI.getAll()
      .then(r => setMyBookings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleBookingAction = async (id, status) => {
    try {
      await bookingsAPI.update(id, { status });
      const res = await bookingsAPI.getAll();
      setMyBookings(res.data);
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  const pendingCount = myBookings.filter(b => b.status === 'pending').length;
  const confirmedCount = myBookings.filter(b => b.status === 'confirmed').length;

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <p>Welcome back, <strong>{user?.username}</strong> 👋</p>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <FiCalendar />
          <div>
            <span>{myBookings.length}</span>
            <div className="stat-card-label">Total Bookings</div>
          </div>
        </div>
        <div className="stat-card">
          <FiAlertCircle />
          <div>
            <span>{pendingCount}</span>
            <div className="stat-card-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <FiCheck />
          <div>
            <span>{confirmedCount}</span>
            <div className="stat-card-label">Confirmed</div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="dashboard-content">
        <h2><FiCalendar /> My Booking Requests</h2>
        {myBookings.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 40px', textAlign: 'center' }}>
            <FiCalendar style={{ fontSize: '48px', color: 'var(--primary)', marginBottom: '16px' }} />
            <h3>No bookings yet</h3>
            <p>Browse properties to make your first booking request.</p>
          </div>
        ) : (
          <div className="booking-list">
            {myBookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-card-header">
                  <div className="booking-card-title">
                    <strong>{booking.property?.title || 'Property'}</strong>
                    <div className="booking-card-meta">
                      {booking.property?.city && (
                        <span><FiMapPin /> {booking.property.city}, {booking.property.state}</span>
                      )}
                      {booking.property?.price && (
                        <span><FiDollarSign /> {parseInt(booking.property.price).toLocaleString()} FCFA</span>
                      )}
                      {booking.preferred_date && (
                        <span><FiClock /> {new Date(booking.preferred_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className={`booking-status-badge booking-status-badge.${booking.status}`}>
                    {booking.status === 'pending' && <FiAlertCircle />}
                    {booking.status === 'confirmed' && <FiCheck />}
                    {booking.status === 'cancelled' && <FiX />}
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                </div>

                {booking.message && (
                  <div className="booking-info">
                    <strong>Your Message</strong>
                    <p>{booking.message}</p>
                  </div>
                )}

                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                  <div className="booking-card-footer">
                    <span style={{ fontSize: '12px', color: 'var(--gray)' }}>
                      Requested: {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                    <button 
                      className="btn-danger" 
                      onClick={() => handleBookingAction(booking.id, 'cancelled')}
                    >
                      <FiX /> Cancel Request
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
