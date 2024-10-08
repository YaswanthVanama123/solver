const express = require("express");
const app = express();
const {
  sendOtp,
  validateOtp,
  verifyOTP,
  getUsers,
  getUserById,
  addUser,
  getElectricianServices,
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
  serviceCompleted,
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
  workCompletionCancel,
  checkTaskStatus,
  getTimeDifferenceInIST,
  getAllLocations,
  userActionRemove,
  getWorkerBookings,
  sendSMSVerification,
  getServiceByName,
  getWorkerProfleDetails,
  getWorkerReviewDetails,
  getPaymentDetails,
  getServiceCompletedDetails,
  getWorkerEarnings,
  getUserAndWorkerLocation,
  userNavigationCancel
} = require("./controller.js");

const router = express.Router();
const { authenticateToken } = require("./src/middlewares/authMiddleware.js");
const {
  authenticateWorkerToken,
} = require("./src/middlewares/authworkerMiddleware.js");

// Define the route for getting service details
router.post('/single/service', getServiceByName);

// Route to get all users
router.get("/users", async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/service/location/navigation",getUserAndWorkerLocation);

// Route to fetch location details and initiate /canceled/timeup
router.get("/user/location/navigation", async (req, res) => {
  try {
    const { notification_id } = req.query;

    if (!notification_id) {
      return res.status(400).json({ error: "Missing notification_id" });
    }

    const locationDetails = await fetchLocationDetails(notification_id);
    // console.log(`location start and end ${JSON.stringify(locationDetails, null, 2)}`);
    res.json(locationDetails);

    // Start the interval to update user_navigation_cancel_status to 'timeup' after 2 minutes
    if (notification_id && !intervalSetForNotifications.has(notification_id)) {
      console.log("userlocationpath");
      intervalSetForNotifications.add(notification_id);
      setTimeout(
        () => updateUserNavigationStatus(notification_id),
        2 * 60 * 1000
      ); // 2 minutes
    }
  } catch (err) {
    console.error("Error fetching location details:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get a user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const user = await getUserByIdParams(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// Route to add a new user
router.post("/users", async (req, res) => {
  try {
    const newUser = await addUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Define the route for processing payment
router.post('/user/payed', processPayment);

// Route to add a new user
router.post("/add/worker", async (req, res) => {
  try {
    const newWorker = await addWorker(req.body);
    res.status(201).json(newWorker);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// router.post('/login', async (req,res) => {
//     try {
//         const user = await login(req.body);
//         if (user) {
//          res.json(user);
//         } else {
//             res.status(404).json({ error: 'user not found' });
//         }
//         } catch (err) {
//             res.status(500).json({ error: 'Server error' });
//             }
// })

router.post("/subservice/checkboxes", subservices);

router.get('/worker/verification/status', getVerificationStatus);

router.post("/login", login);

router.post("/pin/verification", workerVerifyOtp);

router.post("/worker/login", Partnerlogin);

router.post('/timer/value', getTimerValue);

// router.post('/payment/details', async (req, res) => {
//   const {notification_id} = req.body

//   const { start_time, end_time, time_worked } = await paymentDetails(notification_id);

//   const totalAmount = calculatePayment(time_worked);
//   res.json({
//       start_time,
//       end_time,
//       time_worked,
//       totalAmount
//   });
// });


router.post('/worker/payment/scanner/details', async (req, res) => {
  const {notification_id} = req.body
  console.log(notification_id)
  const { start_time, end_time} = await paymentDetails(notification_id);
  console.log(start_time)
  const {time_worked} = getTimeDifferenceInIST(start_time,end_time)
  const totalAmount = calculatePayment(time_worked);
  const {name,service} = await getPaymentDetails(notification_id)
  res.json({
       totalAmount,
       name,
       service,
       
  });
});

router.post('/worker/payment/service/completed/details', getServiceCompletedDetails);

router.post('/worker/earnings',authenticateWorkerToken, getWorkerEarnings);



router.post('/payment/details', async (req, res) => {
  const {notification_id} = req.body

  const { start_time, end_time} = await paymentDetails(notification_id);
  console.log(start_time)
  const {time_worked} = getTimeDifferenceInIST(start_time,end_time)
  const totalAmount = calculatePayment(time_worked);
  res.json({
      start_time,
      end_time,
      time_worked,
       totalAmount
  });
});

router.post('/worker/details/rating', async (req, res) => {
  const { notification_id } = req.body;

  await workerDetails(req, res, notification_id);
});

router.post('/user/feedback', submitFeedback);

router.post("/work/time/started", CheckStartTime);

//router.post("/worker/details/rating",workerDetails)



router.post("/worker/navigation/details",getWorkerNavigationDetails);

router.post("/individual/service",getIndividualServices);

router.post("/work/time/completed", async (req, res) => {
  const { notification_id } = req.body;
  try {
    // Stop stopwatch and get worker_id
    const workerId = await stopStopwatch(notification_id);

    // Get time_worked and calculate totalAmount
    const { time_worked } = await paymentDetails(notification_id);
    const totalAmount = calculatePayment(time_worked);

    // Update worker life details
    const updatedWorkerLife = await updateWorkerLifeDetails(workerId, totalAmount);

    res.status(200).json({
      message: 'Worker life details updated successfully',
      updatedWorkerLife
    });
  } catch (error) {
    console.error('Error processing work time completion:', error);
    res.status(500).json({ error: error.message });
  }
});



// router.post("/work/time/start", async (req, res) => {
//   const { notification_id } = req.body;
//   console.log(notification_id);
//   if (!notification_id) {
//     return res.status(400).json({ error: "notification_id is required" });
//   }

//   try {
//     const result = await startStopwatch(notification_id);
//     console.log(result);
//     res.status(200).json({ worked_time: result });
//   } catch (error) {
//     console.error("Error starting stopwatch:", error);
//     res.status(500).json({ error: "Failed to start stopwatch" });
//   }
// });



// Route to get electrician services
router.get("/electrician/services", async (req, res) => {
  try {
    const services = await getElectricianServices();
    if (services) {
      res.json(services);
    } else {
      res.status(404).json({ error: "Electrician services not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get plumber services
router.get("/plumber/services", async (req, res) => {
  try {
    const services = await getPlumberServices();
    if (services) {
      res.json(services);
    } else {
      res.status(404).json({ error: "plumber services not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get plumber services
router.get("/cleaning/services", async (req, res) => {
  try {
    const services = await getCleaningServices();
    if (services) {
      res.json(services);
    } else {
      res.status(404).json({ error: "cleaning services not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get plumber services
router.get("/painting/services", async (req, res) => {
  try {
    const services = await getPaintingServices();
    if (services) {
      res.json(services);
    } else {
      res.status(404).json({ error: "painting services not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get plumber services
router.get("/vehicle/services", async (req, res) => {
  try {
    const services = await getVehicleServices();
    if (services) {
      res.json(services);
    } else {
      res.status(404).json({ error: "vehicle services not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get all services
router.get("/servicecategories", async (req, res) => {
  try {
    const users = await getServices();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



router.post("/validate-token", authenticateToken, (req, res) => {
  res.json({ isValid: true });
});



// Route to send OTP
// router.post("/phonenumber", sendOtp);

// POST request to send OTP
router.post('/otp/send', sendOtp);

// GET request to validate OTP
router.get('/validate', validateOtp);




// Route to verify OTP
router.post("/otp-verify", verifyOTP);

router.get("/location/navigation", getLocationDetails);

// Route to fetch location details and initiate navigation
// Set to store ongoing intervals
const intervalSetForNotifications = new Set();



router.get("/locations",getAllLocations)
 
router.get("/user/login/status",authenticateToken,loginStatus)

router.get("/get/user", authenticateToken, getUserById);
 
router.get('/user/bookings',authenticateToken, getUserBookings);

// Route to send SMS verification
router.post('/send-sms', sendSMSVerification);

router.get('/worker/bookings',authenticateWorkerToken, getWorkerBookings);

router.get('/worker/profile/details',authenticateWorkerToken, getWorkerProfleDetails);

router.get('/worker/ratings',authenticateWorkerToken, getWorkerReviewDetails);

router.post("/store/csm/token", authenticateToken, storeFireBaseCloudToken);

router.post("/work/time/completed/request",workCompletedRequest)

router.post("/user/location", authenticateToken, storeUserLocation);

router.post("/worker/location", storeWorkerLocation);

router.post("/worker/store-fcm-token", authenticateWorkerToken, storeFcmToken);

router.post("/user/store-fcm-token", authenticateToken, storeUserFcmToken);

router.post('/worker/store-notification',authenticateWorkerToken, storeNotification);

router.post('/user/store-notification',authenticateToken, storeUserNotification);
 
router.get('/user/current/route', authenticateToken, getUserCurrentRoute);

router.get('/user/track/details', authenticateToken, getUserTrackRoute);

router.get('/worker/track/details', authenticateWorkerToken, getWorkerTrackRoute);

router.get('/worker/notifications', authenticateWorkerToken, getWorkerNotifications);
 
 router.get('/user/notifications', authenticateToken, getUserNotifications);

router.post('/user/action', authenticateToken,createUserAction); 

router.post('/user/action/cancel',authenticateToken,userActionRemove)

router.post('/worker/action', authenticateWorkerToken,createWorkerAction);

router.post('/worker/screen', authenticateWorkerToken,updateOrInsertWorkerScreen);

router.post('/updating/user/screen',authenticateToken, UserController);

router.post("/worker/skill/registration/filled",authenticateWorkerToken,skillWorkerRegistration)

router.get("/worker/life/details",authenticateWorkerToken,workerLifeDetails)

router.post("/profile",authenticateWorkerToken,workerProfileDetails)


// Define the route for fetching user bookings
router.get("/",(req,res) =>{
   res.status(200).json("working")
})

router.post("/user/cancellation", cancelRequest); 

// Define the route for cancelling the navigation
router.post("/user/tryping/cancel", userCancelNavigation);

// Define the route for cancelling the navigation
router.post("/user/work/cancel", userNavigationCancel);

router.post("/registration/status",authenticateWorkerToken,registrationStatus);

router.post("/worker/tryping/cancel", workerCancelNavigation);

router.get("/user/cancelled/status", workerCancellationStatus);

router.get("/worker/cancelled/status", userCancellationStatus);

// Route definitions
router.get("/api/location/navigation", getLocationDetails);

router.post(
  "/worker/location/update",
  authenticateWorkerToken,
  updateWorkerLocation
);



router.get("/cancelation/navigation/status", checkCancellationStatus);



router.post("/cancelation/navigation/status", async (req, res) => {
  const { notification_id } = req.body;
  try {
    await pool.query(
      "UPDATE notifications SET navigation_status = 'cancel' WHERE notification_id = $1",
      [notification_id]
    );
    res.json({ message: "Navigation status updated to cancel" });
  } catch (error) {
    console.error("Error updating cancellation status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(
  "/worker/authenticate",
  authenticateWorkerToken,
  workerAuthentication
);

router.post("/user/active/update",authenticateWorkerToken, userUpdateLastLogin);

router.post("/accept/request", authenticateWorkerToken, acceptRequest);

router.post("/work/completion/cancel", workCompletionCancel);

router.post("/worker/details", getWorkDetails);
 
router.post("/worker/confirm/completed", serviceCompleted);


router.post("/reject/request", authenticateWorkerToken, rejectRequest);
 
router.get("/checking/status", checkStatus);

router.post("/task/confirm/status", checkTaskStatus);


router.get("/user/address/details", getUserAddressDetails);

// router.get('/workers-nearby/:user_id', getWorkersNearby);
 
router.post("/workers-nearby", authenticateToken, getWorkersNearby);

router.post("/send-notification", async (req, res) => {
  const { token, title, body } = req.body;

  try {
    // Validate and send notification using Firebase Admin SDK
    const response = await sendNotification(token, { title, body });
    console.log("Notification sent successfully:", response);
    res
      .status(200)
      .json({ message: "Notification sent successfully", response });
  } catch (error) {
    console.error("Error sending notification:", error);
    res
      .status(500)
      .json({ message: "Error sending notification", error: error.message });
  }
});

router.get("/services", getServicesBySearch);

module.exports = router;
