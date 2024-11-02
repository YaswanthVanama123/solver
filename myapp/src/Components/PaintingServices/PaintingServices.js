import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceCard from '../ServiceCard/ServiceCard';
import ServiceDetails from '../ServiceDetails/ServiceDetails';
import './PaintingServices.css';

const PaintingServices = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [paintingJobs, setPaintingJobs] = useState([]);

  useEffect(() => {
    const fetchPaintingJobs = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/painting/services',
        );
        setPaintingJobs(response.data);
      } catch (error) {
        console.error('Error fetching painting services:', error);
      }
    };

    fetchPaintingJobs();
  }, []);

  const openMessageBox = (job) => {
    setSelectedJob(job);
  };

  const closeMessageBox = () => {
    setSelectedJob(null);
  };

  return (
    <div>
      <h1 className="serviceHeader">Painting Services</h1>
      <div className="painter" id="painter">
        {paintingJobs.map((job, index) => (
          <ServiceCard
            key={index}
            job={job}
            onClick={() => openMessageBox(job)}
          />
        ))}
      </div>
      <ServiceDetails job={selectedJob} onClose={closeMessageBox} />
    </div>
  );
};

export default PaintingServices;
