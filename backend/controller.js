const admin = require("./firebaseAdmin.js");
const { getMessaging } = require("firebase-admin/messaging"); // Import Firebase Admin SDK
const db = admin.firestore();
const client = require("./connection.js");
const axios = require('axios')
var cron = require('node-cron');
const {
  generateToken,
  generateWorkerToken,
} = require("./src/utils/generateToken.js");
const { response } = require("express");
const request = require('request');

// Telesign API credentials
const customerId = '1D0C4D6D-48D8-40A2-BD9D-CE2160F6B3E9';
const apiKey = 'BQXK2DGbESmYMvO0JC2sNAd9AtOTh48AwaPZIWL7bd8o8mB63TjwAJ/BhNxO3/YD6pjjZFQR5j6Ke1wEA1TCew==';
const smsEndpoint = `https://rest-api.telesign.com/v1/messaging`;

const getServiceByName = async (req, res) => {
  const { serviceName } = req.body;  // Get the service name from the request body

  if (!serviceName) {
      return res.status(400).json({ error: 'Service name is required' });
  }

  try {
      // First query: Get the row where service_name matches the input
      const serviceResult = await client.query(
          'SELECT * FROM services WHERE service_name = $1', [serviceName]
      );

      // Check if service exists
      if (serviceResult.rows.length === 0) {
          return res.status(404).json({ error: 'Service not found' });
      }

      const serviceData = serviceResult.rows[0];  // The matched service_name row
      const serviceTitle = serviceData.service_title
      // Second query: Get all rows where service_title matches the service_name
      const relatedServicesResult = await client.query(
          'SELECT * FROM services WHERE service_title = $1', [serviceTitle]
      );

      const relatedServicesData = relatedServicesResult.rows;  // All rows with matched service_title

      // Return both objects as a response
      res.status(200).json({
          service: serviceData,
          relatedServices: relatedServicesData
      });
  } catch (error) {
      console.error('Error fetching service:', error);
      res.status(500).json({ error: 'An error occurred while fetching the service' });
  }
};

const getUsers = async () => {
  try {
    const result = await client.query('SELECT * FROM "user"');
    return result.rows;
  } catch (err) {
    console.error("Error fetching users:", err);
    throw err;
  }
};


// Function to send notifications
const send = async () => {
  const fcmTokens = ['c3zgkqf3T56Vbi98fzUtPM:APA91bGvlYPwQjyHaQaWAFLa_KmMq-_BHGMJ_sqMtfo7yY5fKnLSo-rZ-2upB81yG_tlwWzt_xZ6EIwU9Qa6DKMcpJpb-I0fMkMfduak6TBEK9rbcv1_Dxz1i4PwA5_tnPWSKr0DxOvZ']; // Replace with a valid FCM token

  const message = {
    token: 'c3zgkqf3T56Vbi98fzUtPM:APA91bGvlYPwQjyHaQaWAFLa_KmMq-_BHGMJ_sqMtfo7yY5fKnLSo-rZ-2upB81yG_tlwWzt_xZ6EIwU9Qa6DKMcpJpb-I0fMkMfduak6TBEK9rbcv1_Dxz1i4PwA5_tnPWSKr0DxOvZ',  // Replace with a valid FCM token
    notification: {
      title: 'Simple Test',
      body: 'This is a basic test notification.',
    },
  };
  
  admin.messaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.error('Error sending message:', error);
    });
  
};

// send();


const sendEachForMulticast = async () => {
  const fcmTokens = [
    'epBJMpQHSFmyvcjQClHb7g:APA91bHlJy7_sPJl0xeZqdpiSalquTlRZQG1zSxGYGMmdNB7r5iDKa3QEjamnXJyqS7FLpWcbdN0ucQEdb5y_DwnYIJX9rOEOPjmYtjnxHYLhmEXUuu0llDCJrtug9Lr99FWj37-hrXB',
    // Add more tokens if needed
  ];

  // Create a multicast message object
  const multicastMessage = {
    tokens: fcmTokens, // An array of tokens to send the same message to
    notification: {
      title: "Click Solver",
      body: `You have a new job request from a user. Click to accept and help the user.`,
    },
    data: {
      // user_notification_id: encodedUserNotificationId.toString(),
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      // targetUrl: `/acceptance/${encodedUserNotificationId}`,
      route: 'Acceptance',
    },
  };

  try {
    // Use sendEachForMulticast to send the same message to multiple tokens
    const response = await getMessaging().sendEachForMulticast(multicastMessage);

    // Log the responses for each token
    response.responses.forEach((res, index) => {
      if (res.success) {
        console.log(`Message sent successfully to token ${fcmTokens[index]}`);
      } else {
        console.error(`Error sending message to token ${fcmTokens[index]}:`, res.error);
      }
    });

    console.log('Success Count:', response.successCount);
    console.log('Failure Count:', response.failureCount);

  } catch (error) {
    console.error('Error sending notifications:', error);
  }
};

// sendEachForMulticast();


const sendEach = async () => {
  const fcmTokens = [
    'c3zgkqf3T56Vbi98fzUtPM:APA91bGvlYPwQjyHaQaWAFLa_KmMq-_BHGMJ_sqMtfo7yY5fKnLSo-rZ-2upB81yG_tlwWzt_xZ6EIwU9Qa6DKMcpJpb-I0fMkMfduak6TBEK9rbcv1_Dxz1i4PwA5_tnPWSKr0DxOvZ',
    // Add more tokens if needed
  ];

  // Create individual messages for each token
  const messages = fcmTokens.map(token => ({
    token,
    notification: {
      title: "Click Solver",
      body: "You have a new job request from a user. Click to accept and help the user.",
    },
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      route: 'Acceptance',
    },
  }));

  // Ensure there are messages to send
  if (messages.length === 0) {
    console.error("No messages to send.");
    return;
  }

  try {
    // Use sendEach method to send each message individually
    const responses = await Promise.all(messages.map(async (message) => {
      try {
        const response = await getMessaging().send(message);
        return { success: true, response };
      } catch (error) {
        return { success: false, error };
      }
    }));

    responses.forEach((res, index) => {
      if (res.success) {
        console.log(`Message sent successfully to token ${fcmTokens[index]}`);
      } else {
        console.error(`Error sending message to token ${fcmTokens[index]}:`, res.error);
      }
    });

    const successCount = responses.filter(res => res.success).length;
    const failureCount = responses.length - successCount;

    console.log('Success Count:', successCount);
    console.log('Failure Count:', failureCount);

  } catch (error) {
    console.error('Error sending notifications:', error);
  }
};

// sendEach();

// Function to get all data from the 'locations' collection



const getAllLocations = async (workerIds) => {
  try {
    if(workerIds.length < 1){
      return []
    }
    const locationsRef = db.collection('locations');
    
    // Create a query to filter documents where workerId is in the workerIds array
    const query = locationsRef.where('worker_id', 'in', workerIds);

    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return [];
    }

    let locations = [];
    snapshot.forEach(doc => {
      locations.push({ id: doc.id, ...doc.data() });
    });
    console.log(locations)
    return locations;
  } catch (error) {
    console.error('Error getting locations:', error);
    return [];
  }
};

const getUserAndWorkerLocation = async (req, res) => {
  const { notification_id } = req.body;
  
  try {
    // Step 1: Get user longitude, latitude, and worker_id from notifications table
    const userLocationQuery = `
      SELECT longitude, latitude, worker_id 
      FROM notifications 
      WHERE notification_id = $1
    `;
    const userLocationResult = await client.query(userLocationQuery, [notification_id]);
    
    if (userLocationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const { longitude: userLongitude, latitude: userLatitude, worker_id } = userLocationResult.rows[0];
    
    console.log('User Location:', userLongitude, userLatitude, 'Worker ID:', worker_id);

    // Step 2: Query Firestore locations collection by worker_id
    const locationsRef = db.collection('locations');
    const workerLocationSnapshot = await locationsRef.where('worker_id', '==', worker_id).get();

    if (workerLocationSnapshot.empty) {
      return res.status(404).json({ message: 'Worker location not found in Firestore' });
    }

    // Assuming only one document is returned (matching worker_id)
    const workerLocationData = workerLocationSnapshot.docs[0].data();
    
    // Step 3: Retrieve GeoPoint field (Firestore stores latitude/longitude as a GeoPoint object)
    const workerLocationGeoPoint = workerLocationData.location;  // Assuming the field is 'location'
    if (!workerLocationGeoPoint || !workerLocationGeoPoint.latitude || !workerLocationGeoPoint.longitude) {
      throw new Error('GeoPoint data missing or incomplete');
    }
    
    const workerLongitude = workerLocationGeoPoint.longitude;
    const workerLatitude = workerLocationGeoPoint.latitude;
    
    console.log('Worker Location:', workerLongitude, workerLatitude);

    // Step 4: Return both user and worker locations as arrays (not strings)
    res.json({
      endPoint: [Number(userLongitude), Number(userLatitude)],  // Ensuring numeric values
      startPoint: [workerLongitude,workerLatitude]
    });
    
  } catch (error) {
    console.error('Error fetching locations:', error.message);
    res.status(500).json({ message: 'Error fetching locations', error: error.message });
  }
};




const getServices = async () => {
  try {
    const result = await client.query('SELECT * FROM "servicecategories"');
    return result.rows;
  } catch (err) {
    console.error("Error fetching servicecategories:", err);
    throw err;
  }
};

const getIndividualServices = async (req, res) => {
  // Extract serviceTitle from the body of the POST request
  const { serviceObject} = req.body;
  
  console.log(serviceObject);
  
  try {
    // Query to select rows from "services" table where "service_title" matches the provided value
    const result = await client.query(
      'SELECT * FROM "services" WHERE "service_title" = $1',
      [serviceObject]
    );
    
    // Return the rows that match the query
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).send("Internal Server Error");
  }
};



const getUserByIdParams = async (id) => {
  try {
    const result = await client.query(
      'SELECT * FROM "user" WHERE user_id = $1',
      [id]
    );
    return result.rows[0];
  } catch (err) {
    console.error(`Error fetching user with ID ${id}:`, err);
    throw err;
  }
};

const getUserBookings = async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `
    SELECT 
        u.user_notification_id,
        u.created_at,
        u.service,
        n.notification_id,
        s.payment,
        w.name AS provider,
        ws.profile AS worker_profile
    FROM usernotifications u
    JOIN notifications n ON u.user_notification_id = n.user_notification_id
    JOIN servicecall s ON n.notification_id = s.notification_id
    JOIN workers w ON s.worker_id = w.worker_id
    JOIN workerskills ws ON w.worker_id = ws.worker_id
    WHERE u.user_id = $1
    ORDER BY u.created_at DESC
`;

      const { rows } = await client.query(query, [userId]);

      res.status(200).json(rows);
  } catch (error) {
      console.error('Error fetching user bookings:', error);
      res.status(500).json({ error: 'An error occurred while fetching user bookings' });
  }
}; 

const getWorkerProfleDetails = async (req,res) => {
  const workerId = req.worker.id;
  try {
    const query = `
      SELECT 
        w.phone_number, w.name, w.created_at,
        ws.profile, ws.proof, ws.service, ws.subservices
      FROM workerskills ws
      JOIN workers w ON ws.worker_id = w.worker_id
      WHERE ws.worker_id = $1
`;

      const { rows } = await client.query(query, [workerId]);

      res.status(200).json(rows);
  } catch (error) {
      console.error('Error fetching worker profile:', error);
      res.status(500).json({ error: 'An error occurred while fetching worker profile' });
  }
  
}

const getWorkerReviewDetails = async (req,res) => {
  const workerId = req.worker.id;
  try {
    const query = `
    SELECT 
      f.rating, 
      f.comment, 
      f.created_at, 
      ws.profile, 
      ws.service,
      w.name,
      u.name AS username
    FROM 
      feedback f
    JOIN 
      workers w ON f.worker_id = w.worker_id
    JOIN 
      workerskills ws ON ws.worker_id = w.worker_id
    JOIN 
      "user" u ON u.user_id = f.user_id
    WHERE 
      f.worker_id = $1
    ORDER BY 
      f.created_at DESC;
  `;

      const { rows } = await client.query(query, [workerId]);

      res.status(200).json(rows);
  } catch (error) {
      console.error('Error fetching worker reviews:', error);
      res.status(500).json({ error: 'An error occurred while fetching worker reviews' });
  }
  
}

const getWorkerBookings = async (req, res) => {
  const workerId = req.worker.id;

  try {
    const query = `
    SELECT 
        n.notification_id,
        n.service,
        n.created_at,
        s.payment,
        w.name AS provider,
        ws.profile AS worker_profile
    FROM notifications n
    JOIN servicecall s ON n.notification_id = s.notification_id
    JOIN workers w ON s.worker_id = w.worker_id
    JOIN workerskills ws ON w.worker_id = ws.worker_id
    WHERE n.worker_id = $1
    ORDER BY n.notification_id DESC
`;

      const { rows } = await client.query(query, [workerId]);

      res.status(200).json(rows);
  } catch (error) {
      console.error('Error fetching user bookings:', error);
      res.status(500).json({ error: 'An error occurred while fetching user bookings' });
  }
}; 

