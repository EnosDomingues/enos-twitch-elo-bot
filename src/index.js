"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tmi_js_1 = __importDefault(require("tmi.js"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const elo_bot_1 = require("./elo/elo_bot");
const followers_bot_1 = require("./followers/followers_bot");
dotenv_1.default.config();
const { BOT_NAME, BOT_OAUTH_TOKEN, TWITCH_CHANNEL, } = process.env;
const client = new tmi_js_1.default.Client({
    options: { debug: true },
    identity: {
        username: BOT_NAME,
        password: `oauth:${BOT_OAUTH_TOKEN}`
    },
    channels: [TWITCH_CHANNEL]
});
client.connect().catch(console.error);
(0, elo_bot_1.elo_bot)(client, axios_1.default);
setInterval(() => (0, followers_bot_1.checkForNewFollowers)(client, axios_1.default), 10000);
