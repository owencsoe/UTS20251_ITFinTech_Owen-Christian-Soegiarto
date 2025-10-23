import connectDB from "../../../lib/mongodb";
import Order from "../../../models/order";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    // Ambil semua order dari database
    const allOrders = await Order.find();

    if (!allOrders || allOrders.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalRevenue: 0,
          totalOrders: 0,
          paidOrders: 0,
          pendingOrders: 0,
          paidRevenue: 0,
        },
        chartData: [],
        monthlyChartData: [],
      });
    }

    // 🧮 Filter order per status
    const paidOrders = allOrders.filter(
      (o) =>
        o.status?.toLowerCase() === "paid" ||
        o.status?.toLowerCase() === "lunas"
    );
    const pendingOrders = allOrders.filter(
      (o) =>
        o.status?.toLowerCase() === "waiting payment" ||
        o.status?.toLowerCase() === "pending"
    );

    // 💰 Hitung statistik utama
    const totalRevenue = allOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );
    const paidRevenue = paidOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    const stats = {
      totalRevenue,
      totalOrders: allOrders.length,
      paidOrders: paidOrders.length,
      pendingOrders: pendingOrders.length,
      paidRevenue,
    };

    // 📅 Revenue harian - HANYA PAID ORDERS
    const dailyData = {};
    paidOrders.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, total: 0, count: 0 };
      }
      dailyData[date].total += order.totalAmount || 0;
      dailyData[date].count += 1;
    });

    const chartData = Object.values(dailyData).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // 📆 Revenue bulanan - HANYA PAID ORDERS
    const monthlyData = {};
    paidOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, total: 0, count: 0 };
      }
      monthlyData[monthKey].total += order.totalAmount || 0;
      monthlyData[monthKey].count += 1;
    });

    const monthlyChartData = Object.values(monthlyData).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    res.status(200).json({
      success: true,
      stats,
      chartData,
      monthlyChartData,
    });
  } catch (error) {
    console.error("❌ Stats error:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil statistik" });
  }
}