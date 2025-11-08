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

  // Cancel button → Back to Manage Students
  document.getElementById("cancelBtn").addEventListener("click", () => {
    window.location.href = `../HTML/manage-students.html?admin_id=${admin_id}`;
  });

  // Update form submit
  document
    .getElementById("updateStudentForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const updatedStudent = {
        student_name: document.getElementById("student_name").value.trim(),
        student_phone: document.getElementById("student_phone").value.trim(),
        date_joining: document.getElementById("date_joining").value,
        plan_months: document.getElementById("plan_months").value,
        plan_expiry: document.getElementById("plan_expiry").value,
      };

      // Simple frontend validation
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

      try {
        const res = await fetch(
          `http://localhost:5500/update-student/${admin_id}/${studentData.student_id}`,
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
          showToast("✅ Student updated successfully!", "success");
          localStorage.removeItem("updateStudent");

          setTimeout(() => {
            window.location.href = `../HTML/manage-students.html?admin_id=${admin_id}`;
          }, 1000);
        } else {
          showToast(data.message || "Failed to update student.", "danger");
        }
      } catch (err) {
        console.error(err);
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
});
