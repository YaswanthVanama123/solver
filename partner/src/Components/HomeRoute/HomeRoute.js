import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Cookie from 'js-cookie';
import axios from 'axios';
import './HomeRoute.css';

const Dashboard = () => {
  const [servicecounts, setServicecounts] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [workerAverageRating, setWorkerAverageRating] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const jwtToken = Cookie.get('pcs');
      try {
        const response = await axios.get('http://localhost:5000/api/worker/life/details', {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        console.log(response);
        if (response.data === "") {
          navigate(`/skill/registration`);
        }
        const {profileDetails,averageRating} = response.data
        const {service_counts, money_earned, profile} = profileDetails[0];
        setServicecounts(service_counts);
        setTotalEarnings(money_earned);
        setProfile(profile);
        setData(profileDetails);
        setWorkerAverageRating(parseFloat(averageRating).toFixed(1))
        // Extract feedback data
        const feedbackData = profileDetails.map(item => ({
          name: item.name,
          feedbackText: item.comment,
          feedbackRating: item.feedback_rating,
          date:item.created_at
        }));
        setFeedback(feedbackData);
      } catch (error) {
        console.error('There was an error fetching the data!', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const jwtToken = Cookie.get('pcs');
      console.log(jwtToken);
      try {
        const response = await axios.post(
          'http://localhost:5000/api/registration/status',
          {},
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`, 
            },
          }
        );
        console.log(response);
        if (response.data === "") {
          navigate(`/skill/registration`);
        }
      } catch (error) {
        console.error('There was an error fetching the data!', error);
      }
    };

    fetchData();
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    Cookie.remove('pcs');
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const formatCreatedAt = (createdAt) => {
    const date = new Date(createdAt);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<span key={i} className="filled-star">★</span>);
      } else {
        stars.push(<span key={i} className="empty-star">☆</span>);
      }
    }
    return stars;
  };

  return (
    <div className="dashboard"> 
      <header className="header">
        <nav className="navbar">
          <div className="navbar-left">
            <h1>Click Solver</h1>
          </div>
          <div className="navbar-right">
             <div className="profile-icon" onClick={toggleDropdown}>
             {profile ?  <img src={profile} alt="Profile" /> : <i className="fa-regular fa-user"></i>}
            </div> 
            
            {showDropdown && (
              <div className="dropdown-menu">
                <ul>
                  <li><a href="#" onClick={handleProfile}>Profile</a></li>
                  <li><a href="#">Edit</a></li>
                  <li><a href="#" onClick={handleLogout}>Logout</a></li>
                </ul>
              </div>
            )}
          </div>
        </nav>
      </header> 
      <div className='homeBody'>
      <section className="summary">
        <div className="summary-item">
          <p>Total Services</p>
          <h2>{servicecounts}</h2>
          <p className="percentage">+12% from last month</p>
        </div>
        <div className="summary-item">
          <p>Total Earnings</p>
          <h2>₹{totalEarnings}</h2>
          <p className="percentage">+20.1% from last month</p>
        </div>
        <div className="summary-item">
          <p>Average Rating</p>
          <h2>{workerAverageRating}</h2>
          <p className="percentage">+0.2 from last month</p>
        </div>
      </section>
      <section className="orders">
        <h2>Recent Services <a href="#">View All</a></h2>
        <table>
          <thead>
            <tr>
              <th>Service ID</th>
              <th>Time Worked</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
          {data.map((service) => (
              <tr key={service.notification_id}>
                <td>{service.notification_id}</td>
                <td>{service.time_worked}</td>
                <td>{service.city}, {service.area}, {service.pincode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="feedback">
        <h2>Customer Feedback <a href="#">View All</a></h2>
        {feedback.map((item, index) => (
          <div key={index} className="feedback-item">
            <p className="customer-name">{item.name} <span className="rating">{renderStars(item.feedbackRating)}</span></p>
            <p>{formatCreatedAt(item.date)}</p>
            <p className="feedback-text">{item.feedbackText}</p>
          </div>
        ))}
      </section>
    </div>
    </div>
  );
};

export default Dashboard;
