var returnToSignIn = document.getElementById("returnToSignIn");
if (returnToSignIn) {
    returnToSignIn.addEventListener("click", function (e) {
        window.location.href = "/login";
    });
}