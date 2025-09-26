// pages/orders.js
import connectDB from "../lib/mongodb";
import Order from "../models/order";

export async function getServerSideProps() {
  await connectDB();
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  return { props: { orders: JSON.parse(JSON.stringify(orders)) } };
}

export default function Orders({ orders }) {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Riwayat Transaksi</h1>

      {orders.length === 0 ? (
        <p>Belum ada transaksi.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", marginTop: "20px", width: "100%" }}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o.externalId}</td>
                <td>
                  {o.items && o.items.map((i, idx) => (
                    <div key={idx}>{i.name} - Rp {i.price.toLocaleString("id-ID")}</div>
                  ))}
                </td>
                <td><strong>Rp {o.total.toLocaleString("id-ID")}</strong></td>
                <td style={{
                  color: o.status === "PAID" ? "green" : o.status === "EXPIRED" ? "red" : "orange",
                  fontWeight: "bold"
                }}>
                  {o.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
