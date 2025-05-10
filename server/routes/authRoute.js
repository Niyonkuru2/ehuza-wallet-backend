import express from 'express';
import upload  from '../config/upload.js';
import {register, login, resetPassword,updateUser, RequestResetPassword, getUserProfile } from '../controllers/authController.js';
import  authUser  from '../middleware/AuthMiddleware.js';

const authRoute = express.Router();

authRoute.post('/register', register);
authRoute.post('/login', login);
authRoute.post('/request-reset-password', RequestResetPassword);
authRoute.post('/reset-password/:token', resetPassword);
authRoute.get('/profile',authUser,getUserProfile)
authRoute.put('/update',authUser, upload.single('image'), updateUser);

export default authRoute;
