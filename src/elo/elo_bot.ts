import type { AxiosStatic } from "axios";
import type { Client } from "tmi.js";
import dotenv from 'dotenv';

import { eloMessages } from "./../utils/messages";

dotenv.config();

interface EnvConfig {
    RIOT_API_KEY: string;
    SUMMONER_ID: string;
}

const {
    RIOT_API_KEY,
    SUMMONER_ID,
} = process.env as unknown as EnvConfig;

export function elo_bot(client: Client, axios: AxiosStatic) {
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
                  
                  eloMessage = eloMessage.replace('[PDL]', rankInfo.leaguePoints.toString());

                  if (!eloMessage.includes('PDL')) {
                      eloMessage += ` com ${rankInfo.leaguePoints} PDL.`;
                  }
                  
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
}