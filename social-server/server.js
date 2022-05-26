import express from 'express';
import path from 'path';
import connectDB from './config/db';
import dotenv from 'dotenv';
import colors from 'colors';
import morgan from 'morgan';
import passport from 'passport';
import { errorHandler, notFound } from './middleware/errorMiddleware';

// Import Routes
import indexRouter from './routes/index';
import userRouter from './routes/usersRoutes';
import postRouter from './routes/postsRoutes';
import uploadRouter from './routes/uploadRoutes';

dotenv.config();

connectDB();

const app = express();

// Router 
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

// <--- Routes --->
app.get('/', (req, res) => {
    res.send('Server API running....')
});

const __dirname = path.resolve();
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/upload', uploadRouter);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// <--- Middleware Error Handler --->
app.use(notFound);
app.use(errorHandler);

// <--- Server --->
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.blue.bold.inverse);
});