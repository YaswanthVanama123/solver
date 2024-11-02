import React from 'react';
import { useFocusEffect, useNavigationState } from '@react-navigation/native';
import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';

const NavigationObserver = () => {
  const navigationState = useNavigationState((state) => state);

  useFocusEffect(
    React.useCallback(() => {
      const updateScreenData = async () => {
        try {
          const token = await EncryptedStorage.getItem('cs_token');

          if (token && navigationState) {
            const currentRoute = navigationState.routes[navigationState.index];
            const screenName = currentRoute?.name || 'Unknown Screen';
            let params = currentRoute?.params || {};

            // Ensure params is an object
            if (typeof params === 'string') {
              params = JSON.parse(params);
            }

            console.log(params);

            // Store screenName and params in EncryptedStorage
            await EncryptedStorage.setItem('screen', screenName);
            await EncryptedStorage.setItem('parameter', JSON.stringify(params));

            // Send data to backend
            await axios.post(
              'http://10.0.2.2:5000/api/updating/user/screen',
              {
                screenName: screenName,
                params: params,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
          }
        } catch (error) {
          console.error('Error sending screen data:', error);
        }
      };

      updateScreenData();
    }, [navigationState])
  );

  return null;
};


export default NavigationObserver;
