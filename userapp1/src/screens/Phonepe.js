import React, { useState } from 'react';
import { View, Button, Image } from 'react-native';
import axios from 'axios';

export default function App() {
  const [qrData, setQrData] = useState(null);

  const generateQr = async () => {
    try {
      const response = await axios.post(`${process.env.API_URL}/generate-qr`, {
        transactionId: 'TX32321849644234',
        amount: 1000,
        storeId: '234555',
        terminalId: '894237'
      });
      setQrData(response.data.data.qrString);
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  };

  return (
    <View>
      <Button title="Generate QR" onPress={generateQr} />
      {qrData && <Image source={{ uri: `data:image/png;base64,${qrData}` }} style={{ width: 200, height: 200 }} />}
    </View>
  );
}
