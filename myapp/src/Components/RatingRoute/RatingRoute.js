import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Cookies from 'js-cookie';
import './RatingRoute.css';

const RatingRoute = () => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [service, setService] = useState(null);

  const [searchParams] = useSearchParams();
  const encodedId = searchParams.get("encodedId");
  const navigate = useNavigate();
  const [decodedId, setDecodedId] = useState(null);

  useEffect(() => {
    if (encodedId) {
      const decoded = atob(encodedId);
      setDecodedId(decoded);
    }
  }, [encodedId]);

  useEffect(() => {
    if (decodedId) {
      console.log(decodedId);
      const fetchPaymentDetails = async () => {
        try {
          const response = await axios.post("http://localhost:5000/api/worker/details/rating", {
            notification_id: decodedId,
          });
          console.log(response.data);
          const { service, name } = response.data;
          setName(name);
          setService(service);
        } catch (error) {
          console.error('Error fetching payment details:', error);
        }
      };
      fetchPaymentDetails();
    }
  }, [decodedId]);

  const handleStarClick = (value) => {
    setRating(value);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/user/feedback", {
        notification_id: decodedId,
        rating,
        comments,
      });
      console.log('Feedback submitted:', response.data);
      navigate('/');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div className='feedback-main-container'>
      <div className="feedback-container">
      <h2 className="mobile-device mobiledevice">Rate your Click Solver Commander</h2>
        <div className="feedback-body">
          <h2 className="large-device">Rate your Click Solver Commander</h2>
          <p>Help us improve our services by providing feedback on your recent experience.</p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Commander</label>
            <input type="text" id="name" value={name} disabled />

            <label htmlFor="rating" className="rating-label">Rating</label>
            <div className="stars" id="rating">
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  className={`star ${rating > index ? 'selected' : ''}`}
                  data-value={index + 1}
                  onClick={() => handleStarClick(index + 1)}
                  onMouseOver={() => handleStarClick(index + 1)}
                  onMouseOut={() => handleStarClick(rating)}
                >
                  &#9733;
                </span>
              ))}
            </div>
            <p id="rating-text">{rating} star{rating !== 1 ? 's' : ''}</p>

            <label htmlFor="comments">Comments</label>
            <textarea
              id="comments"
              className="textareaComment"
              name="comments"
              placeholder="Share your thoughts on the service"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />

            <button type="submit">Submit Feedback</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingRoute;
