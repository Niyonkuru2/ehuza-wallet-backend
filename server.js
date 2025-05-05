import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoute from './routes/authRoute.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/user', authRoute);

app.get('/',(req,res)=>{
    res.send("Express server is running")
})

const PORT = process.env.PORT || 5070;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
