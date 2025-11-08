document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const toastEl = document.getElementById("toast");
  const toastBody = document.getElementById("toast-message");
  const toast = new bootstrap.Toast(toastEl);

  function showToast(message, type = "primary") {
    toastBody.textContent = message;
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.show();
  }

  if (!token) {
    showToast("Unauthorized access. Please login first.", "danger");
    setTimeout(() => window.location.href = "../HTML/admin-login.html", 1500);
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const admin_id = urlParams.get("admin_id");

  if (!admin_id) {
    showToast("Admin ID not found!", "danger");
    setTimeout(() => window.location.href = "../HTML/admin-dashboard.html", 1500);
    return;
  }

  // Update navbar links dynamically
  document.getElementById("addStudentLink").href = `../HTML/add-student.html?admin_id=${admin_id}`;
  document.getElementById("viewStudentsLink").href = `../HTML/manage-students.html?admin_id=${admin_id}`;
  document.getElementById("dashboardLink").href = `../HTML/admin-dashboard.html?admin_id=${admin_id}`;

  // ✅ Back to Dashboard button
  document.getElementById("backToDashboard").addEventListener("click", () => {
    window.location.href = `../HTML/admin-dashboard.html?admin_id=${admin_id}`;
  });

  // ✅ Cancel button redirects instead of just reset
  document.getElementById("cancelBtn").addEventListener("click", () => {
    window.location.href = `../HTML/admin-dashboard.html?admin_id=${admin_id}`;
  });

  // ✅ Add student logic
  document.getElementById("addStudentForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const student_name = document.getElementById("student_name").value.trim();
    const joining_date = document.getElementById("joining_date").value;
    const student_phone = document.getElementById("student_phone").value.trim();
    const plan_months = document.getElementById("plan_months").value;
    const plan_expiry = document.getElementById("plan_expiry").value;

    if (!student_name || !joining_date || !student_phone || !plan_months || !plan_expiry) {
      showToast("Please fill out all fields.", "warning");
      return;
    }

    if (!/^[0-9]{10}$/.test(student_phone)) {
      showToast("Enter a valid 10-digit phone number.", "warning");
      return;
    }

    if (new Date(plan_expiry) <= new Date(joining_date)) {
      showToast("'Valid Till' date must be after 'Date of Joining'.", "warning");
      return;
    }

    const studentData = {
      student_name,
      student_phone,
      student_email: "",
      added_by: parseInt(admin_id),
      plan_months: parseInt(plan_months),
      date_joining: new Date(joining_date).toISOString().split("T")[0],
      plan_expiry: new Date(plan_expiry).toISOString().split("T")[0],
    };

    try {
      const response = await fetch(`http://localhost:5500/register-student/${admin_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(studentData),
      });

      const result = await response.json();

      if (response.ok) {
        showToast("✅ Student added successfully!", "success");
        document.getElementById("addStudentForm").reset();
      } else {
        showToast(result.message || "Failed to add student.", "danger");
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to connect to server.", "danger");
    }
  });
});
