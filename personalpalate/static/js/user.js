const returnToSignIn = document.getElementById("returnToSignIn");
if (returnToSignIn) {
    returnToSignIn.addEventListener("click", function (e) {
        window.location.href = "/login";
    });
}

const returnToSignUp = document.getElementById("returnToSignUp");
if (returnToSignUp) {
    returnToSignUp.addEventListener("click", function (e) {
        window.location.href = "/sign-up";
    });
}