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
exports.checkForNewFollowers = checkForNewFollowers;
const dotenv_1 = __importDefault(require("dotenv"));
const messages_1 = require("./../utils/messages");
dotenv_1.default.config();
const { BOT_OAUTH_TOKEN, TWITCH_CHANNEL, CLIENT_ID, TWITCH_CHANNEL_ID } = process.env;
let lastKnownFollowerId = '';
function checkForNewFollowers(client, axios) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios.get(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${encodeURIComponent(TWITCH_CHANNEL_ID)}&first=1`, {
                headers: {
                    'Authorization': `Bearer ${BOT_OAUTH_TOKEN}`,
                    'Client-Id': CLIENT_ID
                }
            });
            if (response.data.data.length > 0) {
                const latestFollower = response.data.data[0];
                if (latestFollower.user_id !== lastKnownFollowerId) {
                    const randomWelcomeMessage = messages_1.welcomeMessages[Math.floor(Math.random() * messages_1.welcomeMessages.length)];
                    const welcomeMessage = randomWelcomeMessage.replace('[USERNAME]', `@${latestFollower.user_name}`);
                    client.say(TWITCH_CHANNEL, welcomeMessage);
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
