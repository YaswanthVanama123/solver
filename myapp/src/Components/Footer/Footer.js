import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer>
            <div className="footer-container">
                <div className="footer-section company">
                    <h4>Company</h4>
                    <ul>
                        <li><a href="#">About us</a></li>
                        <li><a href="#">Terms & conditions</a></li>
                        <li><a href="#">Privacy policy</a></li>
                        <li><a href="#">Anti-discrimination policy</a></li>
                        <li><a href="#">CS impact</a></li>
                        <li><a href="#">Careers</a></li>
                    </ul>
                </div>
                <div className="footer-section customers">
                    <h4>For customers</h4>
                    <ul>
                        <li><a href="#">CS reviews</a></li>
                        <li><a href="#">Categories near you</a></li>
                        <li><a href="#">Blog</a></li>
                        <li><a href="#">Contact us</a></li>
                    </ul>
                </div>
                <div className="footer-section partners">
                    <h4>For partners</h4>
                    <ul>
                        <li><a href="#">Register as a professional</a></li>
                    </ul>
                </div>
                <div className="footer-section social-links">
                    <h4>Social links</h4>
                    <div className="social-icons">
                        <a href="#"><i className="fa-brands fa-twitter footer-tags"></i></a>
                        <a href="#"><i className="fa-brands fa-facebook footer-tags"></i></a>
                        <a href="#"><i className="fa-brands fa-instagram footer-tags"></i></a>
                        <a href="#"><i className="fa-brands fa-linkedin footer-tags"></i></a>
                    </div>
                    <div className="app-links">
                        <a href="#"><i className="fa-brands fa-app-store-ios footer-tags"></i></a>
                        <a href="#"><i className="fa-brands fa-google-play footer-tags"></i></a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; Copyright 2024 Click Solver. All rights reserved. | CIN: C940540DL2014PTC273</p>
            </div>
        </footer>
    ); 
};

export default Footer;
