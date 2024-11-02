import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceCard from '../ServiceCard/ServiceCard';
import ServiceDetails from '../ServiceDetails/ServiceDetails';
import './PlumberServices.css';

const PlumberServices = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [plumberJobs, setPlumberJobs] = useState([]);

  useEffect(() => {
    const fetchPlumberJobs = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/plumber/services',
        );
        setPlumberJobs(response.data);
      } catch (error) {
        console.error('Error fetching plumber services:', error);
      }
    };

    fetchPlumberJobs();
  }, []);

  const openMessageBox = (job) => {
    setSelectedJob(job);
  };

  const closeMessageBox = () => {
    setSelectedJob(null);
  };

  return (
    <div>
      <h1 className="serviceHeader">Plumber Repairing Services</h1>
      <div id="plumber" className="plumber">
        {plumberJobs.map((job, index) => (
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

export default PlumberServices;
