import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import './Payment.css';

const Payment = () => {
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

    const handlePayment = async () => {
        try {
            await axios.post("http://localhost:5000/api/user/payed", {
                totalAmount,
                paymentMethod,
                decodedId
            });
            navigate(`/rating?encodedId=${encodedId}`);
        } catch (error) {
            console.error('Error processing payment:', error);
        }
    };

    return (
        <div className="payment-main-container">
           <h2 className="paymentHeadText mobile-device mobiledevice">Payment</h2>
           <hr className="hline mobile-device" />
            <div className="payment-container">
                <h2 className="paymentHeadText large-device">Payment</h2>
                <p className="completeWorkText">Complete your payment.</p>
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
                <div className="payment-method">
                    <label htmlFor="payment-method">Payment Method</label>
                    <select id="payment-method" value={paymentMethod} onChange={handlePaymentMethodChange}>
                        <option value="">Select payment method</option>
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                    </select>
                </div>
                <div className="coupon">
                    <label htmlFor="coupon-code">Coupon/Promo Code</label>
                    <input
                        type="text"
                        id="coupon-code"
                        value={couponCode}
                        onChange={handleCouponCodeChange}
                        placeholder="Enter coupon code"
                    />
                    <button id="apply-button" onClick={applyCoupon}>Apply</button>
                </div>
                <div className="total-amount">
                    <span>Total Amount</span>
                    <span>${totalAmount.toFixed(2)}</span>
                </div>
                <button className="pay-now" onClick={handlePayment}>Pay Now</button>
            </div>
        </div>
    );
};

export default Payment;
