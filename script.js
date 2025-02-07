const button1 = document.getElementById("button 1");

var e = document.createElement('div');
e.id = 'CyVkbnSaiUrJ';
e.style.display = 'none';
document.body.appendChild(e);

if(document.getElementById('CyVkbnSaiUrJ')) {
console.log('Ad block test passed.');
} else {
alert('It seems that you are using an ad blocker. Please disable it to help us analyze our website traffic.');
window.location.href = 'https://www.wikihow.com/Disable-AdBlock';
}

if (button1 && localStorage.setupCompleted) {
    button1.innerText = "Panel";
}