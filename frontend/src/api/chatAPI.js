import axios from "axios";

const API_URL = "http://localhost:5000/api/chat"; // your backend endpoint

export async function sendMessageToBackend(message) {
  try {
    const res = await axios.post(API_URL, { message });
    return res.data; // should be { reply, stage, customer? }
  } catch (err) {
    console.error("Error from backend:", err);
    return { reply: "Sorry, there was a problem connecting to the AI service." };
  }
}
