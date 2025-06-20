const scriptURL = "https://script.google.com/macros/s/AKfycbywJdQfBf8wTDlI5qJBiG0xwzffY7fXCvJ4SbDBTlbjcVNy92aeB6mC9g82gCjHr0XC8Q/exec";

const form = document.getElementById("bookingForm");
const sessionSelect = document.getElementById("session");
const toastContainer = document.getElementById("toastContainer");

form.bookingDate.addEventListener("change", async () => {
  const date = form.bookingDate.value;
  sessionSelect.innerHTML = "<option>Loading...</option>";
  try {
    const res = await fetch(scriptURL);
    const data = await res.json();

    const morningKey = `${date}_morning`;
    const afternoonKey = `${date}_afternoon`;

    const morningAvailable = (data[morningKey] || 0) < 10;
    const afternoonAvailable = (data[afternoonKey] || 0) < 10;

    let options = "<option value=''>Select Session</option>";
    if (morningAvailable) {
      options += "<option value='morning'>Morning ✅</option>";
    } else {
      options += "<option disabled>Morning ❌ Full</option>";
    }

    if (afternoonAvailable) {
      options += "<option value='afternoon'>Afternoon ✅</option>";
    } else {
      options += "<option disabled>Afternoon ❌ Full</option>";
    }

    sessionSelect.innerHTML = options;
  } catch (error) {
    showToast("Failed to load session availability", "error");
    sessionSelect.innerHTML = "<option>Error loading</option>";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    email: form.email.value,
    rollNumber: form.rollNumber.value,
    laptopModel: form.laptopModel.value,
    bookingDate: form.bookingDate.value,
    session: form.session.value
  };

  try {
    const res = await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    const type = result.status === "success"
      ? "success"
      : result.status === "blocked"
      ? "blocked"
      : "error";

    let message = result.message;

    if (result.status === "blocked" && result.nextAllowedSlot) {
      message += `\nNext: ${result.nextAllowedSlot.date} (${result.nextAllowedSlot.session})`;
    }

    showToast(message, type);

    if (result.status === "success") {
      form.reset();
      sessionSelect.innerHTML = "<option value=''>Select Session</option>";
    }

  } catch (err) {
    console.error(err);
    showToast("Something went wrong while booking.", "error");
  }
});

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}
