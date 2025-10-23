import fetch from "node-fetch";

export async function sendWhatsApp(phone, message) {
  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": process.env.FONNTE_TOKEN, // ambil dari .env
      },
      body: new URLSearchParams({
        target: phone,
        message: message,
      }),
    });

    const data = await res.json();
    console.log("✅ WhatsApp sent:", data);
    return data;
  } catch (error) {
    console.error("❌ Failed to send WhatsApp:", error);
  }
}
