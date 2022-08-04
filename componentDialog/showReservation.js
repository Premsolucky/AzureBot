const {
  WaterfallDialog,
  ComponentDialog,
  DialogTurnStatus,
  DialogSet,
} = require("botbuilder-dialogs");

const fs = require("fs");

const {
  ConfirmPrompt,
  ChoicePrompt,
  TextPrompt,
} = require("botbuilder-dialogs");

const CHOICE_PROMPT = "CHOICE_PROMPT";
const CONFIRM_PROMPT = "CONFIRM_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const WATERFALL_DIALOG = "WATERFALL_DIALOG";
var endDialog = "";

class ShowReservation extends ComponentDialog {
  constructor(conversationState, userState) {
    super("ShowReservation");

    this.addDialog(new TextPrompt(TEXT_PROMPT));
    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
    this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));

    this.addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [
        this.firstStep.bind(this),
        this.confirmStep.bind(this),
        this.summarystep.bind(this),
      ])
    );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async run(truncContext, accesor) {
    const dialogSet = new DialogSet(accesor);
    dialogSet.add(this);
    const dialogContext = await dialogSet.createContext(truncContext);

    const result = await dialogContext.continueDialog();
    if (result.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }

  async firstStep(step) {
    endDialog = false;
    return await step.prompt(TEXT_PROMPT, "Please Enter Reservation ID?");
  }

  async confirmStep(step) {
    step.values.Id = step.result;
    var msg = `Please confirm your ID : ${step.values.Id} `;
    await step.context.sendActivity(msg);
    return await step.prompt(CONFIRM_PROMPT, "Is it Correct?", ["yes", "no"]);
  }

  async summarystep(step) {
    if (step.result === true) {
      var data = fs.readFileSync("reservationData.txt");
      data = JSON.parse(data);
      var msg = `Please confirm bellow details \n Name : ${data.name} \n participants: ${data.npOfParticipants} \n Date: ${data.date} \n Time: ${data.time} \n status: Done`;
      if (String(data.reservationId) == step.values.Id) {
        await step.context.sendActivity(msg);
        endDialog = true;
        return await step.endDialog();
      } else {
        return await step.context.sendActivity(`Please Provide valid id`);
      }
    }
  }

  async isDialogComplete() {
    return endDialog;
  }
}

module.exports = {
  ShowReservation,
};
