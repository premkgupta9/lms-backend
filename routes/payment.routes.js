import { Router } from "express";
import { buySubscription, cancelSubscription, getAllPayments, getRazorpayApiKey, verifySubscription } from "../controllers/payment.controller.js";
import { authorizedRoles, authorizedSubscriber, isLoggedIn } from "../middleware/auth.middleware.js";

const router = Router();

router
      .route('/razorpay-key')
      .get( isLoggedIn,getRazorpayApiKey);

router
      .route('/subscribe')
      .post(isLoggedIn,buySubscription);

router
       .route('/verify')
       .post(isLoggedIn,verifySubscription);

router
       .route('/unsubscribe')
       .post(isLoggedIn, authorizedSubscriber,cancelSubscription);

router
       .route('/')
       .get(isLoggedIn, authorizedRoles('ADMIN'),getAllPayments);


       export default router;