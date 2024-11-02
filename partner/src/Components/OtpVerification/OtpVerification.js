import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.css"; // Import FontAwesome CSS
import "./OtpVerification.css";

const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const [searchParams] = useSearchParams();
  const encodedId = searchParams.get("encodedId");
  const navigate = useNavigate();
  const [decodedId, setDecodedId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (encodedId) {
      const decoded = atob(encodedId);
      setDecodedId(decoded);
    }
  }, [encodedId]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== "" && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  useEffect(() => {
    inputRefs.current[0].focus();
  }, []);

  const handleSubmit = async () => {
    const enteredOtp = otp.join("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/pin/verification",
        {
          notification_id: decodedId,
          otp: enteredOtp,
        }
      );

      if (response.status === 200) {
        console.log("OTP is correct");
        navigate(`/service/timing?encodedId=${encodedId}`);
      } else {
        setError("OTP is incorrect");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError("OTP is incorrect");
    }
  };

  return (
    <div className="otpMainContainer">
      <h1 className="otpTextMobile">OTP</h1>
      <div className="mainOtpContainer">
        <div className="container1">
          <h1 className="otpTextMedium">OTP</h1>
          <div className="otp-image">
            <i className="fa-regular fa-file fileICon"></i>
          </div>
          <h2 className="Verificationtext">Verification Code</h2>
          <div className="otp-inputs1">
            {otp.map((value, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={value}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
                className="otp-input"
              />
            ))}
          </div>
          {error && <div className="error">{error}</div>}
          <button className="submit-btn-otp" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
