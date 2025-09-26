import { useState } from "react";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/createInvoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 35000, // contoh nominal
          description: "Pembayaran produk UTS",
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Gagal memanggil API");
      }

      const data = await res.json();
      console.log("Invoice response:", data);

      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl; // redirect ke halaman pembayaran Xendit
      } else {
        setError("Invoice tidak valid: " + JSON.stringify(data));
      }
      
    } catch (err) {
      console.error("❌ Checkout error:", err);
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>Checkout</h1>
      <p>Total pembayaran: <strong>Rp 35.000</strong></p>

      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          background: "#4CAF50",
          color: "white",
          padding: "12px 24px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        {loading ? "Memproses..." : "Bayar Sekarang"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "20px" }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
