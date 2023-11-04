import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorMiddleware from './middleware/error.middleware.js';
import morgan from 'morgan';




const app = express();

// Middlewares
// Built-In
app.use(express.json());

// app.use(express.urlencoded({ extended: true }));

// // Third-Party
// app.use(cors({
//     origin: [process.env.FRONTEND_URL],
//     Credentials: true
// }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });
    

app.use(morgan('dev'));
app.use(cookieParser());

// Server Status Check Route
app.get('/ping', (req, res) => {
    res.send('pong');
});

// Import all routes
import courseRoutes from './routes/course.routes.js';
import paymentRoutes from './routes/payment.routes.js'
import userRoutes from './routes/user.routes.js';
import miscRoutes from './routes/miscellaneous.routes.js';

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1', miscRoutes);

// Default catch all route - 404
app.all('*', (req, res) => {
    res.status(404).send('OOPS!404 page not found') 
});

// Custom error handling middleware
app.use(errorMiddleware);

export default app;