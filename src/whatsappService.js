
import api from "./axiosConfig";

export const sendWhatsAppMessage = async (mobileNumber, message) => {
    try {
        let formattedNumber = mobileNumber.replace('+', '');
        if (formattedNumber.length === 10) {
            formattedNumber = `91${formattedNumber}`;
        }
        const response = await api.post("/send-whatsapp", {
            number: formattedNumber,
            message: message,
        });
        console.log("WhatsApp API response:", JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error("Failed to send WhatsApp message:", error);
        throw new Error("WhatsApp message sending failed.");
    }
};