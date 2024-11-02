import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Cookie from 'js-cookie';
import './SkillRegistration.css';

const SkillRegistration = () => {
    const [profilePic, setProfilePic] = useState(null);
    const [proofPic, setProofPic] = useState(null);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [subService, setSubService] = useState([]);
    const [agree, setAgree] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/servicecategories');
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const displayImage = async (event, setImage) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const imageUrl = await uploadImage(file);
                setImage(imageUrl);
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
          const jwtToken = Cookie.get('pcs');
          console.log(jwtToken)
          try {
            const response = await axios.post(
              'http://localhost:5000/api/registration/status',
              {},
              {
                headers: {
                  Authorization: `Bearer ${jwtToken}`, 
                },
              }
            );
            console.log(response)
            if(response.status === 200){
              navigate(`/`)
            }
          } catch (error) {
            console.error('There was an error fetching the data!', error);
          }
        };
    
        fetchData();
      }, []);

    const uploadImage = async (imageFile) => {
        const apiKey = "287b4ba48139a6a59e75b5a8266bbea2"; // Replace with your ImgBB API key
        const apiUrl = "https://api.imgbb.com/1/upload";

        const formData = new FormData();
        formData.append("key", apiKey);
        formData.append("image", imageFile);

        const response = await fetch(apiUrl, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Failed to upload image.");
        }

        const data = await response.json();
        return data.data.url;
    };

    const handleServiceChange = async (e) => {
        const selected = e.target.value;
        setSelectedService(selected);

        try {
            const response = await axios.post('http://localhost:5000/api/subservice/checkboxes', { selectedService: selected });
            setSubService(response.data);
        } catch (error) {
            console.error('Error fetching subservices:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const checkedServices = subService.filter(sub => document.getElementById(sub.service_name)?.checked).map(sub => sub.service_name);

        const data = {
            selectedService,
            checkedServices,
            profilePic,
            proofPic,
            agree
        }; 

        const jwtToken = Cookie.get('pcs');
        try {
            const response = await axios.post('http://localhost:5000/api/worker/skill/registration/filled', data,{
                headers: {
                  Authorization: `Bearer ${jwtToken}`,
                },
              });
            console.log('Submission response:', response.data);
            // Handle successful submission
        } catch (error) {
            console.error('Error submitting form:', error);
            // Handle error
        }
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
      };
      const handleLogout = () => {
        Cookie.remove('pcs'); // Remove the pcs token from cookies
        navigate('/login'); // Navigate to the login route
      };

    return (
        <div className=''> 
        <header className="header">
        <nav className="navbar">
          <div className="navbar-left">
            <h1>Click Solver</h1>
          </div>
          <div className="navbar-right">
             <div className="profile-icon" onClick={toggleDropdown}>
             {<i className="fa-regular fa-user"></i>}
            </div> 
            
            {showDropdown && (
              <div className="dropdown-menu">
                <ul>
                  <li><a href="#" onClick={handleLogout}>Logout</a></li>
                </ul>
              </div>
            )}
          </div>
        </nav>
      </header>
        <div className="skillRegistrationContainer">
            <div>
                <h1 className='skillHead1'>Register as a Click Solver Worker</h1>
                <p>Fill out the form to become a service provider with Click Solver.</p>

                <form onSubmit={handleSubmit}>
                    <div className="personal-info">
                        <h2>Personal Information</h2>
                        <div className="flexDirection">
                            <div className="profileContainer">
                                <div className="form-group">
                                    <div
                                        className="profilePic"
                                        style={{ backgroundImage: `url(${profilePic})` }}
                                        id="profilePic"
                                    ></div>
                                </div>
                                <div className="form-group">
                                    <input
                                        type="file"
                                        id="profilePicInput"
                                        onChange={(e) => displayImage(e, setProfilePic)}
                                        style={{ display: 'none' }}
                                    />
                                    <label className="custom-file-input" htmlFor="profilePicInput">
                                        Choose Profile Picture
                                    </label>
                                </div>
                            </div>
                            <div className="profileContainer">
                                <div className="form-group">
                                    <div
                                        className="proofPic"
                                        style={{ backgroundImage: `url(${proofPic})` }}
                                        id="proofPic"
                                    ></div>
                                </div>
                                <div className="form-group">
                                    <input
                                        type="file"
                                        id="proofPicInput"
                                        onChange={(e) => displayImage(e, setProofPic)}
                                        style={{ display: 'none' }}
                                    />
                                    <label className="custom-file-input" htmlFor="proofPicInput">
                                        Choose Proof Picture
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="category-registration">
                        <h2>Skill Registration</h2>
                        <div className="form-group">
                            <label htmlFor="category">Select Service Category</label>
                            <select 
                                id="category" 
                                value={selectedService}
                                onChange={handleServiceChange}
                            >
                                <option value="">Select a category</option>
                                {services.map((service) => (
                                    <option key={service.service_id} value={service.service_name}>
                                        {service.service_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="skill-registration">
                        <h2>Category Registration</h2>
                        <div className="form-group-check">
                            {subService.map((sub) => (
                                <div key={sub.service_id}>
                                    <input 
                                        type="checkbox" 
                                        id={sub.service_name} 
                                        value={sub.service_name} 
                                    />
                                    <label htmlFor={sub.service_name}>{sub.service_name}</label>
                                </div>
                            ))}
                        </div>
                        <button type="button">+ Add New Skill</button>
                    </div>

                    <div className="terms-conditions">
                        <input 
                            type="checkbox" 
                            id="terms" 
                            checked={agree}
                            onChange={() => setAgree(!agree)}
                        />
                        <label htmlFor="terms">
                            I agree to the Click Solver <a href="#">Terms and Conditions</a>
                        </label>
                    </div>
                    <div className="submitskillmainContainer">
                        <div className="button-div">
                            <button type="submit" className="skillsubmit">Submit</button>
                        </div>
                    </div>
                </form>
            </div>
            </div>
        </div>
    );
};

export default SkillRegistration;
