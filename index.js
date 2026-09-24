const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();

const { vehicleInfo } = require("./features/vehicleInfo");
const { numberInfo } = require("./features/numberInfo");
const { telegramInfo } = require("./features/telegramInfo");

const bot = new Telegraf(process.env.BOT_TOKEN);

const userMode = new Map();

// ─────────────────────────────────────────────
// MAIN MENU
// ─────────────────────────────────────────────

function mainMenu() {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback("📱 Number Info", "NUMBER_INFO"),
            Markup.button.callback("👤 TG ID Info", "TG_ID_INFO")
        ],
        [
            Markup.button.callback("🚗 Vehicle Info", "VEHICLE_INFO")
        ]
    ]);
}

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────

bot.start(async (ctx) => {
    userMode.delete(ctx.from.id);

    await ctx.reply(
        "🤖 Welcome!\n\nChoose a service:",
        mainMenu()
    );
});

// ─────────────────────────────────────────────
// BUTTONS
// ─────────────────────────────────────────────

bot.action("NUMBER_INFO", async (ctx) => {
    try {
        await ctx.answerCbQuery();
    } catch (_) {}

    userMode.set(ctx.from.id, "number");

    await ctx.reply(
        "📱 Send the phone number.\n\n" +
        "Example:\n9876543210",
        Markup.inlineKeyboard([
            [
                Markup.button.callback(
                    "⬅️ Back to Menu",
                    "MAIN_MENU"
                )
            ]
        ])
    );
});

bot.action("TG_ID_INFO", async (ctx) => {
    try {
        await ctx.answerCbQuery();
    } catch (_) {}

    userMode.set(ctx.from.id, "telegram");

    await ctx.reply(
        "👤 Send the Telegram username.\n\n" +
        "Example:\n@username",
        Markup.inlineKeyboard([
            [
                Markup.button.callback(
                    "⬅️ Back to Menu",
                    "MAIN_MENU"
                )
            ]
        ])
    );
});

bot.action("VEHICLE_INFO", async (ctx) => {
    try {
        await ctx.answerCbQuery();
    } catch (_) {}

    userMode.set(ctx.from.id, "vehicle");

    await ctx.reply(
        "🚗 Send the vehicle registration number.\n\n" +
        "Example:\nWB12AB1234",
        Markup.inlineKeyboard([
            [
                Markup.button.callback(
                    "⬅️ Back to Menu",
                    "MAIN_MENU"
                )
            ]
        ])
    );
});

bot.action("MAIN_MENU", async (ctx) => {
    try {
        await ctx.answerCbQuery();
    } catch (_) {}

    userMode.delete(ctx.from.id);

    await ctx.reply(
        "🔎 Choose a service:",
        mainMenu()
    );
});

// ─────────────────────────────────────────────
// /num
// ─────────────────────────────────────────────

bot.command("num", async (ctx) => {
    const input = ctx.message.text
        .replace(/^\/num(?:@\w+)?\s*/i, "")
        .trim();

    userMode.set(ctx.from.id, "number");

    if (input) {
        return numberInfo(ctx, input, mainMenu);
    }

    await ctx.reply(
        "📱 Number Info\n\n" +
        "Send the phone number.\n\n" +
        "Example:\n" +
        "9876543210\n" +
        "+919876543210",
        Markup.inlineKeyboard([
            [
                Markup.button.callback(
                    "⬅️ Back to Menu",
                    "MAIN_MENU"
                )
            ]
        ])
    );
});

// ─────────────────────────────────────────────
// /tg
// ─────────────────────────────────────────────

bot.command("tg", async (ctx) => {
    const input = ctx.message.text
        .replace(/^\/tg(?:@\w+)?\s*/i, "")
        .trim();

    userMode.set(ctx.from.id, "telegram");

    if (input) {
        return telegramInfo(ctx, input, mainMenu);
    }

    await ctx.reply(
        "👤 TG ID Info\n\n" +
        "Send the Telegram username.\n\n" +
        "Example:\n" +
        "@username",
        Markup.inlineKeyboard([
            [
                Markup.button.callback(
                    "⬅️ Back to Menu",
                    "MAIN_MENU"
                )
            ]
        ])
    );
});

// ─────────────────────────────────────────────
// /veh
// ─────────────────────────────────────────────

bot.command("veh", async (ctx) => {
    const input = ctx.message.text
        .replace(/^\/veh(?:@\w+)?\s*/i, "")
        .trim();

    userMode.set(ctx.from.id, "vehicle");

    if (input) {
        return vehicleInfo(ctx, input, mainMenu);
    }

    await ctx.reply(
        "🚗 Vehicle Info\n\n" +
        "Send the vehicle registration number.\n\n" +
        "Example:\n" +
        "WB12AB1234",
        Markup.inlineKeyboard([
            [
                Markup.button.callback(
                    "⬅️ Back to Menu",
                    "MAIN_MENU"
                )
            ]
        ])
    );
});

// ─────────────────────────────────────────────
// TEXT ROUTER
// ─────────────────────────────────────────────

bot.on("text", async (ctx) => {
    const mode = userMode.get(ctx.from.id);
    const input = ctx.message.text.trim();

    if (!input) {
        return;
    }

    if (!mode) {
        return ctx.reply(
            "Please choose a service first:",
            mainMenu()
        );
    }

    if (mode === "number") {
        return numberInfo(
            ctx,
            input,
            mainMenu
        );
    }

    if (mode === "telegram") {
        return telegramInfo(
            ctx,
            input,
            mainMenu
        );
    }

    if (mode === "vehicle") {
        return vehicleInfo(
            ctx,
            input,
            mainMenu
        );
    }
});

// ─────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────

bot.catch((error, ctx) => {
    console.error(
        `Bot error for ${ctx?.from?.id || "unknown user"}:`,
        error
    );
});

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────

bot.launch();

console.log("🤖 Bot started successfully.");

process.once(
    "SIGINT",
    () => bot.stop("SIGINT")
);

process.once(
    "SIGTERM",
    () => bot.stop("SIGTERM")
);
