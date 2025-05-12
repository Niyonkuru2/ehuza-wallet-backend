import express from 'express';
import { getMonthlyTransactionHistory, getTransactionHistory } from '../controllers/transactionController.js';
import authUser from '../middleware/AuthMiddleware.js';

const transactionRoute = express.Router();

transactionRoute.get('/', authUser, getTransactionHistory);
transactionRoute.get('/comparision', authUser, getMonthlyTransactionHistory);

export default transactionRoute;
