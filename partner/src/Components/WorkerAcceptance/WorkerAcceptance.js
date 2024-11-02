import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import "@fortawesome/fontawesome-free/css/all.css"; // Import FontAwesome CSS
import "./WorkerAcceptance.css";

const WorkerAcceptance = () => {
  const [searchParams] = useSearchParams();
  const encodedId = searchParams.get("user_notification_id");
  const navigate = useNavigate();
  const [workDetails, setWorkDetails] = useState(null); // State to store work details
  const [decodedId, setDecodedId] = useState(null);
  const [city,setCity] = useState(null)
  const [area,setArea] = useState(null)
  const [alternateName,setAlternateName] = useState(null)
  const [alternatePhoneNumber,setAlternatePhoneNumber] = useState(null)
  const [pincode,setPincode] = useState(null)
  const [service,setService] = useState(null);

  useEffect(() => {
    // Decode the Base64 encoded ID if needed
    if (encodedId) {
      const decoded = atob(encodedId);
      setDecodedId(decoded);
    }
  }, [encodedId]);

  useEffect(() => {
    if (decodedId) {
        console.log(decodedId)
        const fetchPaymentDetails = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/worker/details", {
                    notification_id: decodedId,
                });
                const {city,area,pincode,alternate_name,alternate_phone_number,service} = response.data
                setAlternateName(alternate_name)
                setAlternatePhoneNumber(alternate_phone_number)
                setArea(area)
                setCity(city)
                setPincode(pincode)
                setService(service)
                console.log(response.data)
            } catch (error) {
                console.error('Error fetching payment details:', error);
            }
        };
        fetchPaymentDetails();
    }
}, [decodedId]);

  // useEffect(() => {
  //   const fetchWorkDetails = async (notificationId) => {
  //     const jwtToken = Cookies.get("pcs"); // Assuming the token is stored in a cookie named 'pcs'

  //     try {
  //       const response = await axios.get(
  //         "http://localhost:5000/api/worker/details",
  //         {
  //           user_notification_id: notificationId,
  //         },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${jwtToken}`,
  //           },
  //         }
  //       );

  //       console.log(response)

  //       if (response.status === 200) {
  //         setWorkDetails(response.data); // Update state with the response data
  //         console.log("Work details fetched successfully:", response.data);
  //       } else {
  //         console.error("Unexpected response status:", response.status);
  //       }
  //     } catch (error) {
  //       console.error("Error while fetching work details:", error);
  //     }
  //   };

  //   // Fetch work details when decodedId is available
  //   if (decodedId) {
  //     fetchWorkDetails(decodedId);
  //   }
  // }, [decodedId]);

  const handleAccept = async () => {
    const jwtToken = Cookies.get("pcs"); // Assuming the token is stored in a cookie named 'pcs'

    try {
      const response = await axios.post(
        "http://localhost:5000/api/accept/request",
        {
          user_notification_id: decodedId,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (response.status === 200) {
        const { notificationId } = response.data;
        const encodedNotificationId = btoa(notificationId);
        console.log("Request successful", encodedNotificationId);
        navigate(`/worker/navigation?encodedId=${encodedNotificationId}`);
      } else {
        console.error("Unexpected response status:", response.status);
        navigate("/");
      }
    } catch (error) {
      console.error("Error while sending acceptance:", error);
      navigate("/");
    }
  };

  const handleReject = async () => {
    const jwtToken = Cookies.get("pcs"); // Assuming the token is stored in a cookie named 'pcs'

    try {
      const response = await axios.post(
        "http://localhost:5000/api/reject/request",
        {
          user_notification_id: decodedId,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Request successful", response.data);
        navigate("/");
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("Error while sending rejection:", error);
    }
  };

  return (
    <div className='accept-main-container'>
      <div className="ride-request">
        <h1>New Service Request</h1>
        <div className="info">
          <img src="https://via.placeholder.com/40" alt="User" />
          <div>
            <p>{alternateName}</p>
          </div>
        </div>
        <div className="location">
          <p>Service Name</p>
          <span>{service}</span>
        </div>
        <div className="location">
          <p>Location</p>
          <span>{area}, {city}, {pincode}</span>
        </div>

        <div className="estimate">
          <div>
            <p>Minimum charges</p>
 
          </div> 
          <div>
            <p>149$</p>
     
          </div>
        </div>
        <div className="buttons">
          <button className="decline" onClick={handleReject}>Decline</button>
          <button className="accept" onClick={handleAccept}>Accept</button>
        </div>
      </div>
    </div>
  );
};

export default WorkerAcceptance;
