const button1 = document.getElementById("button 1");

if (button1 && localStorage.setupCompleted) {
    button1.innerText = "Panel";
}