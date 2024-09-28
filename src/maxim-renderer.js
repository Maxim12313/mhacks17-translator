const input = document.getElementById("popupInput");
const output = document.getElementById("translated");

let timeId = -1;
async function doTranslation() {
  const curr = input.value;
  const language = "fr";

  if (curr == "") {
    output.innerText = "";
    timeId = -1;
    return;
  }

  const res = await window.maxim.translateTo(input.value, language);
  if (!res.error) {
    output.innerText = res.text;
  } else {
    console.log(res.error);
  }
  timeId = -1;
}

input.addEventListener("input", async (event) => {
  clearTimeout(timeId);
  const delay = 150;
  timeId = setTimeout(doTranslation, delay);
});
