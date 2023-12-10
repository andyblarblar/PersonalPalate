const returnToSignIn = document.getElementById("returnToSignIn");
if (returnToSignIn) {
    returnToSignIn.addEventListener("click", function (e) {
        window.location.href = "/login";
    });
}

const returnToSignUp = document.getElementById("returnToSignUp");
if (returnToSignUp) {
    returnToSignUp.addEventListener("click", function (e) {
        window.location.href = "/signup";
    });
}

const login_form = document.getElementById("login");
if (login_form) {
    login_form.addEventListener("submit", (e) => {
        e.preventDefault();

        fetch(login_form.action,
            {
                method: "post",
                body: new FormData(login_form)
            }).then(
                r => {
                    if (!r.ok) {
                        //Invalid email/password
                        const invalid = document.getElementById("invalid");
                        invalid.toggleAttribute("hidden");
                    } else {
                        window.location = "/";
                    }
                }
        );
    });
}

const signup_form = document.getElementById("signup");
if (signup_form) {
    signup_form.addEventListener("submit", (e) => {
        e.preventDefault();

        fetch(signup_form.action,
            {
                method: "post",
                body: new FormData(signup_form),
            }).then(
                r => {
                    if (!r.ok) {
                        // Email already taken
                        const invalid = document.getElementById("invalid");
                        invalid.toggleAttribute("hidden");
                    } else {
                        alert("Account created successfully!");
                        window.location = "/";
                    }
                }
        );
    });
}