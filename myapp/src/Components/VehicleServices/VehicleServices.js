import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceCard from '../ServiceCard/ServiceCard.js';
import ServiceDetails from '../ServiceDetails/ServiceDetails.js';
import './VehicleServices.css';

const VehicleServices = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [vehicleJobs, setVehicleJobs] = useState([]);

  useEffect(() => {
    const fetchVehicleJobs = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/vehicle/services',
        );
        setVehicleJobs(response.data);
      } catch (error) {
        console.error('Error fetching vehicle services:', error);
      }
    };

    fetchVehicleJobs();
  }, []);

  const openMessageBox = (job) => {
    setSelectedJob(job);
  };

  const closeMessageBox = () => {
    setSelectedJob(null);
  };

  return (
    <div>
      <h1 className="serviceHeader">Vehicle Mechanic & Saloon Services</h1>
      <div className="mechanic" id="mechanic">
        {vehicleJobs.map((job, index) => (
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

export default VehicleServices;
