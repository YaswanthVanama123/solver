import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './SearchBox.css';
import SearchSuggestions from '../SearchSuggestions/SearchSuggestions';

const SearchBox = () => {
  const initialPlaceholder = 'Search for ';
  const additionalTexts = [
    'electrician',
    'plumber',
    'cleaning services',
    'painter',
    'mechanic',
  ];

  const navigate = useNavigate(); // Get the navigate function

  const [placeholderText, setPlaceholderText] = useState(initialPlaceholder);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [loginStatus, setLoginStatus] = useState(false);

  useEffect(() => {
    const updatePlaceholder = () => {
      const word = additionalTexts[currentIndex];

      if (currentWordIndex < word.length) {
        setPlaceholderText(placeholderText + word[currentWordIndex]);
        setCurrentWordIndex(currentWordIndex + 1);
      } else {
        setPlaceholderText(initialPlaceholder);
        setCurrentIndex((currentIndex + 1) % additionalTexts.length);
        setCurrentWordIndex(0);
      }
    };

    const interval = setInterval(updatePlaceholder, 200);

    return () => clearInterval(interval);
  }, [placeholderText, currentWordIndex, currentIndex, additionalTexts, initialPlaceholder]);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = Cookies.get('cs');
      
      if (!token) {
        setLoginStatus(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/user/login/status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          setLoginStatus(true);
        } else {
          setLoginStatus(false);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setLoginStatus(false);
        } else {
          console.error('Error checking login status:', error);
        }
      }
    };

    checkLoginStatus();
  }, [setLoginStatus]); // Add setLoginStatus to the dependency array

  const handleInputChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      setIsFocused(true);
      document.body.classList.add('no-scroll');
    } else {
      setIsFocused(false);
      setSuggestions([]);
      document.body.classList.remove('no-scroll');
      return;
    }

    if (query.length > 2) {
      try {
        const response = await axios.get(`http://localhost:5000/api/services?search=${query}`);
        setSuggestions(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (searchQuery.length > 0) {
        setIsFocused(true);
        document.body.classList.add('no-scroll');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchQuery]);

  const handleLogout = () => {
    Cookies.remove('cs'); // Remove the pcs token from cookies
    navigate('/login'); // Navigate to the login route
  };

  return (
    <div className={`navContainer ${isFocused ? 'focused' : ''}`}>
      <div className="left-section">
        <h2>Click solver</h2>
      </div>
      <div className="middle-section">
        <div className="search-wrapper">
          <input
            type="search"
            placeholder={placeholderText}
            className="servicesSearch"
            id="searchBox"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => {
              if (searchQuery.length > 0) {
                setIsFocused(true);
                document.body.classList.add('no-scroll');
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                if (searchQuery.length === 0) {
                  setIsFocused(false);
                  document.body.classList.remove('no-scroll');
                }
              }, 100);
            }}
          />
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
        </div>
        {isFocused && suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((suggestion, index) => (
              <SearchSuggestions suggestion={suggestion} key={index} />
            ))}
          </ul>
        )}
      </div>
      <div className="right-section">
        {loginStatus ? (
          <div className="right-section">
            <div className="profile-icon">
              <span><i className="fa-regular fa-user"></i></span>
            </div>
            <div className="dropdown-menu">
              <a href="/">Home</a>      
              <a href="/account">Account</a>
              <a href="/my/bookings">Bookings</a>
              <a href="" onClick={handleLogout}>Logout</a>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className="homeLoginButton">Login</button>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
