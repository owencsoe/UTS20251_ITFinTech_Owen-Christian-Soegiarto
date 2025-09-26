export default function PaymentFailed() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-700">Pembayaran Gagal ❌</h1>
          <p className="mt-2 text-gray-600">Silakan coba lagi atau pilih metode lain.</p>
          <a
            href="/checkout"
            className="mt-4 inline-block px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
          >
            Kembali ke Checkout
          </a>
        </div>
      </div>
    );
  }
  