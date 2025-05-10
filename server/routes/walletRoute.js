import express from 'express';
import {
  getWalletBalance,
  depositMoney,
  withdrawMoney
} from '../controllers/walletController.js';
import authUser from '../middleware/AuthMiddleware.js';

const walletRoute = express.Router();

walletRoute.get('/', authUser, getWalletBalance);
walletRoute.post('/deposit',authUser, depositMoney);
walletRoute.post('/withdraw', authUser, withdrawMoney);

export default walletRoute;
