import tmi from "tmi.js";
import axios from "axios";
import dotenv from 'dotenv';
import { eloMessages, welcomeMessages } from "./utils/messages";

dotenv.config();

interface EnvConfig {
    BOT_NAME: string;
    BOT_OAUTH_TOKEN: string;
    TWITCH_CHANNEL: string;
    RIOT_API_KEY: string;
    SUMMONER_ID: string;
    CLIENT_ID: string;
    SECRET_ID: string;
    TWITCH_CHANNEL_ID: string;
}

const {
    BOT_NAME,
    BOT_OAUTH_TOKEN,
    TWITCH_CHANNEL,
    RIOT_API_KEY,
    SUMMONER_ID,
    CLIENT_ID,
    TWITCH_CHANNEL_ID
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

let lastKnownFollowerId = '';



async function checkForNewFollowers() {
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

setInterval(checkForNewFollowers, 10000);

client.on('message', async (channel, tags, message, self) => {
    if (self) return;

    if (message.toLowerCase() === '!hello') {
        client.say(channel, `@${tags.username || 'Anônimo'}, heya!`);
    } else if (message.toLowerCase() === '!elo') {
        try {
            const response = await axios.get(`https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/${SUMMONER_ID}`, {
                headers: {
                    'X-Riot-Token': RIOT_API_KEY,
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
                    'Accept-Language': 'pt-BR,pt;q=0.9,de;q=0.8,en-US;q=0.7,en;q=0.6',
                    'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Origin': 'https://developer.riotgames.com'
                }
            });

            if (response.data.length > 0) {
                const rankInfo = response.data[0];
                const randomEloMessage = eloMessages[Math.floor(Math.random() * eloMessages.length)];
                let username = tags.username || 'Anônimo';
                let eloMessage = randomEloMessage.replace('@[USERNAME]', username);
                eloMessage = eloMessage.replace('[TIER]', rankInfo.tier);
                eloMessage = eloMessage.replace('[RANK]', rankInfo.rank);
                client.say(channel, eloMessage);
            } else {
                let username = tags.username || 'Anônimo';
                client.say(channel, `@${username}, não classificado no momento.`);
            }
        } catch (error) {
            console.error('Erro ao obter o elo:', error);
            let username = tags.username || 'Anônimo';
            client.say(channel, `@${username}, desculpe, não consegui obter o elo no momento.`);
        }
    }
});