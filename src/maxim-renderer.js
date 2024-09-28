const input = document.getElementById("popupInput");
const output = document.getElementById("translated");

input.addEventListener("input", async (event) => {
  const curr = input.value;
  const language = "fr";
  const res = await window.maxim.translateTo(input.value, language);
  if (!res.error) {
    output.innerText = res.text;
  } else {
    console.log(res.error);
  }
});