const updateOrInsertWorkerScreen = async (req, res) => {
  const workerId = req.worker.id;
  const {screenName, params } = req.body;
  try {
    // Check if the worker_id already exists
    const existingWorker = await client.query(
        'SELECT worker_id FROM workerscreens WHERE worker_id = $1',
        [workerId]
    );

    if (existingWorker.rows.length > 0) {
        // If worker_id exists, update the screenName and params
        const updateQuery = `
            UPDATE workerscreens 
            SET screen_name = $1, params = $2 
            WHERE worker_id = $3
        `;
        await client.query(updateQuery, [screenName, params, workerId]);
        res.status(200).json({ message: 'Screen details updated successfully' });
    } else {
        // If worker_id does not exist, insert a new record
        const insertQuery = `
            INSERT INTO workerscreens (worker_id, screen_name, params) 
            VALUES ($1, $2, $3)
        `;
        await client.query(insertQuery, [workerId, screenName, params]);
        res.status(201).json({ message: 'Screen details inserted successfully' });
    }
} catch (error) {
    console.error("updateOrInsertWorkerScreen error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const workerAuthentication = async (req, res) => {
  const workerId = req.worker.id;
  try {
    if (workerId) {
      return res.status(200).json({ success: true });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Worker not authenticated" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getUserById = async (req, res) => {
  const id = req.user.id;
  try {
    const result = await client.query(
      'SELECT * FROM "user" WHERE user_id = $1',
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error fetching user with ID ${id}:`, err);
    throw err;
  }
};

// const getWorkerNotifications = async (req, res) => {
//   const workerId = req.worker.id;
//   const {fcmToken} = req.query
//   console.log(workerId)
//   try {
//     const tenMinutesAgo = `DATE_TRUNC('minute', NOW()) - INTERVAL '10 minutes'`;
//     const result = await client.query(`
//       SELECT title, body, encodedId, data, receivedat
//       FROM workernotifications
//       WHERE worker_id = $1 AND fcm_token = $2 AND receivedat > ${tenMinutesAgo}
//       ORDER BY receivedat DESC
//       LIMIT 10;
//     `, [workerId, fcmToken]);

//     const notifications = result.rows;
//     res.json(notifications);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error fetching notifications' });
//   }
// };

const getWorkerNotifications = async (req, res) => {
  const workerId = req.worker.id;
  const fcmToken = req.query.fcmToken; // Access fcmToken from query parameters
  
  try {
    const result = await client.query(`
      SELECT title, body, encodedId, data, receivedat
      FROM workernotifications
      WHERE worker_id = $1 AND fcm_token = $2
      ORDER BY receivedat DESC
      LIMIT 10;
    `, [workerId, fcmToken]); // Pass fcmToken as the second parameter

    const notifications = result.rows;
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

const getUserNotifications = async (req, res) => {
  const userId = req.user.id;
  const fcmToken = req.query.fcmToken; // Access fcmToken from query parameters
  
  try {
    const result = await client.query(`
      SELECT title, body, encodedId, data, receivedat
      FROM userrecievednotifications
      WHERE user_id = $1 AND fcm_token = $2
      ORDER BY receivedat DESC
      LIMIT 10;
    `, [userId, fcmToken]); // Pass fcmToken as the second parameter

    const notifications = result.rows;
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

const storeUserNotification = async (req, res) => {
  const userId = req.user.id;
  const {fcmToken,notification}= req.body;
  const { title, body, data, receivedAt, userNotificationId } = notification;
  try {
    const result = await client.query(
      'INSERT INTO userrecievednotifications (title, body, data, receivedat, user_id, encodedid, fcm_token) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, body, JSON.stringify(data), receivedAt, userId, userNotificationId, fcmToken]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error storing notification:', err);
    res.status(500).send('Error storing notification');
  }
};


const storeNotification = async (req, res) => {
  const workerId = req.worker.id;
  const {fcmToken,notification}= req.body;
  const { title, body, data, receivedAt, userNotificationId } = notification;
  const {cost} =data
  try {
    const result = await client.query(
      'INSERT INTO workernotifications (title, body, data, receivedat, worker_id, encodedid, fcm_token) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, body, cost, receivedAt, workerId, userNotificationId, fcmToken]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error storing notification:', err);
    res.status(500).send('Error storing notification');
  }
};

const createWorkerAction = async (req, res) => {
  const workerId = req.worker.id; // Assuming req.user contains the authenticated user's information
  const { encodedId, screen } = req.body;

  try {
    // Create the params object and convert it to JSON string
    const params = JSON.stringify({ encodedId });

    // Define the SQL query
    const query = `
      INSERT INTO workeraction (worker_id, screen_name, params)
      VALUES ($1, $2, $3)
      ON CONFLICT (worker_id) DO UPDATE
      SET params = $3, screen_name = $2
      RETURNING *;
    `;

    // Execute the query with the provided parameters
    const result = await client.query(query, [workerId, screen, params]);
    
    // The result should contain the updated or inserted row
    const userAction = result.rows[0];

    // Respond with the user action data
    res.json(userAction);
  } catch (error) {
    console.error('Error inserting user action:', error);
    res.status(500).json({ message: 'Error inserting user action' });
  }
};

// const createUserAction = async (req, res) => {
//   const userId = req.user.id; // Assuming req.user contains the authenticated user's information
//   const { encodedId, screen } = req.body;

//   try {
//     // Create the params object and convert it to JSON string
//     const params = JSON.stringify({ encodedId });

//     // Define the SQL query
//     const query = `
//       INSERT INTO useraction (user_id, screen_name, params)
//       VALUES ($1, $2, $3)
//       ON CONFLICT (user_id) DO UPDATE
//       SET params = $3, screen_name = $2
//       RETURNING *;
//     `;

//     // Execute the query with the provided parameters
//     const result = await client.query(query, [userId, screen, params]);
    
//     // The result should contain the updated or inserted row
//     const userAction = result.rows[0];

//     // Respond with the user action data
//     res.json(userAction);
//   } catch (error) {
//     console.error('Error inserting user action:', error);
//     res.status(500).json({ message: 'Error inserting user action' });
//   }
// };



// const createUserAction = async (req, res) => {
//   const userId = req.user.id; // Assuming req.user contains the authenticated user's information
//   const { encodedId, screen,serviceBooked,area,city,alternateName,alternatePhoneNumber,pincode } = req.body;
//   console.log("user created degare")
//   try {
//     // Define the SQL query to get the existing user action
//     const query = `
//       SELECT * FROM useraction
//       WHERE user_id = $1;
//     `;

//     // Execute the query to get the existing user action
//     const result = await client.query(query, [userId]);
//     const existingUserAction = result.rows[0];

//     if (existingUserAction) {
//       // If the user action exists, update the track array
//       let updatedTrack = existingUserAction.track;

//       if (screen === "") {
//         // Remove the object with the matching encodedId if screen is empty
//         updatedTrack = updatedTrack.filter(item => item.encodedId !== encodedId);
//       } else {
//         // Update or add the object with the new screen and encodedId
//         updatedTrack = updatedTrack.filter(item => item.encodedId !== encodedId);
//         updatedTrack.push({ screen, encodedId,serviceBooked });
//       }

//       // Update the user action with the new track array
//       const updateQuery = `
//         UPDATE useraction
//         SET track = $1
//         WHERE user_id = $2
//         RETURNING *;
//       `;
//       const updateResult = await client.query(updateQuery, [JSON.stringify(updatedTrack), userId]);
//       const updatedTrackScreen = updateResult.rows[0];

//       // Respond with the updated user action data
//       res.json(updatedTrackScreen);
//     } else {
//       // If the user action does not exist, create a new one
//       let newTrack = [];
//       if (screen) {
//         newTrack = [{ screen, encodedId }];
//       }

//       const insertQuery = `
//         INSERT INTO useraction (user_id, track)
//         VALUES ($1, $2)
//         RETURNING *;
//       `;
//       const insertResult = await client.query(insertQuery, [userId, JSON.stringify(newTrack)]);
//       const updatedTrackScreen = insertResult.rows[0];

//       // Respond with the new user action data
//       res.json(updatedTrackScreen);
//     }
//   } catch (error) {
//     console.error('Error inserting user action:', error);
//     res.status(500).json({ message: 'Error inserting user action' });
//   }
// };


const createUserAction = async (req, res) => {
  const userId = req.user.id; // Assuming req.user contains the authenticated user's information
  const {
    encodedId,
    screen,
    serviceBooked,
    area,
    city,
    alternateName,
    alternatePhoneNumber,
    pincode
  } = req.body;

  console.log("User action creation initiated");

  try {
    // Define the SQL query to get the existing user action
    const query = `
      SELECT * FROM useraction
      WHERE user_id = $1;
    `;

    // Execute the query to get the existing user action
    const result = await client.query(query, [userId]);
    const existingUserAction = result.rows[0];

    // Determine whether the additional fields are present
    const hasAdditionalFields = area || city || alternateName || alternatePhoneNumber || pincode;

    if (existingUserAction) {
      // If the user action exists, update the track array
      let updatedTrack = existingUserAction.track;

      if (screen === "") {
        // Remove the object with the matching encodedId if screen is empty
        updatedTrack = updatedTrack.filter(item => item.encodedId !== encodedId);
      } else {
        // Update or add the object with the new screen, encodedId, and additional fields
        updatedTrack = updatedTrack.filter(item => item.encodedId !== encodedId);
        
        const newAction = {
          screen,
          encodedId,
          serviceBooked
        };

        // If additional fields are present, include them in the update
        if (hasAdditionalFields) {
          newAction.area = area;
          newAction.city = city;
          newAction.alternateName = alternateName;
          newAction.alternatePhoneNumber = alternatePhoneNumber;
          newAction.pincode = pincode;
        }

        updatedTrack.push(newAction);
      }

      // Update the user action with the new track array
      const updateQuery = `
        UPDATE useraction
        SET track = $1
        WHERE user_id = $2
        RETURNING *;
      `;
      const updateResult = await client.query(updateQuery, [JSON.stringify(updatedTrack), userId]);
      const updatedTrackScreen = updateResult.rows[0];

      // Respond with the updated user action data
      res.json(updatedTrackScreen);
    } else {
      // If the user action does not exist, create a new one
      let newTrack = [];
      
      if (screen) {
        const newAction = {
          screen,
          encodedId,
          serviceBooked
        };

        // Include additional fields if they are present
        if (hasAdditionalFields) {
          newAction.area = area;
          newAction.city = city;
          newAction.alternateName = alternateName;
          newAction.alternatePhoneNumber = alternatePhoneNumber;
          newAction.pincode = pincode;
        }

        newTrack = [newAction];
      }

      const insertQuery = `
        INSERT INTO useraction (user_id, track)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const insertResult = await client.query(insertQuery, [userId, JSON.stringify(newTrack)]);
      const updatedTrackScreen = insertResult.rows[0];

      // Respond with the new user action data
      res.json(updatedTrackScreen);
    }
  } catch (error) {
    console.error('Error inserting or updating user action:', error);
    res.status(500).json({ message: 'Error inserting or updating user action' });
  }
};

const userActionRemove = async (req, res) => {
  const userId = req.user.id; // Assuming req.user contains the authenticated user's information
  const { screen, encodedId } = req.body;

  console.log("Removing user action");

  try {
    // Query to get the existing user action for the current user
    const query = `
      SELECT * FROM useraction
      WHERE user_id = $1;
    `;

    // Execute the query to get the current user action
    const result = await client.query(query, [userId]);
    const existingUserAction = result.rows[0];

    if (!existingUserAction) {
      return res.status(404).json({ message: 'User action not found' });
    }

    // Filter out the object with the matching encodedId from the track array
    let updatedTrack = existingUserAction.track.filter(item => item.encodedId !== encodedId);

    if (updatedTrack.length === existingUserAction.track.length) {
      return res.status(404).json({ message: 'No matching encodedId found' });
    }

    // Update the user action with the filtered track array
    const updateQuery = `
      UPDATE useraction
      SET track = $1
      WHERE user_id = $2
      RETURNING *;
    `;
    const updateResult = await client.query(updateQuery, [JSON.stringify(updatedTrack), userId]);
    const updatedTrackScreen = updateResult.rows[0];

    // Respond with the updated user action data
    res.json(updatedTrackScreen);
  } catch (error) {
    console.error('Error removing user action:', error);
    res.status(500).json({ message: 'Error removing user action' });
  }
};



// Helper function to parse track items
function parseTrackItem(item) {
  const [screenPart, encodedIdPart] = item.split(',');
  const screen = screenPart.split(':')[1].replace(/"/g, '');
  const encodedId = encodedIdPart.split(':')[1].replace(/"/g, '');
  return { screen, encodedId };
}







const getWorkerTrackRoute = async (req, res) => {
  const id = req.worker.id;
  try {
    // Query to select route and parameters based on user_id
    const query = `
        SELECT screen_name, params
        FROM workeraction 
        WHERE worker_id = $1
    `;
    const result = await client.query(query, [id]);

    if (result.rows.length > 0) {
      const route = result.rows[0].screen_name
      const parameter = result.rows[0].params
        res.status(200).json({route,parameter});
    } else {
        res.status(200).json({ error: 'No action found for the specified worker_id' });
    }
  } catch (err) {
    console.error(`Error fetching user with ID ${id}:`, err);
    throw err;
  }
};



// const getUserTrackRoute = async (req, res) => {
//   const id = req.user.id;
//   try {
//     // Query to select route and parameters based on user_id
//     const query = `
//         SELECT screen_name, params
//         FROM useraction 
//         WHERE user_id = $1
//     `;
//     const result = await client.query(query, [id]);
//     const route = result.rows[0].screen_name
//     const parameter = result.rows[0].params
//     if (result.rows.length > 0) {
//         res.status(200).json({route,parameter});
//     } else {
//         res.status(404).json({ error: 'No action found for the specified user_id' });
//     }
//   } catch (err) {
//     console.error(`Error fetching user with ID ${id}:`, err);
//     throw err;
//   }
// };

const getUserTrackRoute = async (req, res) => {
  const id = req.user.id;
  console.log(id)
  try {
    // Query to select track column based on user_id
    const userName = `
    SELECT name
    FROM "user" 
    WHERE user_id = $1
`;
const name = await client.query(userName, [id]);
const user = name.rows[0].name
    const query = `
        SELECT track
        FROM useraction 
        WHERE user_id = $1
    `;
    const result = await client.query(query, [id]);
    if (result.rows.length > 0) {
        const track = result.rows[0].track;
        
        res.status(200).json({ track,user });
    } else {
        res.status(203).json(user);
    }
  } catch (err) {
    console.error(`Error fetching user with ID ${id}:`, err);
    throw err;
  }
};

const getUserCurrentRoute = async (req, res) => {
  const id = req.user.id;
  try {
    // Query to select route and parameters based on user_id
    const query = `
        SELECT route, parameter
        FROM userrouting 
        WHERE user_id = $1
    `;
    const result = await client.query(query, [id]);

    if (result.rows.length > 0) {
      const route = result.rows[0].route
      const parameter = result.rows[0].parameter
        res.status(200).json({route,parameter});
    } else {
        res.status(404).json({ error: 'No route found for the specified user_id' });
    }
  } catch (err) {
    console.error(`Error fetching user with ID ${id}:`, err);
    throw err;
  }
};

const loginStatus = async (req, res) => {
  const id = req.user.id;
  try {
    const result = await client.query(
      'SELECT * FROM "user" WHERE user_id = $1',
      [id]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (err) {
    console.error(`Error fetching user with ID ${id}:`, err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const getUserByPhoneNumber = async (phone_number) => {
  try {
    const query = 'SELECT * FROM "user" WHERE phone_number = $1';
    const result = await client.query(query, [phone_number]);

    return result.rows.length ? result.rows[0] : null;
  } catch (error) {
    console.error("Error fetching user by phone number:", error);
    throw new Error('Database query failed');
  }
};

const getWorkerByPhoneNumber = async (phone_number) => {
  try {
    const result = await client.query(
      'SELECT * FROM "workers" WHERE phone_number = $1',
      [phone_number]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error fetching user by phone number:", error);
    throw error;
  }
};

const login = async (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    // Find user by phone number
    const user = await getUserByPhoneNumber(phone_number);

    if (user) {
      // Generate a token for the user
      const token = generateToken(user);

      // Set the token as an HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      // Send the token in the response
      return res.json({ token });
    } else {
      // Return unauthorized if user not found
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllServices = async () => {
  try {
    const result = await client.query("SELECT * FROM services");
    return result.rows;
  } catch (error) {
    console.error("Error fetching all services:", error);
    throw error;
  }
};

const getServicesBySearch = async (req, res) => {
  const searchQuery = req.query.search ? req.query.search.toLowerCase().trim() : "";

  try {
    const allServices = await getAllServices();

    // Split search query into individual words (e.g., "ac machine" -> ["ac", "machine"])
    const searchKeywords = searchQuery.split(" ").filter(Boolean);

    // 1. First attempt: Exact or partial match for the full search query
    let filteredServices = allServices.filter(
      (service) =>
        service.service_name.toLowerCase().includes(searchQuery) ||
        service.service_title.toLowerCase().includes(searchQuery) ||
        service.service_urls.toLowerCase().includes(searchQuery)
    );

    // 2. Second attempt: Match any of the individual keywords
    if (filteredServices.length === 0 && searchKeywords.length > 0) {
      filteredServices = allServices.filter((service) =>
        searchKeywords.some((keyword) =>
          service.service_name.toLowerCase().includes(keyword) ||
          service.service_title.toLowerCase().includes(keyword) ||
          service.service_urls.toLowerCase().includes(keyword)
        )
      );
    }

    // Return filtered results (empty or matched)
    res.json(filteredServices);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
 


// Function to log in partner (worker)
const Partnerlogin = async (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    // Query the database to find the worker by phone number
    const worker = await getWorkerByPhoneNumber(phone_number);

    if (worker) {
      // Generate token for the worker
      const token = generateWorkerToken(worker);

      // Set token in cookie with secure options
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      // Return token in response
      return res.json({ token });
    }

    // If worker is not found
    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.error("Error logging in worker:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



// Controller function to handle storing user location
const storeWorkerLocation = async (req, res) => {
  const { longitude, latitude, workerId } = req.body;

  try {
    const query = `
      INSERT INTO workerLocation (longitude, latitude, worker_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (worker_id)
      DO UPDATE SET longitude = EXCLUDED.longitude, latitude = EXCLUDED.latitude
    `;
    await client.query(query, [longitude, latitude, workerId]);

    res.status(200).json({ message: "User location stored successfully" });
  } catch (error) {
    console.error("Error storing user location:", error);
    res.status(500).json({ error: "Failed to store user location" });
  }
};

const updateWorkerLocation = async (req, res) => {
  const workerId = req.worker.id;
  const { longitude, latitude } = req.body;

  try {
    const query = `
      INSERT INTO workerLocation (longitude, latitude, worker_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (worker_id)
      DO UPDATE SET longitude = EXCLUDED.longitude, latitude = EXCLUDED.latitude
    `;
    await client.query(query, [longitude, latitude, workerId]);

    res.status(200).json({ message: "User location stored successfully" });
  } catch (error) {
    console.error("Error storing user location:", error);
    res.status(500).json({ error: "Failed to store user location" });
  }
};

const UserController = async (req, res) => {
  const { screenName, params } = req.body;
  const userId = req.user.id;
  console.log(params)

  try {
    const query = `
      INSERT INTO userrouting (route, parameter, user_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id)
      DO UPDATE SET route = EXCLUDED.route, parameter = EXCLUDED.parameter
    `;
    await client.query(query, [screenName, params, userId]);
    res.status(200).json({ message: "UserController stored successfully" });
  } catch (error) {
    console.error("Error storing UserController:", error);
    res.status(500).json({ error: "Failed to store UserController" });
  }
};

const storeUserFcmToken = async (req, res) => {
  const { fcmToken } = req.body;
  const UserId = req.user.id;
  try {
    // Check if the FCM token already exists for the given worker
    const checkQuery = `
      SELECT COUNT(*)
      FROM userfcm
      WHERE user_id = $1 AND fcm_token = $2
    `;
    const { rows } = await client.query(checkQuery, [UserId, fcmToken]);

    // If the token does not exist, insert the new token
    if (parseInt(rows[0].count, 10) === 0) {
      const insertQuery = `
        INSERT INTO userfcm (user_id, fcm_token)
        VALUES ($1, $2)
      `;
      await client.query(insertQuery, [UserId, fcmToken]);
      res.status(200).json({ message: "FCM token stored successfully" });
    } else {
      console.log("FCM token already exists for this user")
      res.status(200).json({ message: "FCM token already exists for this user" });
    }
  } catch (error) {
    console.error("Error storing FCM token:", error);
    res.status(500).json({ error: "Failed to store FCM token" });
  }
};

const storeFcmToken = async (req, res) => {
  const { fcmToken } = req.body;
  const workerId = req.worker.id;
  
  try {
    // Check if the FCM token already exists for the given worker
    console.log(fcmToken)
    const checkQuery = `
      SELECT COUNT(*)
      FROM fcm
      WHERE worker_id = $1 AND fcm_token = $2
    `;
    const { rows } = await client.query(checkQuery, [workerId, fcmToken]);

    // If the token does not exist, insert the new token
    if (parseInt(rows[0].count, 10) === 0) {
      const insertQuery = `
        INSERT INTO fcm (worker_id, fcm_token)
        VALUES ($1, $2)
      `;
      await client.query(insertQuery, [workerId, fcmToken]);
      res.status(200).json({ message: "FCM token stored successfully" });
    } else {
      console.log("FCM token already exists for this worker")
      res.status(200).json({ message: "FCM token already exists for this worker" });
    }
  } catch (error) {
    console.error("Error storing FCM token:", error);
    res.status(500).json({ error: "Failed to store FCM token" });
  }
};


// Function to get current date and time formatted as TIMESTAMP WITHOUT TIME ZONE
const getCurrentTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

async function generateCustomToken(userStringId) {
  try {
    const customToken = await admin.auth().createCustomToken(userStringId);

    return customToken;
  } catch (error) {
    console.error("Error creating custom token:", error);
    throw error;
  }
}

const storeFireBaseCloudToken = async (req, res) => {
  const userId = req.user.id;
  const userStringId = req.user.id.toString(); // Convert userId to string
  const createdAt = getCurrentTimestamp();

  try {
    const fcmToken = await generateCustomToken(userStringId); // Generate the custom token

    const query = `
      INSERT INTO useraccountdevices (fcm_token, user_id, created_at)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const values = [fcmToken, req.user.id, createdAt]; // Use the original integer userId for database

    const result = await client.query(query, values);

    res.status(200).json({
      message: "FCM token stored successfully",
      data: result.rows[0],
      token: fcmToken, // Include the token in the response
    });
  } catch (error) {
    console.error("Error storing FCM token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const intervalSetForNotifications = new Set();

// Fetch location details for navigation
const getLocationDetails = async (req, res) => {
  try {
    const { notification_id } = req.query;

    if (!notification_id) {
      return res.status(400).json({ error: "Missing notification_id" });
    }

    const locationDetails = await fetchLocationDetails(notification_id);
    res.json(locationDetails);

    // Start the interval to update the navigation status to timeup after 4 minutes
    if (notification_id && !intervalSetForNotifications.has(notification_id)) {
      intervalSetForNotifications.add(notification_id);
      setTimeout(() => updateNavigationStatus(notification_id), 4 * 60 * 1000);
    }
  } catch (err) {
    console.error("Error fetching location details:", err);
    res.status(500).json({ error: "Server error" });
  }
};



// Function to fetch location details from the database
const fetchLocationDetails = async (notificationId) => {
  try {
    // Query to get the endpoint details from notifications table
    const notificationQuery = `
      SELECT worker_id, longitude AS end_longitude, latitude AS end_latitude
      FROM notifications
      WHERE notification_id = $1
    `;
    const notificationResult = await client.query(notificationQuery, [
      notificationId,
    ]);

    if (notificationResult.rows.length === 0) {
      throw new Error("Notification not found");
    }

    const { worker_id, end_longitude, end_latitude } =
      notificationResult.rows[0];

    // Query to get the startpoint details from workerlocation table
    const workerLocationQuery = `
      SELECT longitude AS start_longitude, latitude AS start_latitude
      FROM workerlocation
      WHERE worker_id = $1
    `;
    const workerLocationResult = await client.query(workerLocationQuery, [
      worker_id,
    ]);

    if (workerLocationResult.rows.length === 0) {
      throw new Error("Worker location not found");
    }

    const { start_longitude, start_latitude } = workerLocationResult.rows[0];
   const det = {
    startPoint: [start_latitude, start_longitude],
    endPoint: [end_latitude, end_longitude],
  };

    // Return the start and end points
    return {
      startPoint: [start_latitude, start_longitude],
      endPoint: [end_latitude, end_longitude],
    };
  } catch (err) {
    console.error("Error fetching location details:", err);
    throw err;
  }
};

// Check cancellation status
const checkCancellationStatus = async (req, res) => {
  try {
    const { notification_id } = req.query;
    const result = await client.query(
      "SELECT navigation_status FROM notifications WHERE notification_id = $1",
      [notification_id]
    );
    if (result.rows.length > 0) {
      const { navigation_status } = result.rows[0];
      res.json({ navigation_status });
    } else {
      res.status(404).json({ error: "Notification not found" });
    }
  } catch (error) {
    console.error("Error checking cancellation status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const TimeStart = async (notification_id) => {
//   try {
//     // Query the database to get worker_id from notifications table
//     const workerResult = await client.query(
//       "SELECT worker_id FROM notifications WHERE notification_id = $1",
//       [notification_id]
//     );

//     if (workerResult.rows.length === 0) {
//       throw new Error("No worker found for the given notification ID");
//     }

//     const workerId = workerResult.rows[0].worker_id;
//     const result = await client.query(
//       "INSERT INTO ServiceCall (notification_id, start_time, worker_id) VALUES ($1, $2, $3)",
//       [notification_id, new Date(), workerId]
//     );

//     if (result.rowCount > 0) {
//       return new Date();
//     } else {
//       return "Insertion failed";
//     }
//   } catch (error) {
//     console.error("Error in TimeStart:", error);
//     return "Error occurred";
//   }
// };


// Function to update user_navigation_cancel_status to 'timeup' after 2 minutes

const TimeStart = async (notification_id) => {
  try {
    // Query to insert into ServiceCall and get the worker_id in one step
    const result = await client.query(`
      INSERT INTO ServiceCall (notification_id, start_time, worker_id)
      SELECT $1, $2, worker_id
      FROM notifications
      WHERE notification_id = $1
      RETURNING start_time
    `, [notification_id, new Date()]);

    if (result.rows.length > 0) {
      return result.rows[0].start_time;
    } else {
      return "Insertion failed";
    }
  } catch (error) {
    console.error("Error in TimeStart:", error);
    return "Error occurred";
  }
};



const updateUserNavigationStatus = async (notification_id) => {
  try {
    await client.query(
      `UPDATE notifications SET user_navigation_cancel_status = 'timeup' WHERE notification_id = $1`,
      [notification_id]
    );
  } catch (error) {
    console.error("Error updating user navigation status to timeup:", error);
  }
};

// Update navigation status to timeup after 4 minutes
const updateNavigationStatus = async (notification_id) => {
  try {
    const result = await client.query(
      "UPDATE notifications SET navigation_status = 'timeup' WHERE notification_id = $1",
      [notification_id]
    );
  } catch (error) {
    console.error("Error updating navigation status to timeup:", error);
    throw error; // Throw the error to handle it in calling functions
  }
};

async function sendNotification(token, payload) {
  const message = {
    token: token,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      targetUrl: "/acceptance", 
      ...payload.data,
    },
  };

  try {
    const response = await getMessaging().sendAll(message);
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

const addUser = async (user) => {
  const { name, phone_number } = user;
  const created_at = getCurrentTimestamp();
  try {
    const result = await client.query(
      'INSERT INTO "user" ( name, phone_number, created_at) VALUES ( $1, $2, $3) RETURNING *',
      [name, phone_number, created_at]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error adding user:", err);
    throw err;
  }
};

// Define the controller function to check cancellation status
const userCancellationStatus = async (req, res) => {
  const { notification_id } = req.query;

  if (!notification_id) {
    return res.status(400).json({ error: "Notification ID is required" });
  }

  try {
    // Query the notifications table for the notification_status
    const result = await client.query(
      "SELECT user_navigation_cancel_status FROM notifications WHERE notification_id = $1",
      [notification_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const notificationStatus = result.rows[0].user_navigation_cancel_status;

    // Send the notification status in the response
    res.json({ notificationStatus });
  } catch (error) {
    console.error("Error checking cancellation status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller function to get the cancellation status
const workerCancellationStatus = async (req, res) => {
  const { notification_id } = req.query;

  if (!notification_id) {
    return res.status(400).json({ error: "notification_id is required" });
  }

  try {
    const result = await client.query(
      "SELECT navigation_status FROM notifications WHERE notification_id = $1",
      [notification_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const notificationStatus = result.rows[0].navigation_status;
    res.json(notificationStatus);
  } catch (error) {
    console.error("Error fetching cancellation status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller function to get user address details
const getUserAddressDetails = async (req, res) => {
  const { notification_id } = req.query;

  try {
    // Query to fetch user address details by joining Notifications and UserNotifications tables
    const query = `
      SELECT 
        UN.city, 
        UN.area, 
        UN.pincode, 
        UN.alternate_phone_number, 
        UN.alternate_name
      FROM 
        Notifications N
      JOIN 
        UserNotifications UN ON N.user_notification_id = UN.user_notification_id
      WHERE 
        N.notification_id = $1
    `;

    // Execute the JOIN query
    const result = await client.query(query, [notification_id]);

    // Check if data was found
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification or user address details not found" });
    }

    // Destructure and return the address details
    const { city, area, pincode, alternate_phone_number, alternate_name } = result.rows[0];
    console.log(result.rows[0])

    res.json({
      city,
      area,
      pincode,
      alternate_phone_number,
      alternate_name,
    });
  } catch (error) {
    console.error("Error fetching user address details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const rejectRequest = async (req, res) => {
  const { user_notification_id } = req.body;
  const worker_id = req.worker.id;

  try {
    const result = await client.query(
      "UPDATE notifications SET status = $1 WHERE user_notification_id = $2 AND worker_id = $3 RETURNING *",
      ["reject", user_notification_id, worker_id]
    );

    if (result.rowCount === 0) {
      res
        .status(404)
        .json({ message: "Notification not found or worker mismatch" });
    } else {
      res.status(200).json({
        message: "Status updated to reject",
        notification: result.rows[0],
      });
    }
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const acceptRequest = async (req, res) => {
//   const { user_notification_id } = req.body;
//   const worker_id = req.worker.id;

//   try {
//     // Check if any rows with the same user_notification_id have the status 'accept'
//     const checkResult = await client.query(
//       "SELECT * FROM notifications WHERE user_notification_id = $1 AND status = $2",
//       [user_notification_id, "accept"]
//     );
//     console.log(checkResult.rowCount)
//     if (checkResult.rowCount > 0) {
//       res.status(400).json({ message: "Someone already accepted" });
//     } else {
//       // Check the cancel_status
//       const cancelStatusResult = await client.query(
//         "SELECT cancel_status FROM notifications WHERE user_notification_id = $1",
//         [user_notification_id]
//       );

//       if (
//         cancelStatusResult.rows.length > 0 &&
//         cancelStatusResult.rows[0].cancel_status === "cancel"
//       ) {
//         res
//           .status(400)
//           .json({ message: "Cannot accept request, it has been canceled" });
//       } else {
//         // Update the status to 'accept' if no such rows are found
//         const updateResult = await client.query(
//           "UPDATE notifications SET status = $1 WHERE user_notification_id = $2 AND worker_id = $3 RETURNING *",
//           ["accept", user_notification_id, worker_id]
//         );

//         if (updateResult.rowCount === 0) {
//           res
//             .status(404)
//             .json({ message: "Notification not found or worker mismatch" });
//         } else {
//           res.status(200).json({
//             message: "Status updated to accept",
//             notificationId: updateResult.rows[0].notification_id,
//           });
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Error updating status:", error);
//     res.status(500).json({ message: "Internal server error" });
//   } 
// };

// const acceptRequest = async (req, res) => {
//   const { user_notification_id } = req.body;
//   const worker_id = req.worker.id;

//   try {
//     // Check if any rows with the same user_notification_id have the status 'accept'
//     const checkResult = await client.query(
//       "SELECT * FROM notifications WHERE user_notification_id = $1 AND status = $2",
//       [user_notification_id, "accept"]
//     );
//     console.log(checkResult.rowCount)
//     if (checkResult.rowCount > 0) {
//       res.status(400).json({ message: "Someone already accepted" });
//     } else {
//       // Check the cancel_status
//       const cancelStatusResult = await client.query(
//         "SELECT cancel_status FROM notifications WHERE user_notification_id = $1",
//         [user_notification_id]
//       );

//       if (
//         cancelStatusResult.rows.length > 0 &&
//         cancelStatusResult.rows[0].cancel_status === "cancel"
//       ) {
//         res
//           .status(400)
//           .json({ message: "Cannot accept request, it has been canceled" });
//       } else {
//         // Update the status to 'accept' if no such rows are found
//         const updateResult = await client.query(
//           "UPDATE notifications SET status = $1 WHERE user_notification_id = $2 AND worker_id = $3 RETURNING *",
//           ["accept", user_notification_id, worker_id]
//         );

//         if (updateResult.rowCount === 0) {
//           res
//             .status(404)
//             .json({ message: "Notification not found or worker mismatch" });
//         } else {
//           res.status(200).json({
//             message: "Status updated to accept",
//             notificationId: updateResult.rows[0].notification_id,
//           });
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Error updating status:", error);
//     res.status(500).json({ message: "Internal server error" });
//   } 
// };
const createUserBackgroundAction = async (userId,encodedId,screen,serviceBooked) => {

  console.log(serviceBooked)
  try {
    // Define the SQL query to get the existing user action
    const query = `
      SELECT * FROM useraction
      WHERE user_id = $1;
    `;

    // Execute the query to get the existing user action
    const result = await client.query(query, [userId]);
    const existingUserAction = result.rows[0];

    if (existingUserAction) {
      // If the user action exists, update the track array
      let updatedTrack = existingUserAction.track;

      if (screen === "") {
        // Remove the object with the matching encodedId if screen is empty
        updatedTrack = updatedTrack.filter(item => item.encodedId !== encodedId);
      } else {
        serviceAlreadtBooked = updatedTrack.some((item) => item.serviceBooked === serviceBooked)
        if(serviceBooked){
          return false
        }else{
        // Update or add the object with the new screen and encodedId
        updatedTrack = updatedTrack.filter(item => item.encodedId !== encodedId);
        updatedTrack.push({ screen, encodedId,serviceBooked });
        }
      }

      // Update the user action with the new track array
      const updateQuery = `
        UPDATE useraction
        SET track = $1
        WHERE user_id = $2
        RETURNING *;
      `;
      const updateResult = await client.query(updateQuery, [JSON.stringify(updatedTrack), userId]);
      const updatedTrackScreen = updateResult.rows[0];

      // Respond with the updated user action data
      return true
     
    } else {
      // If the user action does not exist, create a new one
      let newTrack = [];
      if (screen) {
        newTrack = [{ screen, encodedId }];
      }

      const insertQuery = `
        INSERT INTO useraction (user_id, track)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const insertResult = await client.query(insertQuery, [userId, JSON.stringify(newTrack)]);
      const updatedTrackScreen = insertResult.rows[0];

      // Respond with the new user action data
      return true
    }
  } catch (error) {
    console.error('Error inserting user action:', error);
    
  }
};

const workCompletionCancel = async(req,res) =>{
  const { notification_id } = req.body;
  try{
    if(notification_id){
      const updateResult = await client.query(
        "UPDATE notifications SET complete_status = $1 WHERE notification_id = $2 RETURNING *",
        ["cancel", notification_id]
      );
    if(updateResult.rowCount>0){
      res.status(200).json({
        message: "Status updated to accept",
      });
    }
    }else{
      res.status(400).json({ message: "notification_id not there" });
    }
  }catch(error){

  }
}

const acceptRequest = async (req, res) => {
  const { user_notification_id } = req.body;
  
  console.log("user ka notification hey",user_notification_id)
  const worker_id = req.worker.id;

  try { 
    // Check if any rows with the same user_notification_id have the status 'accept'
    const checkResult = await client.query(
      "SELECT * FROM notifications WHERE user_notification_id = $1 AND status = $2",
      [user_notification_id, "accept"]
    );

    if (checkResult.rowCount > 0) {
      res.status(400).json({ message: "Someone already accepted" });
    } else {
      // Check the cancel_status and get user_id
      const cancelStatusResult = await client.query(
        "SELECT cancel_status, user_id FROM notifications WHERE user_notification_id = $1",
        [user_notification_id]
      );

      if (
        cancelStatusResult.rows.length > 0 &&
        cancelStatusResult.rows[0].cancel_status === "cancel"
      ) {
        res
          .status(400)
          .json({ message: "Cannot accept request, it has been canceled" });
      } else {
        // Update the status to 'accept' if no such rows are found
        const updateResult = await client.query(
          "UPDATE notifications SET status = $1 WHERE user_notification_id = $2 AND worker_id = $3 RETURNING *",
          ["accept", user_notification_id, worker_id]
        );

        if (updateResult.rowCount === 0) {
          res
            .status(404)
            .json({ message: "Notification not found or worker mismatch" });
        } else { 
          const userId = cancelStatusResult.rows[0].user_id;
          const serviceName = await client.query(
            "SELECT service FROM usernotifications WHERE user_notification_id = $1",
            [user_notification_id]
          );
          const service = serviceName.rows[0].service
          const notificationMainId = updateResult.rows[0].notification_id
        
          const encodedNotificationId = btoa(notificationMainId);
          const route = await createUserBackgroundAction(userId,encodedNotificationId,"UserNavigation",service)
          
          // Fetch FCM tokens for the user from userfcm table
          const fcmTokenResult = await client.query(
            "SELECT fcm_token FROM userfcm WHERE user_id = $1",
            [userId]
          );

          const fcmTokens = fcmTokenResult.rows.map(row => row.fcm_token);
    
          const notificationId = updateResult.rows[0].notification_id
          console.log("check",notificationId);
          if (fcmTokens.length > 0) {
            // Create a multicast message object for all tokens
            const multicastMessage = {
              tokens: fcmTokens, // An array of tokens to send the same message to
              notification: {
                title: "Click Solver",
                body: `Commander has accepted your request; he will be there within 5 minutes.`,
              },
              data: {
                notification_id: notificationId.toString(),
                screen:'UserNavigation',
                service:service
              },
            };
          
            try {
              // Use sendEachForMulticast to send the same message to multiple tokens
              const response = await getMessaging().sendEachForMulticast(multicastMessage);
          
              // Log the responses for each token
              response.responses.forEach((res, index) => {
                if (res.success) {
                  console.log(`Message sent successfully to token ${fcmTokens[index]}`);
                } else {
                  console.error(`Error sending message to token ${fcmTokens[index]}:`, res.error);
                }
              });
          
              console.log('Success Count:', response.successCount);
              console.log('Failure Count:', response.failureCount);
          
            } catch (error) {
              console.error('Error sending notifications:', error);
            }
          } else {
            console.error('No FCM tokens to send the message to.');
          }
          

          res.status(200).json({
            message: "Status updated to accept",
            notificationId: updateResult.rows[0].notification_id,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};







// const workCompletedRequest = async (req,res) =>{
//   const {notification_id} = req.body
//   console.log(notification_id)
//   const encodedUserNotificationId = Buffer.from(
//     notification_id.toString()
//   ).toString("base64");
//   const result =  await client.query(
//     "SELECT worker_id FROM notifications WHERE notification_id = $1",
//     [notification_id]
//   );

//   if(result.rows.length > 0){
//     const updateResult = await client.query(
//       "UPDATE notifications SET complete_status = $1 WHERE notification_id = $2 RETURNING *",
//       ["send", notification_id]
//     );
//     // Fetch FCM tokens for the user from userfcm table
//     const workerId = result.rows[0].worker_id
//     const fcmTokenResult = await client.query(
//       "SELECT fcm_token FROM fcm WHERE worker_id = $1",
//       [workerId]
//     );

//     const fcmTokens = fcmTokenResult.rows.map(row => row.fcm_token);
//     console.log(fcmTokens);
    
//     if (fcmTokens.length > 0) {
//       // Create a multicast message object for all tokens
//       const multicastMessage = {
//         tokens: fcmTokens, // An array of tokens to send the same message to
//         notification: {
//           title: "Click Solver",
//           body: `It is the request from user with work has completed successfully. Click the notification and confirm the work completion.`,
//         },
//         data: {
//           user_notification_id: encodedUserNotificationId.toString(),
//           route: 'TaskConfirmation'
//         },
//       };
    
//       try {
//         // Use sendEachForMulticast to send the same message to multiple tokens
//         const response = await getMessaging().sendEachForMulticast(multicastMessage);
    
//         // Log the responses for each token
//         response.responses.forEach((res, index) => {
//           if (res.success) {
//             console.log(`Message sent successfully to token ${fcmTokens[index]}`);
//           } else {
//             console.error(`Error sending message to token ${fcmTokens[index]}:`, res.error);
//           }
//         });
    
//         console.log('Success Count:', response.successCount);
//         console.log('Failure Count:', response.failureCount);
    
//       } catch (error) {
//         console.error('Error sending notifications:', error);
//       }
//     } else {
//       console.error('No FCM tokens to send the message to.');
//     }
    

//     res.status(200).json({
//       message: "Status updated to accept",

//     });

//   }else{
//     res.status(205).json({
//       message: "nothing sended",
//     });
//   }
// }

const userNavigationCancel = async (req, res) => {
  const { notification_id } = req.body;
  console.log(notification_id)
  const encodedUserNotificationId = Buffer.from(notification_id.toString()).toString("base64");
  try {
    const query = await client.query(`
      UPDATE notifications
      SET user_navigation_cancel_status = 'usercanceled'
      WHERE notification_id = $1
        AND user_navigation_cancel_status IS NULL;
    `, [notification_id]);
    
      console.log(query.rowCount)

      if (query.rowCount > 0){
        const result = await client.query(`
          SELECT worker_id 
          FROM notifications
          WHERE notification_id = $1
        `, [ notification_id]);
    
        if (result.rows.length > 0) {
          const workerId = result.rows[0].worker_id;
    
          // Fetch FCM tokens for the worker in one query
          const fcmTokenResult = await client.query(`
            SELECT fcm_token
            FROM fcm
            WHERE worker_id = $1
          `, [workerId]);
    
          const fcmTokens = fcmTokenResult.rows.map(row => row.fcm_token);
          console.log(fcmTokens);
    
          if (fcmTokens.length > 0) {
            // Create a multicast message object for all tokens
            const multicastMessage = {
              tokens: fcmTokens,
              notification: {
                title: "Click Solver",
                body: `Sorry for this, User cancelled the Service.`,
              },
              data: {
                notification_id: encodedUserNotificationId.toString(),
                screen: 'Home',
              },
            };
    
            try {
              // Use sendEachForMulticast to send the same message to multiple tokens
              const response = await getMessaging().sendEachForMulticast(multicastMessage);
    
              // Log the responses for each token
              response.responses.forEach((res, index) => {
                if (res.success) {
                  console.log(`Message sent successfully to token ${fcmTokens[index]}`);
                } else {
                  console.error(`Error sending message to token ${fcmTokens[index]}:`, res.error);
                }
              });
    
              console.log('Success Count:', response.successCount);
              console.log('Failure Count:', response.failureCount);
    
            } catch (error) {
              console.error('Error sending notifications:', error);
            }
          } else {
            console.error('No FCM tokens to send the message to.');
          }
         
          res.status(200).json({ message: "Cancellation successful" });
    
        } else {
          res.status(205).json({
            message: "Nothing sent",
          });
        }
      }else {
        res.status(205).json({
          message: "Time up",
        });
      }

    // Query to update the status and get worker_id in one step

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const workCompletedRequest = async (req, res) => {
  const { notification_id } = req.body;
  console.log(notification_id);
  const encodedUserNotificationId = Buffer.from(notification_id.toString()).toString("base64");

  try {
    // Query to update the status and get worker_id in one step
    const result = await client.query(`
      SELECT worker_id 
      FROM notifications
      WHERE notification_id = $1
    `, [notification_id]);

    if (result.rows.length > 0) {
      const workerId = result.rows[0].worker_id;
      // Fetch FCM tokens for the worker in one query
      const fcmTokenResult = await client.query(`
        SELECT fcm_token
        FROM fcm
        WHERE worker_id = $1
      `, [workerId]);

      const fcmTokens = fcmTokenResult.rows.map(row => row.fcm_token);
      console.log(fcmTokens);

      if (fcmTokens.length > 0) {
        // Create a multicast message object for all tokens
        const multicastMessage = {
          tokens: fcmTokens,
          notification: {
            title: "Click Solver",
            body: `It is the request from user with work has completed successfully. Click the notification and confirm the work completion.`,
          },
          data: {
            notification_id: encodedUserNotificationId.toString(),
            screen: 'TaskConfirmation',
          },
        };

        try {
          // Use sendEachForMulticast to send the same message to multiple tokens
          const response = await getMessaging().sendEachForMulticast(multicastMessage);

          // Log the responses for each token
          response.responses.forEach((res, index) => {
            if (res.success) {
              console.log(`Message sent successfully to token ${fcmTokens[index]}`);
            } else {
              console.error(`Error sending message to token ${fcmTokens[index]}:`, res.error);
            }
          });

          console.log('Success Count:', response.successCount);
          console.log('Failure Count:', response.failureCount);

        } catch (error) {
          console.error('Error sending notifications:', error);
        }
      } else {
        console.error('No FCM tokens to send the message to.');
      }

      res.status(200).json({
        message: "Status updated to accept",
      });
    } else {
      res.status(205).json({
        message: "Nothing sent",
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// const workCompletedRequest = async (req, res) => {
//   const { notification_id } = req.body;
//   console.log(notification_id);
//   const encodedUserNotificationId = Buffer.from(notification_id.toString()).toString("base64");

//   try {
//     // Query to update the status and get worker_id in one step
//     const result = await client.query(`
//       WITH updated_notification AS (
//         UPDATE notifications
//         SET complete_status = $1
//         WHERE notification_id = $2
//         RETURNING worker_id
//       )
//       SELECT worker_id
//       FROM updated_notification
//     `, ["send", notification_id]);

//     if (result.rows.length > 0) {
//       const workerId = result.rows[0].worker_id;

//       // Fetch FCM tokens for the worker in one query
//       const fcmTokenResult = await client.query(`
//         SELECT fcm_token
//         FROM fcm
//         WHERE worker_id = $1
//       `, [workerId]);

//       const fcmTokens = fcmTokenResult.rows.map(row => row.fcm_token);
//       console.log(fcmTokens);

//       if (fcmTokens.length > 0) {
//         // Create a multicast message object for all tokens
//         const multicastMessage = {
//           tokens: fcmTokens,
//           notification: {
//             title: "Click Solver",
//             body: `It is the request from user with work has completed successfully. Click the notification and confirm the work completion.`,
//           },
//           data: {
//             user_notification_id: encodedUserNotificationId.toString(),
//             route: 'TaskConfirmation',
//           },
//         };

//         try {
//           // Use sendEachForMulticast to send the same message to multiple tokens
//           const response = await getMessaging().sendEachForMulticast(multicastMessage);

//           // Log the responses for each token
//           response.responses.forEach((res, index) => {
//             if (res.success) {
//               console.log(`Message sent successfully to token ${fcmTokens[index]}`);
//             } else {
//               console.error(`Error sending message to token ${fcmTokens[index]}:`, res.error);
//             }
//           });

//           console.log('Success Count:', response.successCount);
//           console.log('Failure Count:', response.failureCount);

//         } catch (error) {
//           console.error('Error sending notifications:', error);
//         }
//       } else {
//         console.error('No FCM tokens to send the message to.');
//       }

//       res.status(200).json({
//         message: "Status updated to accept",
//       });
//     } else {
//       res.status(205).json({
//         message: "Nothing sent",
//       });
//     }
//   } catch (error) {
//     console.error('Error processing request:', error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


const addWorker = async (worker) => {
  const { name, phone_number } = worker;
  const created_at = getCurrentTimestamp();
  try {
    const result = await client.query(
      'INSERT INTO "workers" ( name, phone_number, created_at) VALUES ( $1, $2, $3) RETURNING *',
      [name, phone_number, created_at]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error adding user:", err);
    throw err;
  } 
};

const userCancelNavigation = async (req, res) => {
  const { notification_id } = req.body;

  if (!notification_id) {
    return res.status(400).json({ error: "Notification ID is required" });
  }

  try {
    // Check the current status of the notification
    const checkStatusQuery =
      "SELECT user_navigation_cancel_status FROM notifications WHERE notification_id = $1";
    const statusResult = await client.query(checkStatusQuery, [
      notification_id,
    ]);

    if (statusResult.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const currentStatus = statusResult.rows[0].user_navigation_cancel_status;

    if (currentStatus === "timeup") {
      return res.status(404).json({ error: "Cancellation time is up" });
    }

    // Update the status to 'usercanceled'
    const updateStatusQuery =
      "UPDATE notifications SET user_navigation_cancel_status = $1 WHERE notification_id = $2";
    await client.query(updateStatusQuery, ["usercanceled", notification_id]);

    return res.status(200).json({ message: "Cancellation successful" });
  } catch (error) {
    console.error("Error updating cancellation status:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// const userCancelNavigation = async (req, res) => {
//   const { notification_id } = req.body;


//   if (!notification_id) {
//     return res.status(400).json({ error: "Notification ID is required" });
//   }

//   try {
//     // Combine SELECT and conditional UPDATE into one query with a CASE statement
//     const query = `
//       UPDATE notifications
//       SET user_navigation_cancel_status = 'usercanceled'
//       WHERE notification_id = $1
//       AND user_navigation_cancel_status != 'timeup'
//       RETURNING user_navigation_cancel_status;
//     `;

//     const result = await client.query(query, [notification_id]);

//     console.log(result.rowCount)

//     // If no rows are returned, the notification either doesn't exist or cannot be canceled
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Notification not found or time is up for cancellation" });
//     }

//     return res.status(200).json({ message: "Cancellation successful" });
//   } catch (error) {
//     console.error("Error updating cancellation status:", error);
//     return res.status(500).json({ error: "Server error" });
//   }
// };


const workerCancelNavigation = async (req, res) => {
  const { notification_id } = req.body;
  console.log(notification_id)
  if (!notification_id) {
    return res.status(400).json({ error: "Notification ID is required" });
  }

  try {
    // Check the current status of the notification
    const checkStatusQuery =
      "SELECT navigation_status FROM notifications WHERE notification_id = $1";
    const statusResult = await client.query(checkStatusQuery, [
      notification_id,
    ]);

    if (statusResult.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const currentStatus = statusResult.rows[0].user_navigation_cancel_status;

    if (currentStatus === "timeup") {
      return res.status(404).json({ error: "Cancellation time is up" });
    }

    // Update the status to 'usercanceled'
    const updateStatusQuery =
      "UPDATE notifications SET navigation_status = $1 WHERE notification_id = $2";
    await client.query(updateStatusQuery, ["workercanceled", notification_id]);

    return res.status(200).json({ message: "Cancellation successful" });
  } catch (error) {
    console.error("Error updating cancellation status:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const generatePinFunction = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a 4-digit PIN
};


const sendNotifications = async (messages) => {
  try {
    const response = await getMessaging().sendAll(messages);
    console.log('Notifications sent:', response.successCount);
  } catch (error) {
    console.error('Error sending notifications, retrying...', error);
    // Retry logic (backoff strategy)
    setTimeout(async () => {
      const retryResponse = await getMessaging().sendAll(messages);
      console.log('Retry notifications sent:', retryResponse.successCount);
    }, 3000); // 3-second retry delay
  }
};

// Haversine formula to calculate the distance between two points on the Earth's surface
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const R = 6371; // Radius of the Earth in km

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const generatePin = () => {
  return Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit random number
};


// Generate the current date and time
// const currentDateTime = new Date();
// const formattedDate = currentDateTime.toLocaleDateString(); // Formats the date (e.g., "MM/DD/YYYY")
// const formattedTime = currentDateTime.toLocaleTimeString(); // Formats the time (e.g., "HH:MM:SS AM/PM")
// console.log("formatdate and formattime",currentDateTime,formattedDate,formattedTime)
const formattedDate = () =>{
  const currentDateTime = new Date();
  return currentDateTime.toLocaleDateString();
}

const formattedTime = () =>{
  const currentDateTime = new Date();
  return currentDateTime.toLocaleTimeString();
}


const getWorkersNearby = async (req, res) => {
  const user_id = req.user.id;
  const { area, pincode, city, alternateName, alternatePhoneNumber,serviceBooked } = req.body;
  console.log(serviceBooked)
  const created_at = getCurrentTimestamp();

  try {
    // Get user details
    const userQuery = 'SELECT * FROM "user" WHERE user_id = $1';
    const userResult = await client.query(userQuery, [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = userResult.rows[0];

    // Get user location
    const userLocationQuery = "SELECT * FROM userlocation WHERE user_id = $1";
    const userLocationResult = await client.query(userLocationQuery, [user_id]);
    if (userLocationResult.rows.length === 0) {
      return res.status(404).json({ error: "User location not found" });
    }
    const userLocation = userLocationResult.rows[0];

    // Insert user location into userNotifications table
    const insertUserNotificationQuery = `
    INSERT INTO userNotifications (user_id, longitude, latitude, created_at, area, pincode, city, alternate_name, alternate_phone_number,service)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10)
    RETURNING user_notification_id
    `;
    const userNotificationResult = await client.query(
      insertUserNotificationQuery,
      [
        user_id,
        userLocation.longitude,
        userLocation.latitude,
        created_at,
        area,
        pincode,
        city,
        alternateName,
        alternatePhoneNumber,
        serviceBooked
      ]
    );
    const userNotificationId =
      userNotificationResult.rows[0].user_notification_id;

    // Insert user notification into userrecentnotifications table with conflict handling
    const insertUserRecentNotificationQuery = `
      INSERT INTO userrecentnotifications (user_notification_id, user_id, longitude, latitude, created_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) DO UPDATE SET
        user_notification_id = EXCLUDED.user_notification_id,
        longitude = EXCLUDED.longitude,
        latitude = EXCLUDED.latitude,
        created_at = EXCLUDED.created_at
      RETURNING recent_notification_id
    `;
    const userRecentNotificationResult = await client.query(
      insertUserRecentNotificationQuery,
      [
        userNotificationId,
        user_id,
        userLocation.longitude,
        userLocation.latitude,
        created_at,
      ]
    );
    const recentNotificationId =
      userRecentNotificationResult.rows[0].recent_notification_id;


    // // // Get all worker locations
    // const workerLocationsQuery = "SELECT * FROM workerlocation";
    // const workerLocationsResult = await client.query(workerLocationsQuery);
    const query = `
    SELECT worker_id 
    FROM workerskills
    WHERE $1 = ANY(subservices);
  `;

  // Execute query
  const result = await client.query(query, [serviceBooked]);

  // Extract worker IDs from result
  const workerIds = result.rows.map(row => row.worker_id);

  console.log('Worker IDs:', workerIds);



    
    const workerDb = await getAllLocations(workerIds)


    // Filter workers within 2 km radius
    const nearbyWorkers = [];
    workerDb.forEach((workerLocation) => {
      const distance = haversineDistance(
        userLocation.latitude,
        userLocation.longitude,
        workerLocation.location._latitude,
        workerLocation.location._longitude
      );
      if (distance <= 2) {
        nearbyWorkers.push(workerLocation.worker_id);
      }
    });

    // Get details of workers within 2 km radius
    if (nearbyWorkers.length > 0) {
      const workerDetailsQuery = `
        SELECT w.*, wl.longitude, wl.latitude
        FROM workers w
        JOIN workerlocation wl ON w.worker_id = wl.worker_id
        WHERE w.worker_id = ANY($1::int[])
      `;
      const workerDetailsResult = await client.query(workerDetailsQuery, [
        nearbyWorkers,
      ]);

      // Generate a 4-digit PIN
      const pin = generatePin();

      // Insert worker details into notifications table
      const insertNotificationsQuery = `
        INSERT INTO notifications (recent_notification_id, user_notification_id, user_id, worker_id, longitude, latitude, created_at, pin, service)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
      for (const worker of workerDetailsResult.rows) {
        await client.query(insertNotificationsQuery, [
          recentNotificationId,
          userNotificationId,
          user_id,
          worker.worker_id,
          userLocation.longitude,
          userLocation.latitude,
          created_at,
          pin,
          serviceBooked
        ]);
      }

      const encodedUserNotificationId = Buffer.from(
        userNotificationId.toString()
      ).toString("base64");

      // Get FCM tokens for nearby workers
      const fcmTokensQuery = `
        SELECT fcm_token FROM fcm WHERE worker_id = ANY($1::int[])
      `;
      const fcmTokensResult = await client.query(fcmTokensQuery, [
        nearbyWorkers,
      ]);
      const fcmTokens = fcmTokensResult.rows.map((row) => row.fcm_token);

      console.log(fcmTokens)
      

      // Send notifications to nearby workers
      // const messages = fcmTokens.map((token) => ({
      //   token,
      //   notification: {
      //     title: "Click Solver",
      //     body: `You have a new job request from a user. Click to accept and help the user. ${encodedUserNotificationId.toString()}`, // Modify body as needed
      //   },
      //   data: {
      //     user_notification_id: encodedUserNotificationId.toString(), // Ensure user_notification_id is a string
      //     click_action: "FLUTTER_NOTIFICATION_CLICK",
      //     targetUrl: `/acceptance/${encodedUserNotificationId}`,
      //   },
      // }));

      if (fcmTokens.length > 0) {
        // Create the multicast message object
        const multicastMessage = {
          tokens: fcmTokens, // An array of tokens to send the same message to
          notification: {
            title: serviceBooked,
            body: `${area}, ${city}, ${pincode}`,
          },
          data: {
            user_notification_id: encodedUserNotificationId.toString(),
            click_action: "FLUTTER_NOTIFICATION_CLICK",
            cost:'199',
            targetUrl: `/acceptance/${encodedUserNotificationId}`,
            screen: 'Acceptance',
            date: formattedDate(), // Add the current date
            time: formattedTime(), // Add the current time
          },
        };
      
        try {
          // Use sendEachForMulticast to send the same message to multiple tokens
          const response = await getMessaging().sendEachForMulticast(multicastMessage);
      
          // Log the responses for each token
          response.responses.forEach((res, index) => {
            if (res.success) {
              console.log(`Message sent successfully to token ${fcmTokens[index]}`);
            } else {
              console.error(`Error sending message to token ${fcmTokens[index]}:`, res.error);
            }
          });
      
          console.log('Success Count:', response.successCount);
          console.log('Failure Count:', response.failureCount);
      
        } catch (error) {
          console.error('Error sending notifications:', error);
        }
      } else {
        console.error('No FCM tokens to send the message to.');
      }

      return res.status(200).json(encodedUserNotificationId);
    } else {
      return res
        .status(200) 
        .json("No workers found within 2 km radius" );
    }
  } catch (error) {
    console.error("Error fetching workers:", error);
    return res.status(500).json({ error: "Server error" });
  }
};


// const getWorkersNearby = async (req, res) => {
//   const user_id = req.user.id;
//   const { area, pincode, city, alternateName, alternatePhoneNumber, serviceBooked } = req.body;
//   const created_at = getCurrentTimestamp();

//   try {
//     // Fetch user and user location in one query
//     const userQuery = `
//       SELECT u.user_id, ul.longitude, ul.latitude
//       FROM "user" u
//       JOIN userlocation ul ON u.user_id = ul.user_id
//       WHERE u.user_id = $1
//     `;
//     const userResult = await client.query(userQuery, [user_id]);

//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     const user = userResult.rows[0];

//     // Insert user notification and recent notification
//     const insertNotificationQuery = `
//       WITH ins_user_notification AS (
//         INSERT INTO userNotifications (user_id, longitude, latitude, created_at, area, pincode, city, alternate_name, alternate_phone_number, service)
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//         RETURNING user_notification_id
//       ),
//       ins_recent_notification AS (
//         INSERT INTO userrecentnotifications (user_notification_id, user_id, longitude, latitude, created_at)
//         SELECT user_notification_id, $1, $2, $3, $4
//         FROM ins_user_notification
//         ON CONFLICT (user_id) DO UPDATE SET
//           user_notification_id = EXCLUDED.user_notification_id,
//           longitude = EXCLUDED.longitude,
//           latitude = EXCLUDED.latitude,
//           created_at = EXCLUDED.created_at
//         RETURNING recent_notification_id
//       )
//       SELECT ins_user_notification.user_notification_id, ins_recent_notification.recent_notification_id
//       FROM ins_user_notification, ins_recent_notification
//     `;
//     const { rows } = await client.query(insertNotificationQuery, [
//       user_id, user.longitude, user.latitude, created_at, area, pincode, city, alternateName, alternatePhoneNumber, serviceBooked
//     ]);

//     if (rows.length === 0) {
//       console.error("Error: No notification IDs returned from insertion query.");
//       return res.status(500).json({ error: "Error creating notifications" });
//     }

//     const { user_notification_id, recent_notification_id } = rows[0];

//     // Get workers with matching services and their locations
//     const workersQuery = `
//       SELECT w.worker_id, wl.longitude, wl.latitude
//       FROM workers w
//       JOIN workerlocation wl ON w.worker_id = wl.worker_id
//       JOIN workerskills ws ON w.worker_id = ws.worker_id
//       WHERE $1 = ANY(ws.subservices)
//     `;
//     const workersResult = await client.query(workersQuery, [serviceBooked]);

//     // Filter workers within 2 km radius
//     const nearbyWorkers = workersResult.rows.filter(worker => {
//       const distance = haversineDistance(
//         user.latitude,
//         user.longitude,
//         worker.latitude,
//         worker.longitude
//       );
//       return distance <= 2;
//     });

//     // Get FCM tokens for nearby workers
//     if (nearbyWorkers.length > 0) {
//       const workerIds = nearbyWorkers.map(worker => worker.worker_id);
//       const fcmTokensQuery = `
//         SELECT fcm_token
//         FROM fcm
//         WHERE worker_id = ANY($1::int[])
//       `;
//       const fcmTokensResult = await client.query(fcmTokensQuery, [workerIds]);
//       const fcmTokens = fcmTokensResult.rows.map(row => row.fcm_token);

//       console.log(fcmTokens);

//       // Create the multicast message object
//       const encodedUserNotificationId = Buffer.from(user_notification_id.toString()).toString("base64");
//       const multicastMessage = {
//         tokens: fcmTokens,
//         notification: {
//           title: "Click Solver",
//           body: `You have a new job request from a user. Click to accept and help the user.`,
//         },
//         data: {
//           user_notification_id: encodedUserNotificationId,
//           click_action: "FLUTTER_NOTIFICATION_CLICK",
//           targetUrl: `/acceptance/${encodedUserNotificationId}`,
//           route: 'Acceptance',
//         },
//       };

//       try {
//         // Use sendEachForMulticast to send the same message to multiple tokens
//         const response = await getMessaging().sendEachForMulticast(multicastMessage);

//         // Log the responses for each token
//         response.responses.forEach((res, index) => {
//           if (res.success) {
//             console.log(`Message sent successfully to token ${fcmTokens[index]}`);
//           } else {
//             console.error(`Error sending message to token ${fcmTokens[index]}:`, res.error);
//           }
//         });

//         console.log('Success Count:', response.successCount);
//         console.log('Failure Count:', response.failureCount);

//       } catch (error) {
//         console.error('Error sending notifications:', error);
//       }

//       return res.status(200).json(encodedUserNotificationId);
//     } else {
//       return res.status(200).json("No workers found within 2 km radius");
//     }
//   } catch (error) {
//     console.error("Error fetching workers:", error);
//     return res.status(500).json({ error: "Server error" });
//   }
// };







const checkTaskStatus = async (req,res) =>{
  const { notification_id } = req.body;
  console.log(notification_id)
  try {
    const result = await client.query(
      "SELECT end_time FROM servicecall WHERE notification_id = $1",
      [notification_id]
    );
    if (result.rows.length > 0) {
      const status = result.rows[0].end_time;
      
      if(status){
        console.log(status)
        res.status(200).json({ status });
      }
      else {

        res.status(205).json({ message: "Notification not found" });
      }
     
    } else {
      res.status(205).json({ message: "Notification not found" });
    }
  } catch (error) {
    console.error("Error checking status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const checkStatus = async (req, res) => {
  const { user_notification_id } = req.query;
  
  try {
    const result = await client.query(
      "SELECT status, notification_id FROM notifications WHERE user_notification_id = $1",
      [user_notification_id]
    );
    
    if (result.rows.length > 0) {
      const status = result.rows[0].status;
      const notification_id = result.rows[0].notification_id;

      res.status(200).json({ status, notification_id });
    } else {
      res.status(404).json({ message: "Notification not found" });
    }
  } catch (error) {
    console.error("Error checking status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getElectricianServices = async () => {
  try {
    const result = await client.query(
      'SELECT * FROM "services" WHERE service_title = $1',
      ["Electrician Services"]
    );
    return result.rows;
  } catch (err) {
    console.error("Error fetching electrician services:", err);
    throw err;
  }
};



const getPlumberServices = async () => {
  try {
    const result = await client.query(
      'SELECT * FROM "services" WHERE service_title = $1',
      ["Plumber"]
    );
    return result.rows;
  } catch (err) {
    console.error("Error fetching Plumber services:", err);
    throw err;
  }
};

const getVerificationStatus = async (req, res) => {
  const { notification_id } = req.query;

  if (!notification_id) {
    return res.status(400).json({ error: 'Notification ID is required' });
  }

  try {
    const result = await client.query(
      'SELECT verification_status FROM notifications WHERE notification_id = $1',
      [notification_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification ID not found' });
    }

    const verificationStatus = result.rows[0].verification_status;
    res.json(verificationStatus);
  } catch (error) {
    console.error('Error checking verification status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


  

const workerVerifyOtp = async (req, res) => {
  const { notification_id, otp } = req.body;


  try {

    // Check if the user_navigation_cancel_status is 'usercancelled'
    const cancelStatusResult = await client.query(
      "SELECT user_navigation_cancel_status FROM notifications WHERE notification_id = $1",
      [notification_id]
    );

    if (cancelStatusResult.rows.length > 0) {
      const cancelStatus = cancelStatusResult.rows[0].user_navigation_cancel_status;

      if (cancelStatus === 'usercanceled') {
        // If the user_navigation_cancel_status is 'usercancelled', send status 205
        return res.status(205).json({ message: "User cancelled the navigation" });
      }
    } else {
      return res.status(404).json({ message: "Notification not found" });
    }
    // Fetch the notification entry by user_notification_id
    const result = await client.query(
      "SELECT pin FROM notifications WHERE notification_id = $1",
      [notification_id]
    );
    console.log(result.rows[0])
 
    if (result.rows.length > 0) {
      const storedPin = result.rows[0].pin;
      if (storedPin == otp) {
        const updateVerificationResult = await client.query(
          "UPDATE notifications SET verification_status = $1 WHERE notification_id = $2",
          [true, notification_id]
        );
        const timeResult = await TimeStart(notification_id);
        console.log(timeResult)
        const userIdQuery = await client.query(
          "SELECT user_id FROM notifications WHERE notification_id = $1",
          [notification_id]
        );
        const userId = userIdQuery.rows[0].user_id
        
        // Fetch FCM tokens for the user from userfcm table
        const fcmTokenResult = await client.query(
          "SELECT fcm_token FROM userfcm WHERE user_id = $1",
          [userId]
        );

        const fcmTokens = fcmTokenResult.rows.map(row => row.fcm_token);
        console.log(fcmTokens);
        
        if (fcmTokens.length > 0) {
          // Create a multicast message object
          const multicastMessage = {
            tokens: fcmTokens, // An array of tokens to send the same message to
            notification: {
              title: "Click Solver",
              body: `The Commander has successfully verified the work, the time has started.`,
            },
            data: {
              notification_id: notification_id.toString(),
              screen:'worktimescreen'
            },
          };
        
          try {
            // Use sendEachForMulticast to send the same message to multiple tokens
            const response = await getMessaging().sendEachForMulticast(multicastMessage);
        
            // Log the responses for each token
            response.responses.forEach((res, index) => {
              if (res.success) {
                console.log(`Message sent successfully to token ${fcmTokens[index]}`);
              } else {
                console.error(`Error sending message to token ${fcmTokens[index]}:`, res.error);
              }
            });
        
            console.log('Success Count:', response.successCount);
            console.log('Failure Count:', response.failureCount);
        
          } catch (error) {
            console.error('Error sending notifications:', error);
          }
        } else {
          console.error('No FCM tokens to send the message to.');
        }
        
        

        
        return res.status(200).json({status :updateVerificationResult.rows,timeResult:timeResult});
      } else {
        return res.status(404).json({ message: "OTP is incorrect" });
      }
    } else {
      return res.status(404).json({ message: "Notification not found" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getCleaningServices = async () => {
  try {
    const result = await client.query(
      'SELECT * FROM "services" WHERE service_title = $1',
      ["Cleaning Department"]
    );
    return result.rows;
  } catch (err) {
    console.error("Error fetching Cleaning services:", err);
    throw err;
  }
};

const getPaintingServices = async () => {
  try {
    const result = await client.query(
      'SELECT * FROM "services" WHERE service_title = $1',
      ["House and Shop Painting"]
    );
    return result.rows;
  } catch (err) {
    console.error("Error fetching Painter services:", err);
    throw err;
  }
};

const getVehicleServices = async () => {
  try {
    const result = await client.query(
      'SELECT * FROM "services" WHERE service_title IN ($1, $2)',
      ["Vehical mechanics", "Salon for mens & kids"]
    );
    return result.rows;
  } catch (err) {
    console.error("Error fetching Vehicle services:", err);
    throw err;
  }
};

// const sendOTP = async (req, res) => {
//   const { phoneNumber } = req.body;

//   // Ensure phone number is in E.164 format with country code
//   if (!phoneNumber || !/^\+91\d{10}$/.test(phoneNumber)) {
//     return res.status(400).send({
//       success: false,
//       error:
//         "The phone number must be a non-empty E.164 standard compliant identifier string.",
//     });
//   }

//   try {
//     const user = await admin.auth().getUserByPhoneNumber(phoneNumber);

//     const customToken = await admin.auth().createCustomToken(user.uid);

//     res.status(200).send({ success: true, customToken });
//   } catch (error) {
//     console.error("Error fetching user by phone number:", error);
//     if (error.code === "auth/user-not-found") {
//       try {
//         const newUser = await admin.auth().createUser({
//           phoneNumber: phoneNumber,
//         });

//         const customToken = await admin.auth().createCustomToken(newUser.uid);

//         res.status(200).send({ success: true, customToken });
//       } catch (createError) {
//         console.error("Error creating new user:", createError);
//         res.status(500).send({ success: false, error: createError.message });
//       }
//     } else {
//       console.error("Error retrieving user:", error);
//       res.status(500).send({ success: false, error: error.message });
//     }
//   }
// };

// messagecentral

const sendOtp = (req, res) => {
  const { mobileNumber } = req.body;
  console.log(mobileNumber)
  const options = {
    method: 'POST',
    url: `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=C-B3753ECA43BD435&flowType=SMS&mobileNumber=${mobileNumber}`,
    headers: {
      'authToken': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLUIzNzUzRUNBNDNCRDQzNSIsImlhdCI6MTcyNjI1OTQwNiwiZXhwIjoxODgzOTM5NDA2fQ.Gme6ijpbtUge-n9NpEgJR7lIsNQTqH4kDWkoe9Wp6Nnd6AE0jaAKCuuGuYtkilkBrcC1wCj8GrlMNQodR-Gelg'
    }
  };

  request(options, function (error, response) {
    if (error) {
      return res.status(500).json({ message: 'Error sending OTP', error });
    }

    // Log the response body to see what you are getting
    console.log('Response body:', response.body);

    try {
      const data = JSON.parse(response.body);
      
      // Check if data contains the expected structure
      if (data && data.data && data.data.verificationId) {
        res.status(200).json({
          message: 'OTP sent successfully',
          verificationId: data.data.verificationId,
        });
      } else {
        // Handle case where verificationId is not present
        res.status(500).json({
          message: 'Failed to retrieve verificationId',
          error: data
        });
      }
    } catch (parseError) {
      // Handle JSON parsing errors
      res.status(500).json({ message: 'Failed to parse response', error: parseError });
    }
  });
};

const validateOtp = (req, res) => {
  const { mobileNumber, verificationId, otpCode } = req.query;

  const options = {
    method: 'GET',
    url: `https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=91&mobileNumber=${mobileNumber}&verificationId=${verificationId}&customerId=C-B3753ECA43BD435&code=${otpCode}`,
    headers: {
      'authToken': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLUIzNzUzRUNBNDNCRDQzNSIsImlhdCI6MTcyNjI1OTQwNiwiZXhwIjoxODgzOTM5NDA2fQ.Gme6ijpbtUge-n9NpEgJR7lIsNQTqH4kDWkoe9Wp6Nnd6AE0jaAKCuuGuYtkilkBrcC1wCj8GrlMNQodR-Gelg'
    }
  };

  request(options, function (error, response) {
    if (error) {
      return res.status(500).json({ message: 'Error validating OTP', error });
    }
    const data = JSON.parse(response.body);
    console.log(data)
    res.status(200).json({
      message: data.data.verificationStatus === "VERIFICATION_COMPLETED" ? 'OTP Verified' : 'Invalid OTP',
    });
  });
};


const CheckStartTime = async (req,res) => {
  const { notification_id } = req.body; 
  console.log(notification_id)
  try {
    const result = await client.query(
      "SELECT start_time FROM ServiceCall WHERE notification_id = $1",
      [notification_id]
    );
  
    if (result.rows.length > 0) {
      const workedTime = result.rows[0].start_time;
      console.log(workedTime)
      if (workedTime) {
        res.status(200).json({worked_time: workedTime});
      } else {
        const time = getCurrentTimestamp()
        res.status(200).json({worked_time: time});
      }
    } else {
      res.status(404).json({ error: 'Notification ID not found' });
    }
  } catch (error) {
    console.error('Error fetching timer value:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Function to get the timer value
const getTimerValue = async (req, res) => {
  const { notification_id } = req.body; // Extract notification_id from query parameters
  console.log("notification denedhe", notification_id);
  try {
    const result = await client.query(
      "SELECT time_worked FROM ServiceCall WHERE notification_id = $1",
      [notification_id]
    );
    console.log(result.rows)

    if (result.rows.length > 0) {
      const workedTime = result.rows[0].time_worked;
      if (workedTime) {
        res.status(200).json(workedTime);
      } else {
        res.status(200).json('00:00:00');
      }
    } else {
      res.status(404).json({ error: 'Notification ID not found' });
    }
  } catch (error) {
    console.error('Error fetching timer value:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

let stopwatchInterval = null;
let workedTime = 0;
const activeNotifications = new Set();

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
};

const parseTime = (timeString) => {
  if (typeof timeString !== "string") {
    return 0; // or some default value
  }
  const [hrs, mins, secs] = timeString.split(":").map(Number);
  return hrs * 3600 + mins * 60 + secs;
};

// Adjusted startStopwatch function
const startStopwatch = async (notificationId) => {
  // Check if stopwatch is already running for this notificationId
  if (activeNotifications.has(notificationId)) {
    console.log(`Stopwatch for notification ID ${notificationId} is already running.`);
    // Return the current worked time if it's already running
    const result = await client.query(
      "SELECT time_worked FROM ServiceCall WHERE notification_id = $1",
      [notificationId]
    );
    if (result.rows.length > 0 && result.rows[0].time_worked !== null) {
      const workedTimeString = result.rows[0].time_worked;
      return workedTimeString; // Return the existing time worked
    }
  }

  try {
    // Query the database to get worker_id from notifications table
    const workerResult = await client.query(
      "SELECT worker_id FROM notifications WHERE notification_id = $1",
      [notificationId]
    );

    if (workerResult.rows.length === 0) {
      throw new Error("No worker found for the given notification ID");
    }

    const workerId = workerResult.rows[0].worker_id;

    // Query the database to check if there's already time worked for this notificationId
    const result = await client.query(
      "SELECT time_worked FROM ServiceCall WHERE notification_id = $1",
      [notificationId]
    );

    let workedTime = 0;

    if (result.rows.length > 0 && result.rows[0].time_worked !== null) {
      // If time worked exists, parse it from the database
      const workedTimeString = result.rows[0].time_worked;
      workedTime = parseTime(workedTimeString);
    } else {
      // If no time worked exists, initialize it to 0 in the database and insert worker_id
      workedTime = 0;
      await client.query(
        "INSERT INTO ServiceCall (notification_id, start_time, time_worked, worker_id) VALUES ($1, $2, $3, $4)",
        [notificationId, new Date(), formatTime(workedTime), workerId]
      );
    }

    // Add the notificationId to activeNotifications to indicate it's running
    activeNotifications.add(notificationId);

    // Set up the interval to update time worked every second
    if (!stopwatchInterval) {
      stopwatchInterval = setInterval(async () => {
        workedTime += 1;

        try {
          const formattedTime = formatTime(workedTime);
          console.log(formattedTime)
          // Log formatted time for debugging

          // Update the time worked in the database
          await client.query(
            "UPDATE ServiceCall SET time_worked = $1 WHERE notification_id = $2",
            [formattedTime, notificationId]
          );
        } catch (error) {
          console.error("Error formatting or updating worked time:", error);
        }
      }, 1000);
    }
  } catch (error) {
    console.error("Error starting stopwatch:", error);
    throw error; // Ensure errors are properly handled
  }
};

// Adjusted startStopwatch function
// const startStopwatch = async (notificationId) => {
//   // Check if stopwatch is already running for this notificationId
//   if (activeNotifications.has(notificationId)) {
//     console.log(`Stopwatch for notification ID ${notificationId} is already running.`);
//     // Return the current worked time if it's already running
//     const result = await client.query(
//       "SELECT time_worked FROM ServiceCall WHERE notification_id = $1",
//       [notificationId]
//     );
//     if (result.rows.length > 0 && result.rows[0].time_worked !== null) {
//       const workedTimeString = result.rows[0].time_worked;
//       return workedTimeString; // Return the existing time worked
//     }
//   }

//   try {
//     // Query the database to get worker_id from notifications table
//     const workerResult = await client.query(
//       "SELECT worker_id FROM notifications WHERE notification_id = $1",
//       [notificationId]
//     );

//     if (workerResult.rows.length === 0) {
//       throw new Error("No worker found for the given notification ID");
//     }

//     const workerId = workerResult.rows[0].worker_id;

//     // Query the database to check if there's already time worked for this notificationId
//     const result = await client.query(
//       "SELECT time_worked FROM ServiceCall WHERE notification_id = $1",
//       [notificationId]
//     );

//     let workedTime = 0;

//     if (result.rows.length > 0 && result.rows[0].time_worked !== null) {
//       // If time worked exists, parse it from the database
//       const workedTimeString = result.rows[0].time_worked;
//       workedTime = parseTime(workedTimeString);
//     } else {
//       // If no time worked exists, initialize it to 0 in the database and insert worker_id
//       workedTime = 0;
//       await client.query(
//         "INSERT INTO ServiceCall (notification_id, start_time, time_worked, worker_id) VALUES ($1, $2, $3, $4)",
//         [notificationId, new Date(), formatTime(workedTime), workerId]
//       );
//     }

//     // Add the notificationId to activeNotifications to indicate it's running
//     activeNotifications.add(notificationId);

//     // Set up the interval to update time worked every second
//     if (!stopwatchInterval) {
//       stopwatchInterval = setInterval(async () => {
//         workedTime += 1;

//         try {
//           const formattedTime = formatTime(workedTime);
//           console.log(formattedTime)
//           // Log formatted time for debugging

//           // Update the time worked in the database
//           await client.query(
//             "UPDATE ServiceCall SET time_worked = $1 WHERE notification_id = $2",
//             [formattedTime, notificationId]
//           );
//         } catch (error) {
//           console.error("Error formatting or updating worked time:", error);
//         }
//       }, 1000);
//     }
//   } catch (error) {
//     console.error("Error starting stopwatch:", error);
//     throw error; // Ensure errors are properly handled
//   }
// };


// const stopStopwatch = async (req, res) => {
//   const {notification_id} = req.body
//   if (stopwatchInterval) {
//     clearInterval(stopwatchInterval);
//     stopwatchInterval = null;

//     try {
//       const end_time = new Date(); // Set end_time to the current time
//       const query = 'UPDATE servicecall SET end_time = $1 WHERE notification_id = $2';
//       const values = [end_time, notification_id];

//       const result = await client.query(query, values);

//       if (result.rowCount === 0) {
//         return res.status(404).json({ error: 'No service call found with the given notification_id' });
//       }

//       const worker_id = result.rows[0].worker_id;

//       return worker_id
//     } catch (error) {
//       console.error('Error updating end_time:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// };

const getTimeDifferenceInIST = (start_time, end_time) => {
  // Parse input times
  const startTime = new Date(start_time);
  const endTime = new Date(end_time);

  // Calculate the difference in milliseconds
  const differenceInMillis = endTime - startTime;

  // Convert milliseconds to seconds
  const differenceInSeconds = Math.floor(differenceInMillis / 1000);

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(differenceInSeconds / 3600);
  const minutes = Math.floor((differenceInSeconds % 3600) / 60);
  const seconds = differenceInSeconds % 60;

  // Format to hh:mm:ss with leading zeros
  const formatTime = (value) => value.toString().padStart(2, '0');
  const time_worked = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`
  return {time_worked};
};

const serviceCompleted = async (req, res) => {
  const { notification_id, encodedId } = req.body;
  const encodedUserNotificationId = Buffer.from(notification_id.toString()).toString("base64");
  console.log(notification_id);

  try {
    const end_time = new Date();

    // Check if end_time is already set
    const checkQuery = `
    SELECT start_time, end_time
    FROM servicecall
    WHERE notification_id = $1
  `;
  
    const checkResult = await client.query(checkQuery, [notification_id]);

    if (checkResult.rows.length > 0) {
      const existingEndTime = checkResult.rows[0].end_time;

      if (existingEndTime) {
        // end_time is already set
        return res.status(205).json({ message: 'End time already set' });
      }
    }

    const startTime = checkResult.rows[0].start_time;
    const timeWorkedInSeconds = Math.floor((end_time - startTime) / 1000);
    const hours = String(Math.floor(timeWorkedInSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((timeWorkedInSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(timeWorkedInSeconds % 60).padStart(2, '0');
    
    const time_worked = `${hours}:${minutes}:${seconds}`;
  
    // Update end_time and time_worked in the database
    const updateQuery = `
      UPDATE servicecall
      SET end_time = $1, time_worked = $2
      WHERE notification_id = $3
    `;
  
    const updateResult = await client.query(updateQuery, [end_time, time_worked, notification_id]);
    

    if (updateResult.rowCount > 0) {
      const result =  `
      SELECT user_id,service
      FROM notifications
      WHERE notification_id = $1
    `;
    const userResult = await client.query(result, [notification_id]);
    const userId = userResult.rows[0].user_id
    const serviceBooked = userResult.rows[0].service
    const screen ="Paymentscreen"
    const route = await createUserBackgroundAction(userId,encodedId,screen,serviceBooked)

    const fcmTokenResult = await client.query(
      "SELECT fcm_token FROM userfcm WHERE user_id = $1",
      [userId]
    );

    const fcmTokens = fcmTokenResult.rows.map(row => row.fcm_token);
    console.log(fcmTokens);
    
    if (fcmTokens.length > 0) {
      // Create a multicast message object for all tokens
      const multicastMessage = {
        tokens: fcmTokens, // An array of tokens to send the same message to
        notification: {
          title: "Click Solver",
          body: `Commander has completed your work. Great to hear!`,
        },
        data: {
          notification_id: notification_id.toString(),
          screen:'Paymentscreen'
        },
      };
    
      try {
        // Use sendEachForMulticast to send the same message to multiple tokens
        const response = await getMessaging().sendEachForMulticast(multicastMessage);
    
        // Log the responses for each token
        response.responses.forEach((res, index) => {
          if (res.success) {
            console.log(`Message sent successfully to token ${fcmTokens[index]}`);
          } else {
            console.error(`Error sending message to token ${fcmTokens[index]}:`, res.error);
          }
        });
        res.status(200).json({ notification_id });
        console.log('Success Count:', response.successCount);
        console.log('Failure Count:', response.failureCount);
    
      } catch (error) {
        console.error('Error sending notifications:', error);
      }
    } else {
      console.error('No FCM tokens to send the message to.');
    }
    
   
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error updating end time:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// const serviceCompleted = async (req, res) => {
//   const { notification_id, encodedId } = req.body;
//   console.log(notification_id);

//   try {
//     const CompleteCancel = `
//     SELECT complete_status
//     FROM notifications
//     WHERE notification_id = $1
//   `;
  
//   // Execute the query
//   const CompleteCancelResult = await client.query(CompleteCancel, [notification_id]);
  
//   // Log the result of the query
//   const status = CompleteCancelResult.rows[0].complete_status 
//   console.log(status)
//   if (status === "cancel") {
//     return res.status(203).json({ message: 'User said not Completed ask user to resend the request' });
//   }
//     const end_time = new Date();

//     // Check if end_time is already set
//     const checkQuery = `
//     SELECT start_time, end_time
//     FROM servicecall
//     WHERE notification_id = $1
//   `;
  
//     const checkResult = await client.query(checkQuery, [notification_id]);

//     if (checkResult.rows.length > 0) {
//       const existingEndTime = checkResult.rows[0].end_time;

//       if (existingEndTime) {
//         // end_time is already set
//         return res.status(205).json({ message: 'End time already set' });
//       }
//     }

//     const startTime = checkResult.rows[0].start_time;
//     const timeWorkedInSeconds = Math.floor((end_time - startTime) / 1000);
//     const hours = String(Math.floor(timeWorkedInSeconds / 3600)).padStart(2, '0');
//     const minutes = String(Math.floor((timeWorkedInSeconds % 3600) / 60)).padStart(2, '0');
//     const seconds = String(timeWorkedInSeconds % 60).padStart(2, '0');
    
//     const time_worked = `${hours}:${minutes}:${seconds}`;
  
//     // Update end_time and time_worked in the database
//     const updateQuery = `
//       UPDATE servicecall
//       SET end_time = $1, time_worked = $2
//       WHERE notification_id = $3
//     `;
  
//     const updateResult = await client.query(updateQuery, [end_time, time_worked, notification_id]);
    

//     if (updateResult.rowCount > 0) {
//       const result =  `
//       SELECT user_id,service
//       FROM notifications
//       WHERE notification_id = $1
//     `;
//     const userResult = await client.query(result, [notification_id]);
//     const userId = userResult.rows[0].user_id
//     const serviceBooked = userResult.rows[0].service
//     const screen ="Paymentscreen"
//     const route = await createUserBackgroundAction(userId,encodedId,screen,serviceBooked)
//       res.status(200).json({ userId });
//     } else {
//       res.status(404).json({ error: 'Notification not found' });
//     }
//   } catch (error) {
//     console.error('Error updating end time:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };



const stopStopwatch = async (notification_id) => {
  if (stopwatchInterval) {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;

    try {
      const end_time = new Date(); // Set end_time to the current time

      // SQL query to join servicecall and notifications
      const query = `
        UPDATE servicecall 
        SET end_time = $1 
        WHERE notification_id = $2
        RETURNING (
          SELECT notifications.worker_id 
          FROM notifications 
          WHERE notifications.notification_id = servicecall.notification_id
        ) AS worker_id;
      `;
      const values = [end_time, notification_id];

      const result = await client.query(query, values);

      if (result.rowCount === 0) {
        throw new Error('No service call found with the given notification_id');
      }

      const userIdDetails =  await client.query(
        "SELECT user_id FROM notifications WHERE notification_id = $1",
        [notification_id]
      );

      const userId = userIdDetails.rows[0].user_id

      const fcmTokenResult = await client.query(
        "SELECT fcm_token FROM userfcm WHERE user_id = $1",
        [userId]
      );

      const fcmTokens = fcmTokenResult.rows.map(row => row.fcm_token);
      console.log(fcmTokens);
      
      if (fcmTokens.length > 0) {
        // Create a multicast message object for all tokens
        const multicastMessage = {
          tokens: fcmTokens, // An array of tokens to send the same message to
          notification: {
            title: "Click Solver",
            body: `Commander has completed your work. Great to hear!`,
          },
          data: {
            user_notification_id: notification_id.toString(),
          },
        };
      
        try {
          // Use sendEachForMulticast to send the same message to multiple tokens
          const response = await getMessaging().sendEachForMulticast(multicastMessage);
      
          // Log the responses for each token
          response.responses.forEach((res, index) => {
            if (res.success) {
              console.log(`Message sent successfully to token ${fcmTokens[index]}`);
            } else {
              console.error(`Error sending message to token ${fcmTokens[index]}:`, res.error);
            }
          });
      
          console.log('Success Count:', response.successCount);
          console.log('Failure Count:', response.failureCount);
      
        } catch (error) {
          console.error('Error sending notifications:', error);
        }
      } else {
        console.error('No FCM tokens to send the message to.');
      }
      


      return result.rows[0].worker_id; // Return worker_id from the joined table
    } catch (error) {
      console.error('Error updating end_time:', error);
      throw new Error('Internal server error');
    }
  } else {
    throw new Error('Stopwatch is not running');
  }
};


const updateWorkerLifeDetails = async (workerId, totalAmount) => {
  try {
    const query = `
      UPDATE workerlife
      SET 
        money_earned = money_earned::integer + $1,
        service_counts = service_counts::integer + 1
      WHERE worker_id = $2
      RETURNING money_earned, service_counts;
    `;
    const values = [totalAmount, workerId];

    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      throw new Error('No worker found with the given worker_id');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error updating workerlife details:', error);
    throw new Error('Internal server error');
  }
};



// Controller function to handle storing user location
const storeUserLocation = async (req, res) => {
  let { longitude, latitude } = req.body;

  const userId = req.user.id;
   // Log the received data


  try {

 
    const query = `
      INSERT INTO userLocation (longitude, latitude, user_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id)
      DO UPDATE SET longitude = EXCLUDED.longitude, latitude = EXCLUDED.latitude
    `;
    await client.query(query, [longitude, latitude, userId]);

    res.status(200).json({ message: "User location stored successfully" });
  } catch (error) {
    console.error("Error storing user location:", error);
    res.status(500).json({ error: "Failed to store user location" });
  }
};



const skillWorkerRegistration = async (req, res) => {
  const workerId = req.worker.id;
  const { selectedService, checkedServices, profilePic, proofPic, agree } = req.body;
  try {
    const query = `
      INSERT INTO workerskills (worker_id, service, subservices, profile, proof, agree)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (worker_id) DO UPDATE
      SET service = EXCLUDED.service, subservices = EXCLUDED.subservices, profile = EXCLUDED.profile, proof = EXCLUDED.proof, agree = EXCLUDED.agree
    `;
    await client.query(query, [workerId, selectedService, checkedServices, profilePic, proofPic, agree]);

    const workerLife = `
    INSERT INTO workerlife (worker_id, service_counts, money_earned)
    VALUES ($1, $2, $3)
    ON CONFLICT (worker_id) DO UPDATE
    SET service_counts = 0, money_earned = 0
  `;
  await client.query(workerLife, [workerId, 0, 0]);
    res.status(200).json({ message: "Skilled worker registration stored successfully" });
  } catch (error) {
    console.error("Error storing user location:", error);
    res.status(500).json({ error: "Failed to store Skilled worker registration" });
  }
};

const workerLifeDetails = async (req, res) => {
  const workerId = req.worker.id;
  
  try {
    const result = await client.query(
      `
        SELECT 
          wl.service_counts, 
          wl.money_earned, 
          wl.average_rating, 
          ws.profile,
          un.area,
          un.city,
          un.pincode,
          n.notification_id,
          sc.time_worked,
          u.name,
          f.name,
          f.rating AS feedback_rating,
          f.comment,
          f.created_at
        FROM workerlife wl
        INNER JOIN workerskills ws ON wl.worker_id = ws.worker_id
        INNER JOIN servicecall sc ON wl.worker_id = sc.worker_id
        INNER JOIN notifications n ON sc.notification_id = n.notification_id
        INNER JOIN usernotifications un ON n.user_notification_id = un.user_notification_id
        INNER JOIN "user" u ON n.user_id = u.user_id
        INNER JOIN feedback f ON n.notification_id = f.notification_id
        WHERE wl.worker_id = $1
        ORDER BY n.notification_id DESC
        LIMIT 5
      `,
      [workerId]
    ); 
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Worker not found" });
    } 
    const averageRatingResult = await client.query(
      `
        SELECT AVG(rating) AS average_rating
        FROM feedback
        WHERE worker_id = $1
      `,
      [workerId]
    );

    const workerProfile = {
      profileDetails: result.rows,
      averageRating: averageRatingResult.rows[0].average_rating,
      workerId
    };

    return res.status(200).json(workerProfile);
   
      // return res.status(200).json(result.rows);

  } catch (error) {
    console.error("Error getting workerlife details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



const workerProfileDetails = async (req, res) => {
  const workerId = req.worker.id;
  try {
    const ProfileResult = await client.query(
      `
        SELECT 
          w.name AS worker_name, 
          w.created_at, 
          ws.profile, 
          ws.service, 
          ws.subservices,
          f.name AS feedback_name,
          f.rating,
          f.comment
        FROM workers w
        INNER JOIN workerskills ws ON w.worker_id = ws.worker_id
        LEFT JOIN feedback f ON w.worker_id = f.worker_id
        WHERE w.worker_id = $1
      `,
      [workerId]
    );

    if (ProfileResult.rows.length === 0) {
      return res.status(404).json({ error: "Worker profile not found" });
    }

    const averageRatingResult = await client.query(
      `
        SELECT AVG(rating) AS average_rating
        FROM feedback
        WHERE worker_id = $1
      `,
      [workerId]
    );

    const workerProfile = {
      profileDetails: ProfileResult.rows,
      averageRating: averageRatingResult.rows[0].average_rating
    };

    return res.status(200).json(workerProfile);
  } catch (error) {
    console.error("Error getting worker profile details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



const getWorkerNavigationDetails = async (req, res) => {
  const { notificationId } = req.body;

  if (!notificationId) {
    return res.status(400).json({ error: "Notification ID is required" });
  }

  try {
    // Query to fetch worker_id, pin from notifications and name, phone_number from workers using JOIN
    const query = `
      SELECT 
        n.pin, 
        w.name, 
        w.phone_number
      FROM 
        notifications n
      JOIN 
        workers w ON n.worker_id = w.worker_id
      WHERE 
        n.notification_id = $1
    `;

    const result = await client.query(query, [notificationId]);

    // If no results, return 404
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification or worker not found" });
    }

    const { pin, name, phone_number } = result.rows[0];

    // Send the response
    return res.status(200).json({ pin, name, phone_number });
  } catch (error) {
    console.error("Error getting worker navigation details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};





const registrationStatus = async (req,res) => {
  const workerId = req.worker.id;

  try{
    const result = await client.query(
      "SELECT skill_id FROM workerskills WHERE worker_id = $1",
      [workerId]
    );
    console.log(result.rows.length)
    if (result.rows.length === 0) {
      return res.status(204).json({ message: "worker not found" });
    } else{
      return res.status(200).json(result.rows)
    }
  }catch (error) {
    console.error("Error updating skill registration:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

const subservices = async (req,res) => {
  const {selectedService} = req.body;
  try {
    const result = await client.query(
      "SELECT service_name,service_title FROM services WHERE service_title = $1",
      [selectedService]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "worker not found" });
    } else{
      return res.status(200).json(result.rows)
    }

  } catch (error) {
    console.error("Error updating skill registration:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
  
}


// Function to handle the /user/cancellation route
// const cancelRequest = async (req, res) => {
//   const { user_notification_id } = req.body;

//   if (!user_notification_id) {
//     return res.status(400).json({ error: "user_notification_id is required" });
//   }

//   try {
//     // Check the current cancel_status
//     const result = await client.query(
//       "SELECT cancel_status FROM notifications WHERE user_notification_id = $1",
//       [user_notification_id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Notification not found" });
//     }

//     const currentStatus = result.rows[0].cancel_status;

//     // Only update if the current status is not 'timeup'
//     if (currentStatus !== "timeup") {
//       await client.query(
//         "UPDATE notifications SET cancel_status = $1 WHERE user_notification_id = $2",
//         ["cancel", user_notification_id]
//       );
//       return res
//         .status(200)
//         .json({ message: "Cancel status updated to cancel" });
//     } else {
//       return res
//         .status(400)
//         .json({ error: "Cannot update status as it is already timeup" });
//     }
//   } catch (error) {
//     console.error("Error updating cancel status:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };
const userUpdateLastLogin = async (req,res) => {
  const userId = req.worker.id
  const time = getCurrentTimestamp()
  try {
    const query = {
      text: `UPDATE "user" SET last_active = $1 WHERE user_id = $2 RETURNING *`,
      values: [time,userId],
    };

    const result = await client.query(query);
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
}



const checkInactiveUsers = async () => {
  // const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);
  const query = {
    text: `
      SELECT u.*, ft.fcm_token
      FROM "user" u
      JOIN userfcm ft ON u.user_id = ft.user_id
      WHERE u.last_active < $1
    `,
    values: [oneMinuteAgo],
  };

  const result = await client.query(query);

  result.rows.forEach(async (user) => {
    // Send notification using FCM
    const message = {
      notification: {
        title: 'We Miss You!',
        body: 'It’s been a while since you last visited us. Come back and check out what’s new!',
      },
      token: user.fcm_token,
    };
    await getMessaging().send(message);
  });
};

cron.schedule('0 9 * * *', () => {
  checkInactiveUsers();
});


const cancelRequest = async (req, res) => {
  const { user_notification_id } = req.body;

  if (!user_notification_id) {
    return res.status(400).json({ error: "user_notification_id is required" });
  }

  try {
    // Combined query to check both 'accept' status and 'cancel_status'
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'accept') AS accept_count,
        MAX(cancel_status) AS cancel_status
      FROM 
        notifications 
      WHERE 
        user_notification_id = $1
    `;

    const result = await client.query(query, [user_notification_id]);

    const acceptCount = parseInt(result.rows[0].accept_count, 10);
    const currentStatus = result.rows[0].cancel_status;

    // Check if there is an 'accept' status
    if (acceptCount > 0) {
      return res
        .status(400)
        .json({ error: "Cannot cancel as status is already accepted" });
    }

    // Only update if the current cancel_status is not 'timeup'
    if (currentStatus !== "timeup") {
      await client.query(
        "UPDATE notifications SET cancel_status = $1 WHERE user_notification_id = $2",
        ["cancel", user_notification_id]
      );
      return res
        .status(200)
        .json({ message: "Cancel status updated to cancel" });
    } else {
      return res
        .status(400)
        .json({ error: "Cannot update status as it is already timeup" });
    }
  } catch (error) {
    console.error("Error updating cancel status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


 
// Function to verify OTP
const verifyOTP = async (req, res) => {
  const { verificationCode } = req.body;
  console.log(verificationCode)
  try {
    const sessionInfo = await admin.auth().verifyIdToken(verificationCode);

    res.status(200).send({ success: true, sessionInfo });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).send({ success: false, error: error.message });
  }
};

const calculatePayment = (timeWorked) => {
  	console.log(timeWorked)
  const [hours, minutes, seconds] = timeWorked.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;

  if (totalMinutes <= 30) {
      return 149;
  }

  const extraMinutes = totalMinutes - 30;
  const fullHalfHours = Math.floor(extraMinutes / 30);
  const remainingMinutes = extraMinutes % 30;

  let extraCharges = fullHalfHours * 49;
  if (remainingMinutes > 0) {
      const remainingCharge = Math.min(remainingMinutes * 5, 49);
      extraCharges += remainingCharge;
  }

  return 149 + extraCharges;
};

// Function to get service call details by notification_id
const paymentDetails = async (notification_id) => {
  try {
      const query = 'SELECT * FROM servicecall WHERE notification_id = $1';
      const values = [notification_id];

      const res = await client.query(query, values);

      if (res.rows.length > 0) {
          return res.rows[0];
      } else {
          throw new Error('No service call found with the given notification_id');
      }
  } catch (error) {
      console.error('Error fetching service call details:', error);
      throw error;
  }
};


const getPaymentDetails = async (notification_id) => {
  try {
    const query = `
      SELECT 
        n.service,
        u.name 
      FROM 
        notifications n
      JOIN 
        "user" u ON n.user_id = u.user_id 
      WHERE 
        n.notification_id = $1
    `;
    const values = [notification_id];

      const res = await client.query(query, values);
      
      if (res.rows.length > 0) {
        console.log(res.rows[0])
          return res.rows[0];
      } else {
          throw new Error('No service payment details found with the given notification_id');
      }
  } catch (error) {
      console.error('Error fetching payment details details:', error);
      throw error;
  }
};





// Function to process payment
const processPayment = async (req, res) => {
  const { totalAmount, paymentMethod, decodedId } = req.body;

  try {
      // Update the servicecall table with payment details
      const query = `
          UPDATE servicecall
          SET payment = $1, payment_type = $2
          WHERE notification_id = $3
      `;
 
      await client.query(query, [totalAmount, paymentMethod, decodedId]);
      

      const userIdDetails =  await client.query(
        "SELECT user_id, worker_id FROM notifications WHERE notification_id = $1",
        [decodedId]
      );

      const userId = userIdDetails.rows[0].user_id
      const workerId = userIdDetails.rows[0].worker_id
      const serviceResult = await updateWorkerLifeDetails(workerId, totalAmount);
      
      const fcmTokenResult = await client.query(
        "SELECT fcm_token FROM userfcm WHERE user_id = $1",
        [userId]
      );

      const fcmTokens = fcmTokenResult.rows.map(row => row.fcm_token);
      console.log(fcmTokens);
      
      if (fcmTokens.length > 0) {
        // Create a multicast message object for all tokens
        const multicastMessage = {
          tokens: fcmTokens, // An array of tokens to send the same message to
          notification: {
            title: "Click Solver",
            body: `Your payment has been successfully processed.`,
          },
          data: {
            notification_id: decodedId.toString(),
            screen:'Home'
          },
        };
      
        try {
          // Use sendEachForMulticast to send the same message to multiple tokens
          const response = await getMessaging().sendEachForMulticast(multicastMessage);
      
          // Log the responses for each token
          response.responses.forEach((res, index) => {
            if (res.success) {
              console.log(`Message sent successfully to token ${fcmTokens[index]}`);
            } else {
              console.error(`Error sending message to token ${fcmTokens[index]}:`, res.error);
            }
          });
      
          console.log('Success Count:', response.successCount);
          console.log('Failure Count:', response.failureCount);
      
        } catch (error) {
          console.error('Error sending notifications:', error);
        }
      } else {
        console.error('No FCM tokens to send the message to.');
      }
      


      res.status(200).json({ message: 'Payment processed successfully' });
  } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ error: 'An error occurred while processing the payment' });
  }
};

const submitFeedback = async (req, res) => {
  const { notification_id, rating, comments } = req.body;

  try {
    // Step 1: Fetch worker_id, user_id, user_notification_id, user name, and worker name in a single query
    const query = `
      SELECT 
        n.worker_id, 
        n.user_id, 
        n.user_notification_id, 
        u.name as user_name, 
        w.name as worker_name 
      FROM 
        notifications n
      JOIN 
        "user" u ON n.user_id = u.user_id
      JOIN 
        workers w ON n.worker_id = w.worker_id
      WHERE 
        n.notification_id = $1
    `;
    
    const notificationResult = await client.query(query, [notification_id]);

    if (notificationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Notification ID not found' });
    }

    const { worker_id, user_id, user_notification_id, user_name, worker_name } = notificationResult.rows[0];

    // Step 2: Insert feedback into the feedback table
    const insertFeedbackQuery = `
      INSERT INTO feedback (notification_id, worker_id, user_id, user_notification_id, name, worker_name, rating, comment, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    const insertFeedbackResult = await client.query(insertFeedbackQuery, [
      notification_id,
      worker_id,
      user_id,
      user_notification_id,
      user_name,
      worker_name,
      rating,
      comments
    ]);

    // Step 3: Fetch FCM tokens for the user to send notifications
    const fcmTokenResult = await client.query(
      "SELECT fcm_token FROM userfcm WHERE user_id = $1",
      [user_id]
    );

    const fcmTokens = fcmTokenResult.rows.map(row => row.fcm_token);

    if (fcmTokens.length > 0) {
      // Prepare multicast message
      const multicastMessage = {
        tokens: fcmTokens,
        notification: {
          title: "Click Solver",
          body: "Thanks for giving feedback to us, have a nice day.",
        },
        data: {
          user_notification_id: notification_id.toString(),
        },
      };

      try {
        const response = await getMessaging().sendEachForMulticast(multicastMessage);
        
        response.responses.forEach((res, index) => {
          if (res.success) {
            console.log(`Message sent successfully to token ${fcmTokens[index]}`);
          } else {
            console.error(`Error sending message to token ${fcmTokens[index]}:`, res.error);
          }
        });

        console.log('Success Count:', response.successCount);
        console.log('Failure Count:', response.failureCount);
      } catch (error) {
        console.error('Error sending notifications:', error);
      }
    } else {
      console.error('No FCM tokens to send the message to.');
    }

    // Step 4: Send response after feedback submission and notification sending
    res.status(201).json({ message: 'Feedback submitted successfully', feedback: insertFeedbackResult.rows[0] });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const sendSMSVerification = async (req, res) => {
  const { phoneNumber } = req.body;

  // Generate a random 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  const message = `Your verification code is ${verificationCode}`;

  const authString = Buffer.from(`${customerId}:${apiKey}`).toString('base64');

  try {
    // Send SMS using Telesign API
    const response = await axios.post(
      smsEndpoint,
      {
        phone_number: phoneNumber,
        message: message,
        message_type: 'OTP',
      },
      {
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // On success, return the verification code (for testing purposes)
    res.status(200).json({ success: true, verificationCode });
  } catch (error) {
    // On failure, log and return the error
    console.error('Error sending SMS:', error.response ? error.response.data : error.message);
    res.status(500).json({ success: false, message: 'Error sending SMS' });
  }
};





// Function to get worker details
// Function to get worker details
const workerDetails = async (req, res, notification_id) => {
  try {
    // Combine queries using JOIN
    const query = `
      SELECT 
        w.name AS worker_name, 
        u.service AS service 
      FROM 
        notifications n
      JOIN 
        workers w ON n.worker_id = w.worker_id
      JOIN 
        usernotifications u ON n.user_notification_id = u.user_notification_id
      WHERE 
        n.notification_id = $1
    `;

    const result = await client.query(query, [notification_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification or related data not found' });
    }

    const { worker_name, service } = result.rows[0];

    // Return the worker's name and service
    res.json({ name: worker_name, service });
  } catch (error) {
    console.error('Error checking worker details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getServiceCompletedDetails = async (req, res) => {
  const {notification_id} = req.body

  try {
    // Combine queries using JOIN
    const query = `
      SELECT 
        n.service, 
        n.longitude, 
        n.latitude, 
        sc.payment, 
        sc.payment_type, 
        un.city, 
        un.pincode, 
        un.area, 
        u.name
      FROM 
        notifications n
      JOIN 
        servicecall sc 
      ON 
        n.notification_id = sc.notification_id
      JOIN 
        usernotifications un 
      ON 
        n.user_notification_id = un.user_notification_id
      JOIN 
        "user" u 
      ON 
        un.user_id = u.user_id
      WHERE 
        n.notification_id = $1;

    `;

    const result = await client.query(query, [notification_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification or related data not found' });
    }

    const { payment, payment_type,service,longitude,latitude,area,city,pincode,name } = result.rows[0];

    // Return the worker's name and service
    res.json({ payment, payment_type,service,longitude,latitude,area,city,pincode,name });
  } catch (error) {
    console.error('Error checking worker details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function convertToDateString(isoDate) {
  if (!isoDate) {
      // Handle case where isoDate is null or undefined
      return null;
  }
  
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) {
      // Handle invalid date format
      return null;
  }

  // Extract year, month, day, hours, minutes, seconds, and milliseconds
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  // Return the formatted date string
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

const getWorkerEarnings = async (req, res) => {
const { date } = req.body;
const workerid = req.worker.id;

// Convert the selectedDate to the required format or return a response if invalid
const selectDate = convertToDateString(date);
console.log(selectDate)

if (!selectDate) {
  return res.status(400).json({ error: 'Invalid date format' });
}

try {
  // Combine queries using JOIN
//   const query = `
//   SELECT 
//     SUM(payment) AS total_payment,
//     SUM(CASE WHEN payment_type = 'cash' THEN payment ELSE 0 END) AS cash_payment,
//     COUNT(*) AS payment_count
//   FROM (
//     SELECT 
//       payment,
//       payment_type,
//       ROW_NUMBER() OVER (ORDER BY RANDOM()) AS row_num
//     FROM servicecall
//     WHERE worker_id = $1
//       AND payment IS NOT NULL
//       AND DATE(end_time) BETWEEN DATE($2) AND DATE(CURRENT_DATE)
//   ) s;
// `;

const query = `
  SELECT 
    SUM(payment) AS total_payment, 
    SUM(CASE WHEN payment_type = 'cash' THEN payment ELSE 0 END) AS cash_payment, 
    COUNT(*) AS payment_count,
    (SELECT SUM(payment) 
     FROM servicecall 
     WHERE worker_id = $1
       AND payment IS NOT NULL
    ) AS lifeEarnings, 
    (SELECT AVG(rating) 
     FROM feedback 
     WHERE worker_id = $1
    ) AS avgRating, 
    (SELECT COUNT(*) 
     FROM notifications 
     WHERE worker_id = $1
       AND status = 'reject'
       AND DATE(created_at) BETWEEN DATE($2) AND DATE(CURRENT_DATE)
    ) AS rejectedCount, -- Subquery for counting 'rejected' statuses
    (SELECT COUNT(*) 
     FROM notifications 
     WHERE worker_id = $1
       AND status = 'pending'
       AND DATE(created_at) BETWEEN DATE($2) AND DATE(CURRENT_DATE)
    ) AS pendingCount, -- Subquery for counting 'pending' statuses
    (SELECT EXTRACT(EPOCH FROM SUM(CAST(time_worked AS INTERVAL))) / 3600
     FROM servicecall
     WHERE worker_id = $1
       AND time_worked IS NOT NULL
       AND DATE(end_time) BETWEEN DATE($2) AND DATE(CURRENT_DATE) -- Filter for time_worked within date range
    ) AS total_time_worked_hours -- Subquery for summing time_worked in hours
  FROM (
    SELECT 
      payment, 
      payment_type, 
      ROW_NUMBER() OVER (ORDER BY RANDOM()) AS row_num
    FROM servicecall
    WHERE worker_id = $1
      AND payment IS NOT NULL
      AND DATE(end_time) BETWEEN DATE($2) AND DATE(CURRENT_DATE)
  ) s;
`;






  const result = await client.query(query, [workerid, selectDate]);
  console.log(result.rows[0])
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Notification or related data not found' });
  }
  const { total_payment,payment_count,cash_payment,average_rating,lifeearnings,avgrating,rejectedcount,pendingcount } = result.rows[0];

  // Return the worker's name and service
  res.json({ total_payment, cash_payment,payment_count,average_rating,lifeearnings,avgrating,rejectedcount,pendingcount});
} catch (error) {
  console.error('Error checking worker details:', error);
  res.status(500).json({ error: 'Internal server error' });
}
};


const getWorkDetails = async (req, res) => {
  const { notification_id } = req.body;
  console.log(notification_id)

  try {
    const queryText = `
      SELECT 
        n.service, 
        un.city, 
        un.area, 
        un.pincode 
      FROM 
        notifications n
      JOIN 
        usernotifications un 
      ON 
        n.user_notification_id = un.user_notification_id
      WHERE 
        n.notification_id = $1;
    `;
    const queryValues = [notification_id];

    const result = await client.query(queryText, queryValues);

    if (result.rows.length > 0) {
      const workDetails = result.rows[0];
      res.status(200).json(workDetails);
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error fetching work details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  addUser,
  getElectricianServices,
  verifyOTP,
  getServices,
  getPlumberServices,
  getCleaningServices,
  getPaintingServices,
  getVehicleServices,
  login,
  storeUserLocation,
  getUserByIdParams,
  storeFireBaseCloudToken,
  sendNotification,
  addWorker,
  storeWorkerLocation,
  storeFcmToken,
  getWorkersNearby,
  Partnerlogin,
  workerAuthentication,
  acceptRequest,
  rejectRequest,
  checkStatus,
  getServicesBySearch,
  getLocationDetails,
  userCancelNavigation,
  cancelRequest,
  checkCancellationStatus,
  updateUserNavigationStatus,
  fetchLocationDetails,
  workerCancelNavigation,
  workerCancellationStatus,
  userCancellationStatus,
  getUserAddressDetails,
  updateWorkerLocation,
  workerVerifyOtp,
  startStopwatch,
  stopStopwatch,
  getTimerValue,
  paymentDetails,
  calculatePayment,
  getWorkDetails,
  subservices,
  skillWorkerRegistration,
  workerLifeDetails,
  registrationStatus,
  updateWorkerLifeDetails,
  getWorkerNavigationDetails,
  workerProfileDetails,
  getVerificationStatus,
  workerDetails,
  submitFeedback,
  processPayment,
  getUserBookings,
  loginStatus,
  UserController,
  updateOrInsertWorkerScreen,
  getUserCurrentRoute,
  createUserAction,
  getUserTrackRoute,
  getWorkerTrackRoute,
  createWorkerAction,
  storeNotification,
  getWorkerNotifications,
  storeUserFcmToken,
  storeUserNotification,
  getUserNotifications,
  getIndividualServices,
  userUpdateLastLogin,
  workCompletedRequest,
  TimeStart,
  CheckStartTime,
  serviceCompleted,
  checkTaskStatus,
  getTimeDifferenceInIST,
  workCompletionCancel,
  getAllLocations,
  userActionRemove,
  getWorkerBookings,
  sendSMSVerification,
  sendOtp,
  validateOtp,
  getServiceByName,
  getWorkerProfleDetails,
  getWorkerReviewDetails,
  getPaymentDetails,
  getServiceCompletedDetails,
  getWorkerEarnings,
  getUserAndWorkerLocation,
  userNavigationCancel
};
