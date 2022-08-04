const { ActivityHandler, MessageFactory, CardFactory } = require("botbuilder");
const { CountryFilter } = require("./HandlerFunctions/CountryFilter");
const { StateFilter } = require("./HandlerFunctions/StateFilter");
const country = require("./public/static/data.json");
const {
  MakeReservationDialog,
} = require("./componentDialog/makeReservationDialog");

const { ShowReservation } = require("./componentDialog/showReservation");

const accountSid = "ACc5e3b40fda53fdc9f3b9e50cb359fda7";
const authToken = "d725013fe46852c6fd2813201581b885";
const client = require("twilio")(accountSid, authToken);

// class EchoBot extends ActivityHandler {
//   constructor() {
//     super();
//     // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
//     this.onMessage(async (context, next) => {
//       const value = context.activity.text;
//       const message = CountryFilter(value) || StateFilter(value);
//       if (!message) {
//         const replyText = `Echo: Not selected any option`;
//         await context.sendActivity(MessageFactory.text(replyText, replyText));
//       } else {
//         await context.sendActivity(MessageFactory.attachment(message.msg));
//       }
//       // By calling next() you ensure that the next BotHandler is run.
//       await next();
//     });

//     this.onMembersAdded(async (context, next) => {
//       const membersAdded = context.activity.membersAdded;

//       const card = CardFactory.heroCard(
//         "Please select country",
//         ["https://example.com/whiteShirt.jpg"],
//         Object.keys(country)
//       );
//       for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
//         if (membersAdded[cnt].id !== context.activity.recipient.id) {
//           await context.sendActivity(
//             MessageFactory.text("Hello I can help you to find best hotels")
//           );
//           await context.sendActivity(MessageFactory.attachment(card));
//         }
//       }
//       // By calling next() you ensure that the next BotHandler is run.
//       await next();
//     });
//   }
// }

// module.exports = { EchoBot };

class EchoBot extends ActivityHandler {
  constructor(conversationState, userState) {
    super();
    this.conversationState = conversationState;
    this.userState = userState;
    this.makeReservationDialog = new MakeReservationDialog(
      this.conversationState,
      this.userState
    );

    this.showReservation = new ShowReservation(
      this.conversationState,
      this.userState
    );

    this.previousIntent =
      this.conversationState.createProperty("previousIntent");
    this.conversationData =
      this.conversationState.createProperty("conservationData");

    this.dialogState = this.conversationState.createProperty("dialogState");

    this.onMessage(async (context, next) => {
      let text = context.activity.text;
      let val = context.activity.value;
      console.log("Received location!", context);
      if (
        context.activity.attachments &&
        context.activity.attachments.length > 0
      ) {
        console.log("Received location!");
        console.log(context.activity.attachments[0]);
        for (const attachment of context.activity.attachments) {
          console.log("Received location!");
          if (
            attachment.contentType === "application/json" &&
            attachment.content.type === "GeoCoordinates"
          ) {
            console.log("Received location!");
            await context.sendActivity(`Received a location.
                    ${attachment.content.name} (${attachment.content.latitude}:${attachment.content.longitude})`);
          }
        }
      }
      if (!text && val) {
        console.log(">>>>>>>>>>>>>.. ", val);
        console.log("thank you for feedback");
        await context.sendActivity(
          MessageFactory.text("thank you for your feedback")
        );
      } else {
        await this.dispatchToIntentAsync(context);
      }
      await next();
    });

    this.onDialog(async (context, next) => {
      // Save any state changes. The load happened during the execution of the Dialog.
      // console.log(context);
      await this.conversationState.saveChanges(context, false);
      await this.userState.saveChanges(context, false);
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      await this.sendWelcomeMessage(context);

      await next();
    });
  }

  async sendWelcomeMessage(context) {
    const membersAdded = context.activity.membersAdded;
    for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
      if (membersAdded[cnt].id !== context.activity.recipient.id) {
        await context.sendActivity(
          MessageFactory.text("Welcome to Restaurant Reservation Bot")
        );
        await this.addSugessionAction(context);
      }
    }
  }

  async addSugessionAction(context) {
    var msg = MessageFactory.attachment(
      CardFactory.heroCard(
        "What would you like?",
        [],
        ["Make Reservation", "Show Reservation"]
      )
    );
    await context.sendActivity(msg);
  }

  async run(context) {
    await super.run(context);

    // Save any state changes. The load happened during the execution of the Dialog.
    await this.conversationState.saveChanges(context, false);
    await this.userState.saveChanges(context, false);
  }

  async dispatchToIntentAsync(context) {
    console.log("======<<<> ", context._activity.channelData.ProfileName);
    var currentIntent = "";
    // console.log(this.previousIntent);
    const previousIntent = await this.previousIntent.get(context, {});
    // console.log(previousIntent);
    const conversationData = await this.conversationData.get(context, {});

    if (previousIntent.intentName && conversationData.endDialog === false) {
      currentIntent = previousIntent.intentName;
    } else if (
      previousIntent.intentName &&
      conversationData.endDialog === true
    ) {
      currentIntent = context.activity.text;
    } else {
      currentIntent = context.activity.text;
      await this.previousIntent.set(context, {
        intentName: context.activity.text,
      });
    }

    switch (currentIntent) {
      case "Make Reservation":
        await this.conversationData.set(context, { endDialog: false });
        await this.makeReservationDialog.run(context, this.dialogState);
        conversationData.endDialog =
          await this.makeReservationDialog.isDialogComplete();
        if (conversationData.endDialog) {
          // conversationData.endDialog = false;
          await this.previousIntent.set(context, { intentName: null });

          await this.addSugessionAction(context);
        }
        break;
      case "Show Reservation":
        await this.conversationData.set(context, { endDialog: false });
        await this.showReservation.run(context, this.dialogState);
        conversationData.endDialog =
          await this.showReservation.isDialogComplete();
        if (conversationData.endDialog) {
          // conversationData.endDialog = false;
          await this.previousIntent.set(context, { intentName: null });

          await this.addSugessionAction(context);
        }
        break;
      default:
        // client.notify
        //   .services("ISa94b8946b086fef5069f7e4c900fd820")
        //   .notifications.create({
        //     toBinding: JSON.stringify({
        //       binding_type: "sms",
        //       address: "7600616104",
        //     }),
        //     body: "Not valid option....",
        // identity: ["7600616104"],
        // })
        // .then((notification) => console.log(notification.sid));
        await context.sendActivity(
          `Hi ${context._activity.channelData.ProfileName} please type : Make Reservation\nto reserve your flight`
        );
        break;
    }
  }
}

module.exports = { EchoBot };
