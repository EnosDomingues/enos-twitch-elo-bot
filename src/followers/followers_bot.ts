import dotenv from 'dotenv';

import type { AxiosStatic } from "axios";
import type { Client } from "tmi.js";

import { welcomeMessages } from "./../utils/messages";

dotenv.config();

interface EnvConfig {
    BOT_OAUTH_TOKEN: string;
    TWITCH_CHANNEL: string;
    CLIENT_ID: string;
    TWITCH_CHANNEL_ID: string;
}

const {
    BOT_OAUTH_TOKEN,
    TWITCH_CHANNEL,
    CLIENT_ID,
    TWITCH_CHANNEL_ID
} = process.env as unknown as EnvConfig;

let lastKnownFollowerId = '';

export async function checkForNewFollowers(client: Client, axios: AxiosStatic) {
    try {
        const response = await axios.get(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${encodeURIComponent(TWITCH_CHANNEL_ID)}&first=1`, {
            headers: {
                'Authorization': `Bearer ${BOT_OAUTH_TOKEN}`,
                'Client-Id': CLIENT_ID
            }
        });

        if (response.data.data.length > 0) {
            const latestFollower = response.data.data[0];
            
            if (latestFollower.user_id !== lastKnownFollowerId) {
                const randomWelcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
                const welcomeMessage = randomWelcomeMessage.replace('[USERNAME]', `@${latestFollower.user_name}`);
                client.say(TWITCH_CHANNEL, welcomeMessage);
                lastKnownFollowerId = latestFollower.user_id;
            } else {
                console.log('Nenhum novo seguidor desde a última verificação.');
            }
        } else {
            console.log('Nenhum seguidor encontrado.');
        }
    } catch (error) {
        console.error('Erro ao verificar novos seguidores:', error);
    }
}