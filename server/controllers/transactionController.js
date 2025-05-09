import prisma from "../lib/prisma.js";
// GET  at least 10 transctions
export const getTransactionHistory = async (req, res) => {
  const userId = req.user.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet)return res.status(404).json({ success:false,message: "Wallet not found" });
    

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { walletId: wallet.walletId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({
        where: { walletId: wallet.walletId },
      })
    ]);

    res.status(200).json({
      success:true,
      transactions
    });

  } catch (error) {
    res.status(500).json({ message: error.message});
  }
};
