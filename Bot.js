const { ActivityHandler, MessageFactory, CardFactory } = require("botbuilder");
// const { CountryFilter } = require("./HandlerFunctions/CountryFilter");
// const { StateFilter } = require("./HandlerFunctions/StateFilter");
// const country = require("./public/static/data.json");
// const {
//   MakeReservationDialog,
// } = require("./componentDialog/makeReservationDialog");

// const { ShowReservation } = require("./componentDialog/showReservation");

// const accountSid = "ACc5e3b40fda53fdc9f3b9e50cb359fda7";
// const authToken = "d725013fe46852c6fd2813201581b885";
// const client = require("twilio")(accountSid, authToken);

const {
  TurnContext,
  // MessageFactory,
  TeamsInfo,
  TeamsActivityHandler,
  // CardFactory,
  ActionTypes,
} = require("botbuilder");

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
    // this.makeReservationDialog = new MakeReservationDialog(
    //   this.conversationState,
    //   this.userState
    // );

    // this.showReservation = new ShowReservation(
    //   this.conversationState,
    //   this.userState
    // );

    this.previousIntent =
      this.conversationState.createProperty("previousIntent");
    this.conversationData =
      this.conversationState.createProperty("conservationData");

    this.dialogState = this.conversationState.createProperty("dialogState");

    // this.onMembersAdded(async (context,next)=>{
    //   const members = context.activity.membersAdded
    //   for(members of membersAdded){
    //     if(members.id != context.activity.recipient.id)
    //     {
    //       await context.sendActivities("Hello ! How can i Help You ?")
    //     }
    //   }
    // })
    this.onMessage(async (context,next)=>{
      
          return await context.sendActivity(`You said : ${context.activity.text}`)
        
          await next()
      
    })
    // this.onMessage(async (context, next) => {
    //   const text = context.activity.text.trim().toLocaleLowerCase();
    //   if (text.includes("delete")) {
    //     await this.deleteCardActivityAsync(context);
    //   } else {
    //     await this.cardActivityAsync(context, false);
    //   }
    //   await next();
    // });
    // let text = context.activity.text;
    // let val = context.activity.value;
    // console.log("Received location!", context);
    // if (
    //   context.activity.attachments &&
    //   context.activity.attachments.length > 0
    // ) {
    //   console.log("Received location!");
    //   console.log(context.activity.attachments[0]);
    //   for (const attachment of context.activity.attachments) {
    //     console.log("Received location!");
    //     if (
    //       attachment.contentType === "application/json" &&
    //       attachment.content.type === "GeoCoordinates"
    //     ) {
    //       console.log("Received location!");
    //       await context.sendActivity(`Received a location.
    //               ${attachment.content.name} (${attachment.content.latitude}:${attachment.content.longitude})`);
    //     }
    //   }
    // }
    // if (!text && val) {
    //   console.log(">>>>>>>>>>>>>.. ", val);
    //   console.log("thank you for feedback");
    //   await context.sendActivity(
    // MessageFactory.text("thank you for your feedback")
    // );
    // } else {
    //   await this.dispatchToIntentAsync(context);
    // }
    //   await next();
    // }

    this.onDialog(async (context, next) => {
      // Save any state changes. The load happened during the execution of the Dialog.
      // console.log(context);
      await this.conversationState.saveChanges(context, false);
      await this.userState.saveChanges(context, false);
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      await this.sendWelcomeMessage(context);
      await this.addSugessionAction(context)
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
        // await this.addSugessionAction(context);
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

  async cardActivityAsync(context, isUpdate) {
    const cardActions = [
      {
        type: ActionTypes.MessageBack,
        title: "Message all members",
        value: null,
        text: "MessageAllMembers",
      },
      {
        type: ActionTypes.MessageBack,
        title: "Who am I?",
        value: null,
        text: "whoami",
      },
      {
        type: ActionTypes.MessageBack,
        title: "Delete card",
        value: null,
        text: "Delete",
      },
    ];

    if (isUpdate) {
      await this.sendUpdateCard(context, cardActions);
    } else {
      await this.sendWelcomeCard(context, cardActions);
    }
  }

  async deleteCardActivityAsync(context) {
    await context.deleteActivity(context.activity.replyToId);
  }

  async sendUpdateCard(context, cardActions) {
    const data = context.activity.value;
    data.count += 1;
    cardActions.push({
      type: ActionTypes.MessageBack,
      title: "Update Card",
      value: data,
      text: "UpdateCardAction",
    });
    const card = CardFactory.heroCard(
      "Updated card",
      `Update count: ${data.count}`,
      null,
      cardActions
    );
    card.id = context.activity.replyToId;
    const message = MessageFactory.attachment(card);
    message.id = context.activity.replyToId;
    await context.updateActivity(message);
  }

  async sendWelcomeCard(context, cardActions) {
    const initialValue = {
      count: 0,
    };
    cardActions.push({
      type: ActionTypes.MessageBack,
      title: "Update Card",
      value: initialValue,
      text: "UpdateCardAction",
    });
    const card = CardFactory.heroCard("Welcome card", "", null, cardActions);
    await context.sendActivity(MessageFactory.attachment(card));
  }
}
// ee27bd0b-0cea-4b3c-ae1e-13126771d4ea
module.exports = { EchoBot };
