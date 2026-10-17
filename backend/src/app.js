import express from 'express';
import auth_router from './modules/auth/auth.rout.js';
import errorMiddleware from './common/middleware/error.middleware.js';
import cookieParser from 'cookie-parser';
import poll_router from './modules/poll/poll.router.js';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true, // Allow cookies to be sent
}));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Trust Poll'
  });
});

app.use('/api/auth', auth_router); 
app.use('/api/poll',poll_router);
//app.use('/api/poll/answer',);

app.use(errorMiddleware);

export default app; 