import prisma from '../lib/prisma.js';

// Get wallet Balance
export const getWalletBalance = async (req, res) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.userId },
    });

    if (!wallet) return res.status(404).json({success:true, message: "Wallet not found" });

    res.status(200).json({ balance: wallet.balance });
  } catch (error) {
    res.status(500).json({success:false,message:message.error });
  }
};

//deposit money
export const depositMoney = async (req, res) => {
  const { amount, description } = req.body;
  if(!amount,!description) return res.status(400).json({success:false, message: "All fields are required" });

  if (amount <= 0) return res.status(400).json({success:false, message: "Amount must be greater than zero" });

  try {
    const updatedWallet = await prisma.wallet.update({
      where: { userId: req.user.userId },
      data: {
        balance: { increment: amount },
        transactions: {
          create: {
            amount,
            type: 'deposit',
            description,
          }
        }
      },
    });

    res.status(200).json({success:true, message: "Deposit successful", balance: updatedWallet.balance });
  } catch (error) {
    res.status(500).json({success:false,message:error.message});
  }
};

//withdrawing money
export const withdrawMoney = async (req, res) => {
  const { amount, description } = req.body;
  if(!amount,!description) return res.status(400).json({success:false, message: "All fields are required" });

  if (amount <= 0)return res.status(400).json({success:false, message: "Amount must be greater than zero" });
  

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.userId },
    });

    if (!wallet || wallet.balance < amount) return res.status(400).json({success:false, message: "Insufficient balance" });
    

    const updatedWallet = await prisma.wallet.update({
      where: { userId: req.user.userId },
      data: {
        balance: { decrement: amount },
        transactions: {
          create: {
            amount,
            type: 'withdraw',
            description,
          }
        }
      },
    });

    res.status(200).json({success:true, message: "Withdrawal successful", balance: updatedWallet.balance });
  } catch (error) {
    res.status(500).json({ success:false,message:error.message });
  }
};
