import AppError from "../utils/AppError.js";
import asyncHandler from "./asyncHandler.middleware.js";


export const isLoggedIn = asyncHandler(async(req, res, next) => {
    // extracting token from the cookies
    const { token } = req.cookies;

    // If no token send unauthorized message
    if (!token) {
        return next(new AppError('Unauthenticated, please login', 401))
    }

    // Decoding the token using jwt package verify method
    const tokenDetails = await jwt.verify(token, process.env.JWT_SECRET);

    // If no decode send the message unauthorized
    if (!tokenDetails) {
        return next(new AppError('Unauthenticated, please login', 401));
    }

    // If all good store the id in req object, here we are modifying the request object and adding a custom field user in it
    req.user = tokenDetails;

    // Do not forget to call the next other wise the flow of execution will not be passed further
    next();
});

// Middleware to check if user is admin or not
export const authorizedRoles = (...roles) => asyncHandler(async (req, res, next) => {
    const currentRole = req.user.role;
    if (!roles.includes(currentRole)) {
        return next(
            new AppError('You dont have permission to access tothis route', 403)
        );
    }
    next();
});

// Middleware to check if user has an active subscription or not
export const authorizedSubscriber = asyncHandler(async (req, res, next) => {
     // If user is not admin or does not have an active subscription then error else pass
    const subscriptionStatus = req.user.subscription.status;
    const currentRole = req.user.role;
    if (currentRole !== 'ADMIN' && subscriptionStatus !== 'active') {
        return next(
            new AppError(
                'Please subscribe to access this route ', 403));
    }

    next();
});

