import React from 'react';
import Slider from 'react-slick';
import ServicesProvidedCards from '../ServicesProvidedCards/ServicesProvidedCards.js';
import './ServicesCarousel.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ServicesCarousel = ({ jobs, onCardClick }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3, // Default to 3 slides to show
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    cssEase: 'linear',
    responsive: [
      {
        breakpoint: 1200, // Adjust as needed for large devices
        settings: {
          slidesToShow: 3, // 3 cards per row on large devices
        },
      },
      {
        breakpoint: 1024, // Adjust as needed for medium devices
        settings: {
          slidesToShow: 2, // 2 cards per row on medium devices
        },
      },
      {
        breakpoint: 768, // Adjust as needed for small devices
        settings: {
          slidesToShow: 1, // 1 card per row on small devices
        },
      },
    ],
  };

  return (
    <Slider {...settings}>
      {jobs.map((job) => (
        <ServicesProvidedCards
          key={job.service_id}
          job={job}
          onClick={onCardClick}
        />
      ))}
    </Slider>
  );
};

export default ServicesCarousel;
