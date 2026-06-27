import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', username: '', password: '', password2: '', phone: '', role: 'customer'
  });
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const data = await register({
        email: form.email, 
        username: form.username, 
        password: form.password,
        phone: form.phone, 
        role: form.role,
      });
      // User is now logged in, redirect to appropriate dashboard
      if (data && data.user) {
        setTimeout(() => {
          navigate(form.role === 'landlord' ? '/landlord/dashboard' : '/');
        }, 100);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data) setError(Object.values(data).flat().join('. '));
      else setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join our real estate platform</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FiUser className="input-icon" />
            <input name="username" type="text" placeholder="Username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <FiMail className="input-icon" />
            <input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <FiLock className="input-icon" />
            <input name="password" type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={handleChange} required minLength={6} />
            <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>{showPw ? <FiEyeOff /> : <FiEye />}</button>
          </div>
          <div className="input-group">
            <FiLock className="input-icon" />
            <input name="password2" type="password" placeholder="Confirm password" value={form.password2} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <FiPhone className="input-icon" />
            <input name="phone" type="text" placeholder="Phone number (optional)" value={form.phone} onChange={handleChange} />
          </div>
          <div className="input-group">
            <FiShield className="input-icon" />
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="customer">Customer — Looking to rent or buy</option>
              <option value="landlord">Landlord — I own properties to list</option>
            </select>
          </div>
          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
