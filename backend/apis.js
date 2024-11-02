const express = require('express');
const path = require('path');
const cors = require('cors');
const router = require('./router');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const app = express();
const port = 5000;
const axios = require('axios')
const uniqid = require('uniqid')
const sha256 = require("sha256");
const { request } = require('http');




// Enable CORS for all routes
app.use(cors());
app.get('/api/test', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
  });
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use('/api', router);

// const generatePhonePeQR = async () => {
//     // Test setup details
//     const baseURL = 'https://mercury-uat.phonepe.com/enterprise-sandbox';
//     const endpoint = '/v3/qr/init';
//     const transactionId = uniqid()
//     const merchantId = 'PGTESTPAYUAT';
//     const saltKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
//     const saltIndex = '1';

//     // Payload for QR generation
//     const payload = {
//         merchantId: 'PGTESTPAYUAT',
//         transactionId: transactionId, // Unique Transaction ID
//         merchantOrderId: 'TX12345678901234',
//         amount: 1000, // Amount in paise (1 INR)
//         storeId: 'STORE123',
//         terminalId: 'TERMINAL123',
//         expiresIn: 1800, // 30 minutes expiry
//         gstBreakup: {
//             gst: 100,
//             cgst: 25,
//             cess: 25,
//             sgst: 25,
//             igst: 25,
//             gstIncentive: 100,
//             gstPercentage: 10
//         },
//         invoiceDetails: {
//             invoiceNumber: 'INV123456',
//             invoiceDate: '2023-09-02T10:00:00.000Z',
//             invoiceName: 'Sample Invoice'
//         }
//     };

//     // Convert payload to base64

//     const payloadBase64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");

//     // Generate X-VERIFY header
//     const xVerify = sha256(payloadBase64 + endpoint + saltKey) + "###" + saltIndex;
//     try {
//         const response = await axios.post(`${baseURL}${endpoint}`, {
//             request: payloadBase64
//         }, {
//             headers: {
//                 accept: "application/json",
//                 "Content-Type": "application/json",
//                 "X-VERIFY": xVerify
//             }
//         });
//         console.log('QR Code Generated Successfully:', response.data);
//     } catch (error) {
//         console.error('Error generating QR code:', error.response ? error.response.data : error.message);
//     }
// };

// // Call the function
// generatePhonePeQR();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
