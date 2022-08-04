const express = require("express");
const {
  BotFrameworkAdapter,
  MemoryStorage,
  ConversationState,
  UserState,
} = require("botbuilder");

const {
  TwilioWhatsAppAdapter,
} = require("@botbuildercommunity/adapter-twilio-whatsapp");

const whatsAppAdapter = new TwilioWhatsAppAdapter({
  accountSid: "ACd97cad870baa59484a6bcd880cc3f2ac", // Account SID
  authToken: "c3601689bc79c7592472c0820279c17c", // Auth Token
  phoneNumber: "whatsapp:+14155238886", // The From parameter consisting of whatsapp: followed by the sending WhatsApp number (using E.164 formatting)
  endpointUrl: "https://1318-103-90-96-79.ngrok.io", // Endpoint URL you configured in the sandbox, used for validation
});

const { EchoBot } = require("./Bot");

const app = express();

const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
});

const onTurnErrorHandler = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights. See https://aka.ms/bottelemetry for telemetry
  //       configuration instructions.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );

  // Send a message to the user
  await context.sendActivity("The bot encountered an error or bug.");
  await context.sendActivity(
    "To continue to run this bot, please fix the bot source code."
  );
};

adapter.onTurnError = onTurnErrorHandler;

const memoryStorage = new MemoryStorage();

const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

const myBot = new EchoBot(conversationState, userState);

app.post("/", (req, res) => {
  // whatsAppAdapter.processActivity(req, res, async (context) => {
  //   console.log(req.body)
  //   await myBot.run(context);
  // });
  adapter.processActivity(req, res, async (context) => {
    console.log(req.body);
    await myBot.run(context);
  });
});

app.listen(3000, () => {
  console.log(`server runing on 3000`);
  
});
