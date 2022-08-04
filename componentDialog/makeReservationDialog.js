const { MessageFactory, CardFactory, TurnContext } = require("botbuilder-core");
const { FEEDBACKDIALOG, FeedbackDialog } = require("./FeedbackDialog");
const { FeedbackDetails } = require("./FeedbackDetail");
const fs = require("fs");
const {
  WaterfallDialog,
  ComponentDialog,
  DialogTurnStatus,
  DialogSet,
} = require("botbuilder-dialogs");
const { ActivityTypes, ActivityHandler } = require("botbuilder");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);

var count = 1;

const card = require("./feedbackCard.json");
const {
  ConfirmPrompt,
  ChoicePrompt,
  DateTimePrompt,
  NumberPrompt,
  TextPrompt,
  OAuthPrompt,
} = require("botbuilder-dialogs");

const CHOICE_PROMPT = "CHOICE_PROMPT";
const CONFIRM_PROMPT = "CONFIRM_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const NUMBER_PROMPT = "NUMBER_PROMPT";
const DATETIME_PROMPT = "DATETIME_PROMPT";
const OAUTH_PROMPT = "OAUTH_PROMPT";

const WATERFALL_DIALOG = "WATERFALL_DIALOG";
var endDialog = "";

class MakeReservationDialog extends ComponentDialog {
  constructor(conversationState, userState) {
    super("MakeReservationDialog");

    this.addDialog(new TextPrompt(TEXT_PROMPT));
    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
    this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
    this.addDialog(new ConfirmPrompt(OAUTH_PROMPT));

    this.addDialog(
      new NumberPrompt(NUMBER_PROMPT, this.NoOfParticipantValidator)
    );
    this.addDialog(new DateTimePrompt(DATETIME_PROMPT));

    this.addDialog(new FeedbackDialog());

    this.addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [
        // this.firstStep.bind(this),
        this.getName.bind(this),
        this.getDate.bind(this),
        this.getTime.bind(this),
        this.locationStep.bind(this),
        this.confirmStep.bind(this),
        // this.summarystep.bind(this),
        // this.finalstep.bind(this),
        // this.feedbackstep.bind(this),
      ])
    );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async run(trunContext, accesor) {
    endDialog = false;
    const dialogSet = new DialogSet(accesor);
    dialogSet.add(this);
    const dialogContext = await dialogSet.createContext(trunContext);
    const result = await dialogContext.continueDialog();
    console.log("result: ", result);
    if (result.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }

  // async firstStep(step) {
  //   endDialog = false;
  //   return await step.prompt(
  //     CONFIRM_PROMPT,
  //     "would you like to make a reservation?",
  //     ["yes", "no"]
  //   );
  // }

  async getName(step) {
    // console.log("name");
    // const msg = {
    //   to: "prajapatipratik844@gmail.com",
    //   from: "prajapatipratik844@gmail.com",
    //   subject: "demo-mail",
    //   text: "hii it's only for demo purpose.",
    // };
    // await sgMail.send(msg);

    // return await step.beginDialog(FEEDBACKDIALOG);

    // return await step.prompt(OAUTH_PROMPT, "Please Provide Your Name: ");
    // return await step.beginDialog(OAUTH_PROMPT);

    return await step.prompt(TEXT_PROMPT, "Please Provide Your Name: ");
  }

  async getDate(step) {
    console.log("=====> ", step.result);
    step.values.name = step.result;
    return await step.prompt(
      TEXT_PROMPT,
      "On Which date you want to make reservation?"
    );
  }

  async getTime(step) {
    step.values.date = step.result;
    return await step.prompt(TEXT_PROMPT, "At What time?");
  }

  async locationStep(step) {
    // step.values.time = step.result;
    // var msg = `Please confirm bellow details \n Name : ${
    //   step.values.name
    // }  \n Date: ${JSON.stringify(step.values.date)} \n Time: ${JSON.stringify(
    //   step.values.time
    // )}`;
    // return await step.context.sendActivity(msg);
    // //return await step.prompt(CONFIRM_PROMPT, "Is it Correct?", ["yes", "no"]);
    // const replyWithLocation = {
    //   type: ActivityTypes.Message,
    //   text: "Microsoft Nederland",
    //   channelData: {
    //     persistentAction: "geo:52.3037702,4.7501761|Microsoft NL",
    //   },
    // };

    // await context.sendActivity(replyWithLocation);

    return await step.prompt(TEXT_PROMPT, "is it ok?");
  }

  async confirmStep(step) {
    step.values.location = step.result;
    // var msg = `Please confirm bellow details \n Name : ${
    //   step.values.name
    // }  \n Date: ${JSON.stringify(step.values.date)} \n Time: ${JSON.stringify(
    //   step.values.time
    // )}`;

    const replyWithAttachment = {
      type: ActivityTypes.Message,
      text: `You replied ${step.result}`,
      attachments: [
        {
          contentType: "image/png",
          contentUrl:
            "https://docs.microsoft.com/en-us/bot-framework/media/how-it-works/architecture-resize.png",
        },
      ],
    };

    await step.context.sendActivity(replyWithAttachment);
    endDialog = true;
    return await step.endDialog();

    // return await step.context.sendActivity(msg);
    // return await step.prompt(CONFIRM_PROMPT, "Is it Correct?", ["yes", "no"]);
  }

  // async summarystep(step) {
  //   // if (step.result === true) {
  //   // step.values.reservationId = count;
  //   // count++;
  //   // var data = JSON.stringify(step.values);
  //   // fs.writeFileSync("reservationData.txt", data);
  //   // console.log("done");
  //   // await step.context.sendActivity(
  //   //   `Your Reservation Process completed \n ReservationId : ${step.values.reservationId}`
  //   // );
  //   // let feedbackDetails = new FeedbackDetails();
  //   // await step.replaceDialog("feedbackDialog");

  //   // let msg = MessageFactory.attachment(
  //   //   CardFactory.heroCard(
  //   //     "What would you like?",
  //   //     [],
  //   //     ["Good", "Average", "Bad"]
  //   //   )
  //   // );

  //   // await step.context.sendActivity({
  //   //   text: "Provide Your Valuable Feedback",
  //   //   attachments: [CardFactory.adaptiveCard(card)],
  //   // });
  //   endDialog = true;
  //   return await step.endDialog();

  //   // await step.context.sendActivity(msg);

  //   // return await step.prompt(TEXT_PROMPT);
  //   // }
  // }

  // async finalstep(step) {
  //   console.log("done");
  //   console.log(">>>>>>>", step);
  //   let msg = " a ";
  //   if (step.result === "Good") {
  //     msg = "Thank you for giving feedback";
  //   } else if (step.result === "Average") {
  //     msg = "Thank you for your feedback we will try improve this bot";
  //   } else {
  //     msg = "Thank you for feedback we will try to improve this bot";
  //   }
  //   await step.context.sendActivity(msg);
  //   endDialog = true;
  //   return await step.endDialog();
  // }

  // async feedbackstep(step) {
  //   return await step.context.sendActivity({
  //     text: "Provide Your Valuable Feedback",
  //     attachments: [CardFactory.adaptiveCard(card)],
  //   });
  // }

  async NoOfParticipantValidator(promptContext) {
    return (
      promptContext.recognized.succeeded &&
      promptContext.recognized.value >= 1 &&
      promptContext.recognized.value < 150
    );
  }

  async isDialogComplete() {
    return endDialog;
  }
}

module.exports = {
  MakeReservationDialog,
};
