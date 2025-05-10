import express from 'express';
import { getTransactionHistory } from '../controllers/transactionController.js';
import authUser from '../middleware/AuthMiddleware.js';

const transactionRoute = express.Router();

transactionRoute.get('/', authUser, getTransactionHistory);

export default transactionRoute;
