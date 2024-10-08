import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceDetails from '../ServiceDetails/ServiceDetails';
import './ElectricalServices.css';
import ServiceCard from '../ServiceCard/ServiceCard';

const ElectricianServices = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [electricianJobs, setElectricianJobs] = useState([]);

  useEffect(() => {
    const fetchElectricianJobs = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/electrician/services',
        );
        setElectricianJobs(response.data);
      } catch (error) {
        console.error('Error fetching electrician services:', error);
      }
    };

    fetchElectricianJobs();
  }, []);

  const openMessageBox = (job) => {
    setSelectedJob(job);
  };

  const closeMessageBox = () => {
    setSelectedJob(null);
  };

  const cards = [];
  for (let i = 0; i < electricianJobs.length; i += 2) {
    const job1 = electricianJobs[i];
    const job2 = electricianJobs[i + 1];
    cards.push(
      <div className="doublecards" key={i}>
        <ServiceCard job={job1} onClick={() => openMessageBox(job1)} />
        {job2 && (
          <ServiceCard job={job2} onClick={() => openMessageBox(job2)} />
        )}
      </div>,
    );
  }

  return (
    <div>
      <h1 className="serviceHeader">Electrical Repairing Services</h1>
      <div id="electrician">{cards}</div>
      <ServiceDetails job={selectedJob} onClose={closeMessageBox} />
    </div>
  );
};

export default ElectricianServices;
