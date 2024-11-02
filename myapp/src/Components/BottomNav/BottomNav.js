import React from 'react';
import './BottomNav.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faConciergeBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <div className="navbar">
      <Link to="/" className="nav-item">
        <FontAwesomeIcon icon={faHome} />
        <span>Home</span>
      </Link>
      <Link to="/my/bookings" className="nav-item">
        <FontAwesomeIcon icon={faConciergeBell} />
        <span>My Services</span>
      </Link>
      <Link to="/account" className="nav-item">
        <FontAwesomeIcon icon={faUser} />
        <span>Account</span>
      </Link>
    </div>
  );
};

export default NavBar;
