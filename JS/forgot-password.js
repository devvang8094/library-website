document.addEventListener("DOMContentLoaded", () => {
  const toastEl = document.getElementById("toast");
  const toastBody = document.getElementById("toast-message");
  const toast = new bootstrap.Toast(toastEl);

  const showToast = (msg, type = "primary") => {
    toastBody.textContent = msg;
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.show();
  };

  const sendOtpForm = document.getElementById("sendOtpForm");
  const verifyOtpForm = document.getElementById("verifyOtpForm");
  const resetPasswordForm = document.getElementById("resetPasswordForm");

  const adminPhoneInput = document.getElementById("adminPhone");
  const otpInput = document.getElementById("otp");
  const newPasswordInput = document.getElementById("newPassword");

  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");

  let admin_phone = "";

  // 🔹 Countdown function (works on any button)
  function startCountdown(button, baseText, seconds = 39) {
    button.disabled = true;
    let remaining = seconds;

    const updateText = () => {
      button.textContent = `${baseText} (${remaining}s)`;
      remaining--;

      if (remaining < 0) {
        clearInterval(timer);
        button.disabled = false;
        button.textContent = baseText;
      }
    };

    updateText();
    const timer = setInterval(updateText, 1000);
  }

  // Step 1 - Send OTP
  sendOtpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    admin_phone = adminPhoneInput.value.trim();
    if (!admin_phone) return showToast("Enter your phone number", "warning");

    // Start countdown immediately on click
    startCountdown(sendOtpBtn, "Send OTP", 39);

    try {
      const res = await fetch(`${BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_phone }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("OTP sent to your registered email", "success");

        // Switch forms
        sendOtpForm.classList.add("d-none");
        verifyOtpForm.classList.remove("d-none");
      } else {
        showToast(data.message || "Failed to send OTP", "danger");
      }
    } catch (error) {
      console.error(error);
      showToast("Server error", "danger");
    }
  });

  // Step 2 - Verify OTP
  verifyOtpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const otp = otpInput.value.trim();
    if (!otp) return showToast("Enter OTP", "warning");

    // Start countdown immediately on click
    // startCountdown(verifyOtpBtn, "Verify OTP", 39);

    try {
      const res = await fetch(`${BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_phone, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("OTP verified successfully", "success");

        verifyOtpForm.classList.add("d-none");
        resetPasswordForm.classList.remove("d-none");
      } else {
        showToast(data.message || "Invalid OTP", "danger");
      }
    } catch (error) {
      console.error(error);
      showToast("Server error", "danger");
    }
  });

  // Step 3 - Reset Password
  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const new_password = newPasswordInput.value.trim();
    if (!new_password) return showToast("Enter new password", "warning");

    try {
      const res = await fetch(`${BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_phone, new_password }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Password reset successful!", "success");
        setTimeout(() => (window.location.href = "./admin-login.html"), 1500);
      } else {
        showToast(data.message || "Error resetting password", "danger");
      }
    } catch (error) {
      console.error(error);
      showToast("Server error", "danger");
    }
  });
});
