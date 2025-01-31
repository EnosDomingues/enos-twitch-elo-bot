import tmi from "tmi.js";
import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    BOT_NAME: string;
    BOT_OAUTH_TOKEN: string;
    TWITCH_CHANNEL: string;
    RIOT_API_KEY: string;
    SUMMONER_ID: string;
    CLIENT_ID: string;
    SECRET_ID: string;
}

const {
    BOT_NAME,
    BOT_OAUTH_TOKEN,
    TWITCH_CHANNEL,
    RIOT_API_KEY,
    SUMMONER_ID
} = process.env as unknown as EnvConfig;

const client = new tmi.Client({
    options: { debug: true },
    identity: {
        username: BOT_NAME,
        password: BOT_OAUTH_TOKEN
    },
    channels: [ TWITCH_CHANNEL ]
});

client.connect().catch(console.error);

client.on('message', async (channel, tags, message, self) => {
    if (self) return;

    if (message.toLowerCase() === '!hello') {
        client.say(channel, `@${tags.username}, heya!`);
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
                client.say(channel, `@${tags.username}, o elo atual é: ${rankInfo.tier} ${rankInfo.rank}`);
            } else {
                client.say(channel, `@${tags.username}, não classificado no momento.`);
            }
        } catch (error) {
            console.error('Erro ao obter o elo:', error);
            client.say(channel, `@${tags.username}, desculpe, não consegui obter o elo no momento.`);
        }
    }
});