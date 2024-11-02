import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./TimingRoute.css";

const TimingRoute = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [searchParams] = useSearchParams();
  const encodedId = searchParams.get("encodedId");
  const navigate = useNavigate();
  const [decodedId, setDecodedId] = useState(null);

  useEffect(() => {
    if (encodedId) {
      const decoded = atob(encodedId);
      setDecodedId(decoded);
    }
  }, [encodedId]);

  useEffect(() => {
    const startTiming = async () => {
      if (decodedId) {
        try {
          const response = await axios.post("http://localhost:5000/api/work/time/start", {
            notification_id: decodedId,
          });

          // console.log("Timing started:", response);
        } catch (error) {
          console.error("Error starting timing:", error);
        }
      }
    };

    startTiming();
  }, [decodedId]);

  useEffect(() => {
    const fetchInitialTime = async () => {
      if (decodedId) {
      try {
        const response = await axios.post("http://localhost:5000/api/timer/value", {
          notification_id: decodedId,
        });
        console.log(response.data)
        const [hh, mm, ss] = response.data.split(":");
        setHours(parseInt(hh));
        setMinutes(parseInt(mm));
        setSeconds(parseInt(ss));
      } catch (error) {
        console.error("Error fetching initial time:", error);
      }
    }
    };

    fetchInitialTime();
  }, [decodedId]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  useEffect(() => {
    if (seconds === 60) {
      setMinutes((prevMinutes) => prevMinutes + 1);
      setSeconds(0);
    }
    if (minutes === 60) {
      setHours((prevHours) => prevHours + 1);
      setMinutes(0);
    }
  }, [seconds, minutes]);

  const handleCompleteClick = async () => {
    setIsActive(false);
    console.log(
      `Time stopped: ${hours} hours : ${minutes} minutes : ${seconds} seconds`
    );

    if (decodedId) {
      try {
        const response = await axios.post("http://localhost:5000/api/work/time/completed", {
          notification_id: decodedId,
        });
        console.log("Work completed:", response.data);

        const newHours = Math.floor(minutes / 60);
        console.log(newHours);
        setHours(newHours);
        setMinutes(minutes % 60);
        setSeconds(seconds);
        navigate(`/payment/page?encodedId=${encodedId}`)
      } catch (error) {
        console.error("Error completing work:", error);
      }
    }
  };

  return (
    <div className="timingMainContainer">
      <div>
        <div className="header">
          <div className="icon" onClick={() => navigate(-1)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              height="24px"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
            </svg>
          </div>
          <h2 className="header-title">Time Tracking</h2>
        </div>

        <div className="time-boxes mt-5">
          <TimeBox label="Hours" value={hours} />
          <TimeBox label="Minutes" value={minutes} />
          <TimeBox label="Seconds" value={seconds} />
        </div>

        <div className="charge-info mt-5">
          <div className="charge-text">
            <p className="main-text">The minimum charge is 149₹</p>
            <p className="sub-text">
              Next Every half hour, you will be charged for 49₹
            </p>
            <p className="sub-text">The minimum charge is 30 minutes</p>
          </div>
          <div className="info-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              height="24px"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path>
            </svg>
          </div>
        </div>

        <div className="progress-wrapper">
                <div className="progress-info">
                    <p className="progress-text">Progress</p>
                    <p className="progress-percentage">50%</p>
                </div>
                <div className="progress-bar-background">
                    <div className="progress-bar"></div>
                </div>
        </div>

        {/* <div className="work-progress">
          <div className="progress-text">
            <p className="text-black text-base font-medium leading-normal">
              Work in Progress
            </p> 
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar"></div>
          </div>
        </div> */}
        <div className="timingContainer">
          <div className="timing-container">
            <div className="flex-container">
              <button className="complete-button" onClick={handleCompleteClick}>
                <span className="button-text">Completed Work</span>
              </button>
            </div>
          </div>
        </div>
        <div className="spacer"></div>
      </div>
    </div>
  );
};

const TimeBox = ({ label, value }) => (
  <div className="time-box">
    <div className="time-value">
      <p className="time-text">
        {label === "Hours"
          ? value.toString().padStart(2, "0")
          : label === "Minutes"
          ? value.toString().padStart(2, "0")
          : label === "Seconds"
          ? value.toString().padStart(2, "0")
          : null}
      </p>
    </div>
    <div className="time-label">
      <p className="label-text">{label}</p>
    </div>
  </div>
);

export default TimingRoute;
