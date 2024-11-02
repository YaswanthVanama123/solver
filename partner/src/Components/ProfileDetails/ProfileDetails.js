import React from 'react';
import './ProfileDetails.css'; // Import a CSS file for styling

const ProfileDetails = () => {
    return (
        <div className="profile-container">

            <div className="profile-header">
            <header className="header">
            <h1>i</h1>
        <nav className="navbar">
          <div className="navbar-left">
            <h1>Click Solver</h1>
          </div>
          <div className="navbar-right">
             <div className="profile-icon" onClick={toggleDropdown}>
             {profile ?  <img src={profile} alt="Profile" />: <i className="fa-regular fa-user"></i>}
            </div> 
            
            {showDropdown && (
              <div className="dropdown-menu">
                <ul>
                  <li><a href="#">Profile</a></li>
                  <li><a href="#">Edit</a></li>
                  <li><a href="#" onClick={handleLogout}>Logout</a></li>
                </ul>
              </div>
            )}
          </div>
        </nav>
      </header>
                <div>
                    <i className="fa-regular fa-user userIcon"></i>
                </div>
                <div className="profile-info">
                    <h1>Samantha Johnson</h1>
                    <p>New York, NY</p>
                    <div className="rating">
                        <span>★★★★☆</span>
                        <span>4.8 (342 reviews)</span>
                    </div>
                    <div>
                        <h1>Plumber</h1>
                    </div>
                </div>
            </div>
            <div className="services">
                <div>
                    <p>Home Cleaning</p>
                </div>
                <div>
                    <p>Handyman Services</p>
                </div>
                <div>
                    <p>Lawn Care</p>
                </div>
            </div>
            <div className="reviews">
                <div>
                    <div className="review-header">
                        <img src="https://via.placeholder.com/30" alt="Reviewer Picture" />
                        <h3>John Doe</h3>
                        <div className="stars">
                            <span>★★★★☆</span>
                        </div>
                    </div>
                    <div className="review-content">
                        <p>Samantha did an excellent job cleaning my apartment. She was punctual, thorough, and very friendly. I highly recommend her services.</p>
                    </div>
                </div>
                <div>
                    <div className="review-header">
                        <img src="https://via.placeholder.com/30" alt="Reviewer Picture" />
                        <h3>Sarah Anderson</h3>
                        <div className="stars">
                            <span>★★★☆☆</span>
                        </div>
                    </div>
                    <div className="review-content">
                        <p>I had a mixed experience with Samantha. She did a good job with the cleaning, but was a bit late and seemed rushed. I would use her services again, but with some reservations.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetails;
