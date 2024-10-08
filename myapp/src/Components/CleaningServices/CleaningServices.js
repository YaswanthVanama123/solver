import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceCard from '../ServiceCard/ServiceCard';
import ServiceDetails from '../ServiceDetails/ServiceDetails';
import './CleaningServices.css';

const CleaningServices = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [cleaningJobs, setCleaningJobs] = useState([]);

  useEffect(() => {
    const fetchCleaningJobs = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/cleaning/services',
        );
        setCleaningJobs(response.data);
      } catch (error) {
        console.error('Error fetching cleaning services:', error);
      }
    };

    fetchCleaningJobs();
  }, []);

  const openMessageBox = (job) => {
    setSelectedJob(job);
  };

  const closeMessageBox = () => {
    setSelectedJob(null);
  };

  return (
    <div>
      <h1 className="serviceHeader">Cleaning Department Services</h1>
      <div className="cleaning" id="cleaning">
        {cleaningJobs.map((job, index) => (
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

export default CleaningServices;
