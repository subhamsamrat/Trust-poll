import express from 'express';
import auth_router from './modules/auth/auth.rout.js';
import errorMiddleware from './common/middleware/error.middleware.js';
import cookieParser from 'cookie-parser';
import poll_router from './modules/poll/poll.router.js';
import cors from 'cors';

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Alternatively allow all in dev, or allow matched
  },
  credentials: true, // Allow cookies to be sent
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Trust Poll'
  });
});

app.use('/api/auth', auth_router); 
app.use('/api/poll', poll_router);
//app.use('/api/poll/answer',);

app.use(errorMiddleware);

export default app;
