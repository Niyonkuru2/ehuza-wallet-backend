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

// GET monthly aggregated transaction history (deposit and withdraw)
export const getMonthlyTransactionHistory = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Fetch the user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) return res.status(404).json({ success: false, message: "Wallet not found" });

    // Get monthly aggregated data (sum of deposits and withdrawals for each month)
    const monthlyData = await prisma.transaction.groupBy({
      by: ['createdAt'], // Group by the createdAt field
      where: { walletId: wallet.walletId },
      _sum: {
        amount: true, // Sum the amounts of deposit/withdraw
      },
      having: {
        createdAt: {
          gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), // Only get transactions from the last year (optional)
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Format the data into a format suitable for the frontend (monthly comparison)
    const monthlyComparisonData = monthlyData.map((item) => ({
      month: item.createdAt.getMonth() + 1, // Get the month (1-12)
      deposit: item._sum.amount > 0 ? item._sum.amount : 0, // Aggregate deposits
      withdraw: item._sum.amount < 0 ? Math.abs(item._sum.amount) : 0, // Aggregate withdrawals (positive value)
    }));

    res.status(200).json({
      success: true,
      monthlyTransactions: monthlyComparisonData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
