/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import firebase from '@react-native-firebase/app';
// import auth from '@react-native-firebase/auth';


// firebase.initializeApp();

AppRegistry.registerComponent(appName, () => App);
