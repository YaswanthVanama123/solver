import React, { useEffect, useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import './WorkerProfile.css';

const WorkerProfile = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);
  const [workerName, setWorkerName] = useState(null);
  const [service, setService] = useState(null);
  const [subService, setSubService] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('pcs');
        const response = await axios.post(
          'http://localhost:5000/api/profile', {},
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const { profileDetails, averageRating } = response.data;
        const { created_at, worker_name, profile, service, subservices } = profileDetails[0];
        setCreatedAt(created_at);
        setWorkerName(worker_name);
        setProfileImage(profile);
        setService(service);
        setSubService(subservices);
        setAverageRating(parseFloat(averageRating).toFixed(1));
        const feedbackData = profileDetails.map(item => ({
          text: item.comment,
          rating: item.rating,
          customer: item.feedback_name
        }));
        setFeedback(feedbackData);

      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchData();
  }, []);

  const getDaysFromCreatedAt = (createdAt) => {
    const createdAtDate = moment(createdAt);
    const today = moment();
    const days = today.diff(createdAtDate, 'days');
    return days;
  };

  const formatCreatedAt = (createdAt) => {
    const date = new Date(createdAt);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    Cookies.remove('pcs');
    navigate('/login');
  };

  const handleHome = () => {
    navigate('/');
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5 ? '★' : '';
    const emptyStars = '☆'.repeat(5 - fullStars - (halfStar ? 1 : 0));
    return '★'.repeat(fullStars) + halfStar + emptyStars;
  };

  return (
    <div className="profile-container">
      <header className="header">
        <nav className="navbar">
          <div className="navbar-left">
            <h1>Click Solver</h1>
          </div>
          <div className="navbar-right">
            <div className="profile-icon" onClick={toggleDropdown}>
              {<i className="fa-regular fa-user"></i>}
            </div>
            {showDropdown && (
              <div className="dropdown-menu">
                <ul>
                  <li><a href='#' onClick={handleHome}>Home</a></li>
                  <li><a href="#">Edit</a></li>
                  <li><a href="#" onClick={handleLogout}>Logout</a></li>
                </ul>
              </div>
            )}
          </div>
        </nav>
      </header>
      <div className='profile-body-container'>
        <div className="profile-header">
          <div className="profile-picture">
            <img src={profileImage} alt={workerName} className="profile-picture" />
          </div>
          <div className="profile-details">
            <h1>{workerName}</h1>
            <p className="profession">{service}</p>
          </div>
        </div>
        <div className="about">
          <h2>About</h2>
          <p className='profileAbout'>
            We extend our heartfelt appreciation to {workerName}, a skilled and dedicated {service} with expertise in
            {subService.map((each, index) => <span key={index}>{each}, </span>)} with over {getDaysFromCreatedAt(createdAt)} days
            of industry experience, your attention to detail, efficiency, and friendly customer service have
            earned you a reputation for delivering high-quality services to our clients.
          </p>
        </div>
        <div className="completed-jobs">
          <h2>My Jobs</h2>
          <ul>
            {subService && subService.map((job, index) => (
              <li key={index}>
                <span className="job-icon">🔧</span>
                <span className="job-detail">
                  <p>{job}</p>
                  <p>{formatCreatedAt(createdAt)}</p>
                </span>
                <span className="job-rating">★★★★★</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="ratings-reviews">
          <h2>Ratings & Reviews</h2>
          <span>{averageRating} </span>
          {renderStars(averageRating)}
          {feedback.length > 0 ? (
            feedback.map((review, index) => (
              <div className="review" key={index}>
                <p><strong>{review.customer}</strong> {renderStars(review.rating)}</p>
                <p>{review.text}</p>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
