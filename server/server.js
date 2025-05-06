import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import walletRoute from './routes/walletRoute.js';
import transactionRoute from './routes/transactionRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/wallet', walletRoute);
app.use('/api/transactions', transactionRoute);

app.get('/',(req,res)=>{
    res.send("Express server is running")
})

const PORT = process.env.PORT || 5070;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
