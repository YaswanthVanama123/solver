import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import './PaymentPage.css';

const PaymentPage = () => {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [totalAmount, setTotalAmount] = useState(0); // Initialize with 0
    const [paymentDetails, setPaymentDetails] = useState({});
    const [searchParams] = useSearchParams();
    const encodedId = searchParams.get("encodedId");
    const navigate = useNavigate();
    const [decodedId, setDecodedId] = useState(null);

    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);
    };

    useEffect(() => {
        if (encodedId) {
            const decoded = atob(encodedId);
            setDecodedId(decoded);
        }
    }, [encodedId]);

    const handleCouponCodeChange = (event) => {
        setCouponCode(event.target.value);
    };

    const applyCoupon = () => {
        if (couponCode === 'DISCOUNT10') {
            setTotalAmount(totalAmount - 10);
        }
    };

    const formatTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        if (decodedId) {
            console.log(decodedId)
            const fetchPaymentDetails = async () => {
                try {
                    const response = await axios.post("http://localhost:5000/api/payment/details", {
                        notification_id: decodedId,
                    });

                    const { start_time, end_time, time_worked, totalAmount } = response.data;
                    setPaymentDetails({
                        start_time: formatTime(start_time),
                        end_time: formatTime(end_time),
                        time_worked
                    });
                    setTotalAmount(totalAmount);
                } catch (error) {
                    console.error('Error fetching payment details:', error);
                }
            };
            fetchPaymentDetails();
        }
    }, [decodedId]);

    const handlepayed = () =>{
        navigate("/")
    }

    return (
        <div className="payment-main-container">
        <div className="payment-container">
            <h2>Payment</h2>
            <p>Complete your payment.</p>
            <div className="payment-details">
                <div className="service">
                    <span>Service</span>
                    <span>Plumbing Repair</span>
                </div>
                <div className="price">
                    <span>Start time</span>
                    <span>{paymentDetails.start_time}</span>
                </div>
                <div className="price">
                    <span>End time</span>
                    <span>{paymentDetails.end_time}</span>
                </div>
                <div className="price">
                    <span>Time worked</span>
                    <span>{paymentDetails.time_worked}</span>
                </div>
                <div className="price">
                    <span>Total Amount</span>
                    <span>${totalAmount.toFixed(2)}</span>
                </div>
            </div>
            <div className="total-amount">
                <span>Total Amount</span>
                <span>${totalAmount.toFixed(2)}</span>
            </div>
            <button className="pay-now" onClick={handlepayed}>User Paid</button>
        </div>
        </div>
    );
};

export default PaymentPage;
