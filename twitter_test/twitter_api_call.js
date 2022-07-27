const { TwitterApi, ETwitterStreamEvent } = require('twitter-api-v2');
const {Client, Intents, GatewayIntentBits} = require('discord.js');
require('dotenv').config();

bearerToken = process.env.BEARER_TOKEN;
discordToken = process.env.DISCORD_TOKEN;
// console.log(process.env)

async function postToDiscord(msg){
  const discordClient = new Client({
    intents: [GatewayIntentBits.Guilds]
  });
  discordClient.login(discordToken);
  await discordClient.channels.cache.find(channel => channel.name == "bot-tests").send(`Priscilla just tweeted: ${msg}`);
  console.log("Sending to discord.");
}

// Reference: https://github.com/PLhery/node-twitter-api-v2/blob/master/test/stream.test.ts
async function getFromTwitter() {
  const client = new TwitterApi(bearerToken);
  const rules = await client.v2.streamRules();
  
  if (rules.data?.length) {
    await client.v2.updateStreamRules({
      delete: { ids: rules.data.map(rule => rule.id) },
    });
  }

  await client.v2.updateStreamRules({
    add: [{ value: 'from:resolute_two', tag: 'from priscilla' }]
  });
  
  const stream = await client.v2.searchStream();
  // Enable auto reconnect
  stream.autoReconnect = true;
  
  // https://github.com/plhery/node-twitter-api-v2/blob/HEAD/doc/examples.md#Streamtweetsinrealtime
  stream.on(ETwitterStreamEvent.Data, async tweet => {
    console.log('Twitter has sent something: ', tweet.data.text);
    postToDiscord(tweet.data.text);
  });
}

test = getFromTwitter();
test.then(function() {
  console.log("bruh idk what i'm doing");
}).catch(function () {
  console.log("i guess the promise failed.")
});