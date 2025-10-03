


import axios from "axios";

export const sendWhatsAppMessage = async (mobileNumber, message) => {
    try {
        let formattedNumber = mobileNumber.replace('+', '');
        if (formattedNumber.length === 10) {
            formattedNumber = `91${formattedNumber}`;
        }
        const response = await axios.post("https://wav5.algotechnosoft.com/api/send", {
            number: formattedNumber, // Remove '+' to ensure correct format like 919876543210
            type: "text",
            message: message,
            instance_id: "68D0F8C9EDCA2",
            access_token: "675fece35d27f",
        });
        console.log("WhatsApp API response:", JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error("Failed to send WhatsApp message:", error);
        throw new Error("WhatsApp message sending failed.");
    }
};