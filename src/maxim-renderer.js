const button = document.getElementById("button");
button.onclick = async () => {
  const input = document.getElementById("popupInput");
  const res = await window.maxim.translateTo(input.value, "fr");
  console.log("res from renderer: " + res);
  if (res.error) {
    console.log("from client: " + res.error);
  } else {
    console.log("from client " + res.text);
  }
};
