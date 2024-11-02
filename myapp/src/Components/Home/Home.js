import React from 'react';
import './Home.css';

import SearchBox from '../SearchBox/SearchBox.js';
import ServicesProvided from '../ServicesProvided/ServicesProvided.js';
import ElectricalServices from '../ElectricalServices/ElectricalServices.js';
import PlumberServices from '../PlumberServices/PlumberServices.js';
import CleaningServices from '../CleaningServices/CleaningServices.js';
import PaintingServices from '../PaintingServices/PaintingServices.js';
import VehicleServices from '../VehicleServices/VehicleServices.js';
import FullCard from '../FullCard/FullCard.js';
import SecondFullCard from '../SecondFullCard/SecondFullCard.js';
import ServicesProvidedCards from '../ServicesProvidedCards/ServicesProvidedCards.js';
import Footer from '../Footer/Footer.js';
import NavBar from '../BottomNav/BottomNav.js';

const Home = () => {
  return (
    <div className="mainContainer">
      <SearchBox />
      <div className="services-container">
        <PlumberServices />
        <ServicesProvided />
        <ElectricalServices />
        <FullCard />
        <CleaningServices />
        <SecondFullCard />
        <PaintingServices />
        <VehicleServices />
      </div>
      <Footer /> 
      <NavBar />
    </div>
  );
};

export default Home;
 