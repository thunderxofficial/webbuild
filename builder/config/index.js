const usrname = document.getElementById("usernameinput");
const agree = document.getElementById("agreetotos");


if (localStorage.getItem("setupCompleted")) {
    location.assign("/index.html");
};

function completeSetup() {
    if(usrname.value) {
        if(agree.checked) {
            localStorage.username = usrname.value;
            localStorage.setupCompleted = true;
            localStorage.sites = JSON.stringify([]);
            location.assign("/builder/index.html");
        } else {
            alert("You need to agree to the terms of service to continue.");
        }
    } else {
        alert("Please fill the username field.");
    };
};