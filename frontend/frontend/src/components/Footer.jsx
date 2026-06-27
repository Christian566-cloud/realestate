import { Link } from 'react-router-dom';
import { FiHome, FiPhone, FiMail, FiMapPin, FiGithub, FiTwitter } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col brand-col">
          <h3><FiHome /> RealEstate</h3>
          <p>Your trusted platform for finding the perfect property in Cameroon. Browse, book, and connect with landlords effortlessly.</p>
          <div className="footer-social">
            <a href="#"><FiTwitter /></a>
            <a href="#"><FiGithub /></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/properties">Properties</Link>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </div>
        <div className="footer-col">
          <h4>Property Types</h4>
          <Link to="/properties?property_type=apartment">Apartments</Link>
          <Link to="/properties?property_type=house">Houses</Link>
          <Link to="/properties?property_type=villa">Villas</Link>
          <Link to="/properties?property_type=office">Offices</Link>
          <Link to="/properties?property_type=commercial">Commercial</Link>
        </div>
        <div className="footer-col">
          <h4>Contact Info</h4>
          <p><FiPhone /> +1 (555) 123-4567</p>
          <p><FiMail /> info@realestate.com</p>
          <p><FiMapPin /> 123 Main St, New York, NY</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} RealEstate. All rights reserved.</p>
      </div>
    </footer>
  );
}
