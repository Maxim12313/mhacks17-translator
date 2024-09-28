const input = document.getElementById("popupInput");
const output = document.getElementById("translated");

let timeId = -1;
let prev = 0;
function throttleDebounce(func, limit) {
  const curr = new Date().getTime();
  const diff = curr - prev;
  if (diff > limit) {
    prev = curr;
    func();
    clearTimeout(timeId);
    timeId = -1;
  } else {
    timeId = setTimeout(() => {
      prev = new Date().getTime();
      func();
      clearTimeout(timeId);
      timeId = -1;
    }, limit);
  }
}

async function doTranslation() {
  const curr = input.value;
  const language = "fr";

  if (curr == "") {
    output.innerText = "";
    return;
  }
  const res = await window.maxim.translateTo(input.value, language);
  if (!res.error) {
    output.innerText = res.text;
  } else {
    console.log(res.error);
  }
}

input.addEventListener("input", async (event) => {
  throttleDebounce(doTranslation, 500);
});
