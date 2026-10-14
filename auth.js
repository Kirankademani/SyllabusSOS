
const authForm = document.getElementById("auth-form");
const signupButton = document.getElementById("signup");
const message = document.getElementById("message");

function showMessage(text) {
  message.textContent = text;
}

// SIGN IN
authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showMessage("Please enter your email and password.");
    return;
  }

  showMessage("Signing in...");

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    showMessage(error.message);
    return;
  }

  if (data.session) {
    showMessage("Sign in successful! Opening your planner...");

    window.location.href = "./index.html";
  } else {
    showMessage("Sign-in completed, but no active session was found.");
  }
});

// SIGN UP
signupButton.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || password.length < 8) {
    showMessage(
      "Enter a valid email and a password of at least 8 characters."
    );
    return;
  }

  showMessage("Creating your account...");

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if (error) {
    showMessage(error.message);
    return;
  }

  if (data.session) {
    showMessage("Account created successfully! Opening your planner...");

    window.location.href = "./index.html";
  } else {
    showMessage(
      "Account created! Check your email to confirm registration, then sign in."
    );
  }
});

