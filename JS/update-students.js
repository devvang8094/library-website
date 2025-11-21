document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const admin_id =
    new URLSearchParams(window.location.search).get("admin_id") ||
    localStorage.getItem("admin_id");

  if (!token || !admin_id) {
    window.location.href = "../HTML/admin-login.html";
    return;
  }

  const toastEl = document.getElementById("toast");
  const toastBody = document.getElementById("toast-message");
  const toast = new bootstrap.Toast(toastEl);

  function showToast(message, type = "primary") {
    toastBody.textContent = message;
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.show();
  }

  const studentData = JSON.parse(localStorage.getItem("updateStudent"));
  if (!studentData) {
    showToast("No student data found", "danger");
    setTimeout(() => {
      window.location.href = `../HTML/manage-students.html?admin_id=${admin_id}`;
    }, 1000);
    return;
  }

  // Prefill form fields
  document.getElementById("student_name").value = studentData.student_name || "";
  document.getElementById("student_phone").value = studentData.student_phone || "";
  document.getElementById("date_joining").value = studentData.date_joining
    ? studentData.date_joining.split("T")[0]
    : "";
  document.getElementById("plan_months").value = studentData.plan_months || "1";
  document.getElementById("plan_expiry").value = studentData.plan_expiry
    ? studentData.plan_expiry.split("T")[0]
    : "";

  // Calculate active days
  function calculateActiveDays() {
    const joinDate = document.getElementById("date_joining").value;
    const expiryDate = document.getElementById("plan_expiry").value;
    if (!joinDate || !expiryDate) return;
    const diffMs = new Date(expiryDate) - new Date(joinDate);
    const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    document.getElementById("active_days").value = `${days} days`;
  }

  document.getElementById("date_joining").addEventListener("change", calculateActiveDays);
  document.getElementById("plan_expiry").addEventListener("change", calculateActiveDays);

  // Auto-fill expiry when plan months or join date changes
  document.getElementById("plan_months").addEventListener("change", () => {
    const joinDate = document.getElementById("date_joining").value;
    const months = parseInt(document.getElementById("plan_months").value);
    if (!joinDate || !months) return;
    const date = new Date(joinDate);
    date.setMonth(date.getMonth() + months);
    const formatted = date.toISOString().split("T")[0];
    document.getElementById("plan_expiry").value = formatted;
    calculateActiveDays();
  });

  // Cancel button → Back to Manage Students
  document.getElementById("cancelBtn").addEventListener("click", () => {
    window.location.href = `../HTML/manage-students.html?admin_id=${admin_id}`;
  });

  // Update form submit
  document.getElementById("updateStudentForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedStudent = {
      student_name: document.getElementById("student_name").value.trim(),
      student_phone: document.getElementById("student_phone").value.trim(),
      date_joining: document.getElementById("date_joining").value,
      plan_months: document.getElementById("plan_months").value,
      plan_expiry: document.getElementById("plan_expiry").value,
    };

    if (
      !updatedStudent.student_name ||
      !updatedStudent.student_phone ||
      !updatedStudent.date_joining ||
      !updatedStudent.plan_months ||
      !updatedStudent.plan_expiry
    ) {
      showToast("Please fill in all fields before updating.", "danger");
      return;
    }

    // phone validation
    if (!/^[0-9]{10}$/.test(updatedStudent.student_phone)) {
      showToast("Enter a valid 10-digit phone number.", "danger");
      return;
    }

    try {
      const res = await fetch(
        `${BASE_URL}/update-student/${admin_id}/${studentData.student_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedStudent),
        }
      );

      const data = await res.json();

      if (res.ok) {
        showToast(`✅ Student updated successfully! Active Days: ${data.active_days}`, "success");
        localStorage.removeItem("updateStudent");

        setTimeout(() => {
          window.location.href = `../HTML/manage-students.html?admin_id=${admin_id}`;
        }, 1200);
      } else {
        showToast(data.message || "Failed to update student.", "danger");
      }
    } catch (err) {
      console.log(err);
      showToast("Server error. Please try again later.", "danger");
    }
  });

  // Dynamic Navbar Links
  document.getElementById(
    "dashboardLink"
  ).href = `../HTML/admin-dashboard.html?admin_id=${admin_id}`;
  document.getElementById(
    "manageStudentLink"
  ).href = `../HTML/manage-students.html?admin_id=${admin_id}`;

  // Run once to fill active days
  calculateActiveDays();
});
