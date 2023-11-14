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

const form = document.getElementById("login");
if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        fetch(form.action,
            {
                method: "post",
                body: new FormData(form)
            }).then(
                r => {
                    if (!r.ok) {
                        //Invalid username/password
                        const invalid = document.getElementById("invalid");
                        invalid.toggleAttribute("hidden");
                    } else {
                        window.location = "/";
                    }
                }
        );
    });
}