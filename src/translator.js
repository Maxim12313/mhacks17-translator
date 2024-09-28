const deepl = require("deepl-node");

const authkey = "9e6ec4bd-b318-4768-b361-0784175a62d4:fx";
const translator = new deepl.Translator(authkey);

export default async function translateTo(input, language) {
  const res = await translator.translateText(input, null, language);
  console.log("res is: " + res);
  return res;
}
