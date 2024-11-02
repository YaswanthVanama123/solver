import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ServicesProvided.css';
import ServiceDetails from '../ServiceDetails/ServiceDetails';
import ServicesCarousel from '../ServicesCarousel/ServicesCarousel';

const ServicesProvided = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/servicecategories',
      );
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const openMessageBox = (service) => {
    console.log('Opening message box for:', service);
    setSelectedService(service);
  };

  const closeMessageBox = () => {
    console.log('Closing message box');
    setSelectedService(null);
  };

  return (
    <div>
      <h1 className="serviceHeader locationSearch" id="serviceHeader">
        Services Provided
      </h1>
      <ul className="uListServicesProvided">
        <ServicesCarousel jobs={services} onCardClick={openMessageBox} />
      </ul>
      <ServiceDetails job={selectedService} onClose={closeMessageBox} />
    </div>
  );
};

export default ServicesProvided;
