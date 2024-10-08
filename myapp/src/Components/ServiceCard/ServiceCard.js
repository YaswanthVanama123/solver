import React from 'react';
import './ServiceCard.css';

const ServiceCard = ({ job, onClick }) => {
  return (
    <div className="itemsAlign" onClick={() => onClick(job)}>
      <div className="card">
        <img
          src={job.service_urls}
          alt={job.service_name}
          className="cardImageScreen"
        />
        <div className="title">{job.service_name}</div>
      </div>
    </div>
  );
};

export default ServiceCard;
