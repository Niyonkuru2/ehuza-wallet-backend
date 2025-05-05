import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { cloudinary } from '../config/cloudinary.js';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET

//Register user controller
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if(!name || !email || !password) return res.status(400).json({success:false, message:"All Fields Are Required"})

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({success:false, message: 'Existing user with this email Id' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({success:true, message: 'User registered successfully', userId: user.userId });
  } catch (error) {
    res.status(500).json({success:false, message:error.message });
  }
};

//Login User Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({success:false, message:"All Fields Are Required"})

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({success:false, message: 'User Not Foumd' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success:false, message:'Invalid Password' });

    const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token, success:true, message:"Login successfully" });
  } catch (error) {
    res.status(500).json({success:false, message: error.message });
  }
};

// request ResetPassword Controller
export const RequestResetPassword = async(req,res)=>{
 try {
  const {email} = req.body;
  if(!email) return res.status(400).json({success:false,message:"email is required"})
  const user = await prisma.user.findUnique({where:{email}})
  if(!user) return res.status(400).json({success:false, message:"User Not Found"})

    const token = jwt.sign({ id: user.userId }, JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Send the reset link via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset',
      text: `Click the link to reset your password: ${resetLink}`
    };

    await transporter.sendMail(mailOptions);

    res.send({
      success: true,
      message: 'Password reset link sent'
    });
  } catch (error) {
  res.status(500).json({success:false,message:error.message})
 }
}

// Reset password controller
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if(!email || !newPassword) return res.status(400).json({success:false,message:"All fields Are required"})
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({success:false, message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({success:true, message: 'Password changed successful' });
  } catch (error) {
    res.status(500).json({success:false,message:error.message });
  }
};

//Get user profile controller
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const profileInfo = await prisma.user.findUnique({
      where: { userId },
      select:{
        userId: true,
        name: true,
        email: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ success: true, profileInfo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


//Update user profile controller
export const updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.userId;

    // Check if the email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.userId !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user',
        });
      }
    }

    let imageUrl;
    if (req.file) {
      // upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'user_images',
      });
      imageUrl = result.secure_url;
    }

    // Prepare data to update
    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(imageUrl && { imageUrl }),
    };

    // Hash and add password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { userId},
      data: updateData,
    });

    res.status(200).json({success:true,updatedUser});
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
