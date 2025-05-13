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
    success: true,
    transactions,
    total,
    page,
    totalPages: Math.ceil(total / limit)
});


  } catch (error) {
    res.status(500).json({ message: error.message});
  }
};


// GET monthly aggregated transaction history (deposit and withdraw)
export const getMonthlyTransactionHistory = async (req, res) => {
  const userId = req.user.userId;

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    const rawTransactions = await prisma.transaction.findMany({
      where: {
        walletId: wallet.walletId,
        createdAt: {
          gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        },
      },
      select: {
        createdAt: true,
        type: true,
        amount: true,
      },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = new Map();

    rawTransactions.forEach(tx => {
      const date = new Date(tx.createdAt);
      const month = date.getMonth(); // 0-based index (0 = Jan)

      const monthName = monthNames[month];

      if (!monthlyMap.has(monthName)) {
        monthlyMap.set(monthName, { month: monthName, deposit: 0, withdraw: 0 });
      }

      const current = monthlyMap.get(monthName);

      if (tx.type === 'deposit') {
        current.deposit += tx.amount;
      } else if (tx.type === 'withdraw') {
        current.withdraw += tx.amount;
      }

      monthlyMap.set(monthName, current);
    });

    const monthlyComparisonData = Array.from(monthlyMap.values());

    res.status(200).json({
      success: true,
      monthlyTransactions: monthlyComparisonData,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
