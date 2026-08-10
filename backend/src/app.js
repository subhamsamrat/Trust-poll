import express from 'express';
import auth_router from './modules/auth/auth.rout.js';
import errorMiddleware from './common/middleware/error.middleware.js';
import cookieParser from 'cookie-parser';
import poll_router from './modules/poll/poll.router.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', auth_router); 
app.use('/api/poll',poll_router);
//app.use('/api/poll/answer',);

app.use(errorMiddleware);

export default app; 