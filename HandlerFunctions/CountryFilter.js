const { CardFactory } = require("botbuilder");
const country = require("../public/static/data.json");
const CountryFilter = (value) => {
  var card;
  switch (value) {
    case "India":
      card = CardFactory.heroCard(
        "Please select state",
        [""],
        Object.keys(country.India)
      );
      break;

    case "Canada":
      card = CardFactory.heroCard(
        "Please select state",
        [""],
        Object.keys(country.Canada)
      );
      break;

    case "Australia":
      card = CardFactory.heroCard(
        "Please select state",
        [""],
        Object.keys(country.Australia)
      );
      break;

    default:
      return false;
  }
  return { type: "card", msg: card };
};
module.exports = {
  CountryFilter,
};
