"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tmi_js_1 = __importDefault(require("tmi.js"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { BOT_NAME, BOT_OAUTH_TOKEN, TWITCH_CHANNEL, RIOT_API_KEY, SUMMONER_ID, CLIENT_ID, TWITCH_CHANNEL_ID } = process.env;
const client = new tmi_js_1.default.Client({
    options: { debug: true },
    identity: {
        username: BOT_NAME,
        password: `oauth:${BOT_OAUTH_TOKEN}`
    },
    channels: [TWITCH_CHANNEL]
});
client.connect().catch(console.error);
let lastKnownFollowerId = '';
function checkForNewFollowers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${encodeURIComponent(TWITCH_CHANNEL_ID)}&first=1`, {
                headers: {
                    'Authorization': `Bearer ${BOT_OAUTH_TOKEN}`,
                    'Client-Id': CLIENT_ID
                }
            });
            if (response.data.data.length > 0) {
                const latestFollower = response.data.data[0];
                // Verifica se este é um novo seguidor
                if (latestFollower.user_id !== lastKnownFollowerId) {
                    client.say(TWITCH_CHANNEL, `Obrigada por seguir o canal, ${latestFollower.user_name}! Seja bem-vindo(a)! 💎`);
                    // Atualiza o ID do último seguidor conhecido
                    lastKnownFollowerId = latestFollower.user_id;
                }
                else {
                    console.log('Nenhum novo seguidor desde a última verificação.');
                }
            }
            else {
                console.log('Nenhum seguidor encontrado.');
            }
        }
        catch (error) {
            console.error('Erro ao verificar novos seguidores:', error);
        }
    });
}
setInterval(checkForNewFollowers, 10000);
client.on('message', (channel, tags, message, self) => __awaiter(void 0, void 0, void 0, function* () {
    if (self)
        return;
    if (message.toLowerCase() === '!hello') {
        client.say(channel, `@${tags.username}, heya!`);
    }
    else if (message.toLowerCase() === '!elo') {
        try {
            const response = yield axios_1.default.get(`https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/${SUMMONER_ID}`, {
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
            }
            else {
                client.say(channel, `@${tags.username}, não classificado no momento.`);
            }
        }
        catch (error) {
            console.error('Erro ao obter o elo:', error);
            client.say(channel, `@${tags.username}, desculpe, não consegui obter o elo no momento.`);
        }
    }
}));
