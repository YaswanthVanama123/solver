import React from 'react';
import { Link } from 'react-router-dom';
import './ServiceDetails.css';

const ServiceDetails = ({ job, onClose }) => {
  return (
    <div className={`messageContainer ${job ? 'active' : ''}`}>
      {job && (
        <div id="messageBox" className="messageBoxActive">
          <div className="messageCardContainer">
            <img
              src={job.service_urls}
              alt={job.service_name}
              className="cardImage"
            />
            <div className="selectedTitle">{job.service_name}</div>
            <Link
              to={`/userlocation/${job.service_title}/${job.service_name}`}
              className="bookCaptainButton"
            >
              Book Commander
            </Link>
            <hr className="hline" />
            <div className="messageCardContainer scrollDiv">
              <h1 className="headDetails">Charges details</h1>
              <div className="timecharges pl-3">
                <i className="fa-regular fa-clock clockIcon clock"></i>
                <p className="moneyCharges">
                  Minimum Charges for 1/2 hour 149₹
                </p>
              </div>
              <div className="timecharges pl-3">
                <i className="fa-solid fa-indian-rupee-sign clock"></i>
                <p className="moneyCharges">
                  49₹ will be charged for every next 1/2 hour
                </p>
              </div>
            </div>
          </div>
          <button className="closeButton" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceDetails;
