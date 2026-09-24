const axios = require("axios");

const NUMBER_API_URL = process.env.number_api_url;

async function numberInfo(ctx, text, mainMenu) {

// Only allow digits and optional +
const phone = text.replace(/[^\d+]/g, "");

if (!/^\+?\d{7,15}$/.test(phone)) {

    await ctx.reply(
        "❌ Invalid phone number.\n\n" +
        "Example: +919876543210"
    );

    return;
}

const loading = await ctx.reply(
    "🔎 Searching..."
);

try {

    console.log(
        "NUMBER LOOKUP:",
        phone
    );

    const response = await axios.get(
        NUMBER_API_URL,
        {
            params: {
                service: "numinfo",
                key: process.env.NUMINFO_API_KEY,
                query: phone
            },
            timeout: 30000
        }
    );

    console.log(
        "NUMBER API RESPONSE:",
        JSON.stringify(
            response.data,
            null,
            2
        )
    );

    // Delete loading message
    try {
        await ctx.telegram.deleteMessage(
            ctx.chat.id,
            loading.message_id
        );
    } catch (_) {}

    let result = JSON.stringify(
        response.data,
        null,
        2
    );

    // Telegram message limit
    if (result.length > 3900) {

        result =
            result.substring(0, 3900) +
            "\n\n...response truncated";
    }

    await ctx.reply(
        "📱 Number Info\n\n" +
        result,
        mainMenu()
    );

} catch (error) {

    console.error(
        "NUMBER API ERROR:"
    );

    console.error(
        error.response?.data ||
        error.message
    );

    try {
        await ctx.telegram.deleteMessage(
            ctx.chat.id,
            loading.message_id
        );
    } catch (_) {}

    await ctx.reply(
        "❌ Number lookup failed.\n\n" +
        "Check the server console for the API error.",
        mainMenu()
    );
}

}

module.exports = {
numberInfo
};
