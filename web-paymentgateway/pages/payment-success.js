export default function PaymentSuccess() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-700">Pembayaran Berhasil 🎉</h1>
          <p className="mt-2 text-gray-600">Terima kasih, pesananmu sudah dibayar.</p>
          <a
            href="/orders"
            className="mt-4 inline-block px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            Lihat Riwayat Pesanan
          </a>
        </div>
      </div>
    );
  }
  