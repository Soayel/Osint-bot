const axios = require("axios");

const VEHICLE_API_URL = "https://seller-lead.cars24.team";

// ============================================================
// VEHICLE API HEADERS
// ============================================================

function getVehicleHeaders() {

return {
    accept: "application/json",

    "x-channel-name":
        "vehicle_challan_info_app",

    authorization:
        process.env.CARS24_AUTHORIZATION,

    pvtauthorization:
        process.env.CARS24_PVT_AUTHORIZATION,

    source:
        "vehicle_challan_info_app",

    platform:
        "android",

    "user-agent":
        "okhttp/4.12.0",

    origin_source:
        "Challan",

    device_category:
        "android"
};

}

// ============================================================
// VEHICLE LOOKUP
// ============================================================

async function lookupVehicle(vehicleNumber) {

const phone =
    process.env.VEHICLE_PHONE;


// --------------------------------------------------------
// Step 1: Create lead and receive token
// --------------------------------------------------------

const leadResponse = await axios.post(

    `${VEHICLE_API_URL}/prospect/lead`,

    {
        type: "challan",

        whatsapp_consent: true,

        device_category: "android",

        phone: phone,

        vehicle_reg_no:
            vehicleNumber,

        user_id:
            `user_${phone}_${Date.now()}`
    },

    {
        headers:
            getVehicleHeaders(),

        timeout: 30000
    }
);


const token =
    leadResponse.data?.detail?.token;


if (!token) {

    throw new Error(
        "Vehicle token was not returned"
    );
}


// --------------------------------------------------------
// Step 2: Get challan information
// --------------------------------------------------------

const challanResponse = await axios.get(

    `${VEHICLE_API_URL}/challan/list/${encodeURIComponent(token)}`,

    {
        headers:
            getVehicleHeaders(),

        timeout: 30000
    }
);


return challanResponse.data;

}

// ============================================================
// VEHICLE INFO FEATURE
// ============================================================

async function vehicleInfo(
ctx,
text,
mainMenu
) {

// --------------------------------------------------------
// Normalize vehicle number
// --------------------------------------------------------

const vehicle =
    text
        .toUpperCase()
        .replace(/[\s-]/g, "");


// --------------------------------------------------------
// Validate vehicle registration number
// --------------------------------------------------------

if (
    !/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}$/
        .test(vehicle)
) {

    await ctx.reply(
        "❌ Invalid vehicle number.\n\n" +
        "Example: WB12AB1234"
    );

    return;
}


// --------------------------------------------------------
// Loading message
// --------------------------------------------------------

const loading =
    await ctx.reply(
        "🔎 Searching..."
    );


try {

    console.log(
        "VEHICLE LOOKUP:",
        vehicle
    );


    // ----------------------------------------------------
    // Perform lookup
    // ----------------------------------------------------

    const data =
        await lookupVehicle(vehicle);


    console.log(
        "VEHICLE API RESPONSE:",
        JSON.stringify(
            data,
            null,
            2
        )
    );


    // ----------------------------------------------------
    // Delete loading message
    // ----------------------------------------------------

    try {

        await ctx.telegram.deleteMessage(
            ctx.chat.id,
            loading.message_id
        );

    } catch (_) {}


    // ----------------------------------------------------
    // Format response
    // ----------------------------------------------------

    let result =
        JSON.stringify(
            data,
            null,
            2
        );


    // Telegram message limit
    if (result.length > 3900) {

        result =
            result.substring(
                0,
                3900
            ) +
            "\n\n...response truncated";
    }


    // ----------------------------------------------------
    // Send result
    // ----------------------------------------------------

    await ctx.reply(

        "🚗 Vehicle Info\n\n" +

        `Vehicle: ${vehicle}\n\n` +

        result,

        mainMenu()
    );

} catch (error) {

    console.error(
        "VEHICLE API ERROR:"
    );

    console.error(
        error.response?.data ||
        error.message
    );


    // ----------------------------------------------------
    // Remove loading message
    // ----------------------------------------------------

    try {

        await ctx.telegram.deleteMessage(
            ctx.chat.id,
            loading.message_id
        );

    } catch (_) {}


    await ctx.reply(

        "❌ Vehicle lookup failed.\n\n" +
        "Check the server console for the API error.",

        mainMenu()
    );
}

}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
vehicleInfo
};
