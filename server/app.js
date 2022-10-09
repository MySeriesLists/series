import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config({ path: '../.env' });
const app = express();


// use route of Auth
import userRouter from './routes/user.js';
import profile from './routes/profile.js';
import movies from './routes/movies.js';

import cors from 'cors';
app.use(express.json());
app.use(cookieParser()); 
app.use(cors());

// use route of Auth
app.use('/auth', userRouter);
app.use('/profile', profile);
app.use('/movies', movies);

app.get('/', (req, res) => {
    return res.send('Hello World!');
});

app.listen(process.env.PORT || 8080, () => {
    console.log(`Server is running on port: ${process.env.PORT} at ${new Date()}`);
});


