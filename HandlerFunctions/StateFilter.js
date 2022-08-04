const { CardFactory } = require("botbuilder");
const country = require("../public/static/data.json");
const StateFilter = (value) => {
  var card;
  switch (value) {
    case "Gujarat":
      card = CardFactory.heroCard(
        "Please select state",
        [""],
        country.India.Gujarat
      );
      break;
    case "Rajasthan":
      card = CardFactory.heroCard(
        "Please select state",
        [""],
        country.India.Rajasthan
      );
      break;
    case "Maharastra":
      card = CardFactory.heroCard(
        "Please select state",
        [""],
        country.India.Maharastra
      );
      break;
    default:
      return false;
  }
  return { type: true, msg: card };
};
module.exports = {
  StateFilter,
};
