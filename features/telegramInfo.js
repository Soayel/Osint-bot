const axios = require("axios");

const TG_API_URL = process.env.tg_api_url;

async function telegramInfo(ctx, text, mainMenu) {

let username = text;

if (!username.startsWith("@")) {
    username = "@" + username;
}

/*
 * Telegram usernames are 5–32 characters
 * and may contain letters, numbers and underscores.
 */

if (
    !/^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(username)
) {

    await ctx.reply(
        "❌ Invalid Telegram username.\n\n" +
        "Example: @Imlegend"
    );

    return;
}

const loading = await ctx.reply(
    "🔎 Searching..."
);

try {

    console.log(
        "TELEGRAM LOOKUP:",
        username
    );

    const response = await axios.get(
        TG_API_URL,
        {
            params: {
                types: "telegram",
                key: process.env.API_KEY,
                spell: username
            },
            timeout: 30000
        }
    );

    console.log(
        "TELEGRAM API RESPONSE:",
        JSON.stringify(
            response.data,
            null,
            2
        )
    );

    try {
        await ctx.telegram.deleteMessage(
            ctx.chat.id,
            loading.message_id
        );
    } catch (_) {}

    const result =
        response.data?.result;

    if (
        response.data?.success &&
        result?.Number
    ) {

        const countryCode =
            result["Country Code"] || "";

        const number =
            result.Number;

        await ctx.reply(
            "👤 TG ID Info\n\n" +
            `Username: ${username}\n` +
            `📱 Number: ${countryCode} ${number}`,
            mainMenu()
        );

    } else {

        await ctx.reply(
            "❌ No number available for that username.",
            mainMenu()
        );
    }

} catch (error) {

    console.error(
        "TELEGRAM API ERROR:"
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
        "❌ Telegram lookup failed.",
        mainMenu()
    );
}

}

module.exports = {
telegramInfo
};
