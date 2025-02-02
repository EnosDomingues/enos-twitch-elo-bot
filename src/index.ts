import tmi from "tmi.js";
import axios from "axios";
import dotenv from 'dotenv';
import { elo_bot } from "./elo/elo_bot";
import { checkForNewFollowers } from "./followers/followers_bot";

dotenv.config();

interface EnvConfig {
    BOT_NAME: string;
    BOT_OAUTH_TOKEN: string;
    TWITCH_CHANNEL: string;
}

const {
    BOT_NAME,
    BOT_OAUTH_TOKEN,
    TWITCH_CHANNEL,
} = process.env as unknown as EnvConfig;

const client = new tmi.Client({
    options: { debug: true },
    identity: {
        username: BOT_NAME,
        password: `oauth:${BOT_OAUTH_TOKEN}`
    },
    channels: [ TWITCH_CHANNEL ]
});

client.connect().catch(console.error);

elo_bot(client, axios);
setInterval(() => checkForNewFollowers(client, axios), 10000);

