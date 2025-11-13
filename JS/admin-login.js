

document.addEventListener("DOMContentLoaded", () => {
  const toastEl = document.getElementById("toast");
  const toastBody = document.getElementById("toast-message");
  const toast = new bootstrap.Toast(toastEl);

  const phoneInput = document.getElementById("adminPhone");
  const rememberMe = document.getElementById("rememberMe");
  const passInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");

  // ✅ Show Toast Function
  function showToast(message, type = "primary") {
    toastBody.textContent = message;
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.show();
  }

  // ✅ Toggle Password Visibility
  togglePassword.addEventListener("click", () => {
    const icon = togglePassword.querySelector("i");
    const isPassword = passInput.type === "password";
    passInput.type = isPassword ? "text" : "password";

    // switch icon
    icon.classList.toggle("bi-eye");
    icon.classList.toggle("bi-eye-slash");
  });

  // ✅ Load saved admin phone (Remember Me)
  if (localStorage.getItem("rememberAdminPhone")) {
    phoneInput.value = localStorage.getItem("rememberAdminPhone");
    rememberMe.checked = true;
  }

  // ✅ Login Form Submit
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const admin_phone = phoneInput.value.trim();
    const admin_pass = passInput.value.trim();

    if (!admin_phone || !admin_pass) {
      showToast("Please enter phone and password", "warning");
      return;
    }

    try {
      const res = await fetch( `${BASE_URL}/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_phone, admin_pass }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Save Remember Me
        if (rememberMe.checked) {
          localStorage.setItem("rememberAdminPhone", admin_phone);
        } else {
          localStorage.removeItem("rememberAdminPhone");
        }

        // ✅ Save token and redirect
        localStorage.setItem("token", data.token);
        localStorage.setItem("admin_id", data.admin_id);

        showToast("Login successful!", "success");
        setTimeout(() => {
          window.location.href = `../HTML/admin-dashboard.html?admin_id=${data.admin_id}`;
        }, 1000);
      } else {
        showToast(data.message || "Invalid credentials", "danger");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error", "danger");
    }
  });
});
