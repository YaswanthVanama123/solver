import React from 'react';
import './ServicesProvidedCards.css';

const ServicesProvidedCards = ({ job, onClick }) => {
  return (
    <li
      className={`services-provided-cards-container ${job.service_name}`}
      onClick={() => onClick(job)}
    >
      <div className="serviceCardContent">
        <div>
          <h1 className={job.service_name}>{job.service_name}</h1>
        </div>
        <div>
          <button className="ServiveCardButton">Book</button>
        </div>
      </div>
      <div>
        <img
          src={job.service_urls}
          alt={job.service_name}
          className="ServicesCardImage"
        />
      </div>
    </li>
  );
};

export default ServicesProvidedCards;
