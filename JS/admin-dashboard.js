
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const admin_id = localStorage.getItem("admin_id");

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

  // Fetch Students
  try {
    const res = await fetch(`${BASE_URL}/students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (res.ok && Array.isArray(data.data)) {
      const students = data.data;
      document.getElementById("studentCount").textContent = students.length;
      localStorage.setItem("studentCount", students.length);
    } else {
      showToast(data.message || "Failed to load students", "danger");
    }
  } catch (err) {
    console.error(err);
    showToast("Server error", "danger");
  }

  // Quick Action buttons
  document.getElementById("addStudentBtn").addEventListener("click", () => {
    window.location.href = `../HTML/add-student.html?admin_id=${admin_id}`;
  });

  document.getElementById("manageStudentBtn").addEventListener("click", () => {
    window.location.href = `../HTML/manage-students.html?admin_id=${admin_id}`;
  });

  document.getElementById("viewBtn").addEventListener("click", () => {
    window.location.href = `../HTML/view-students.html?admin_id=${admin_id}`;
  });

  // Navbar Links
  document.getElementById("dashboardLink").href = `../HTML/admin-dashboard.html?admin_id=${admin_id}`;
  document.getElementById("addStudentLink").href = `../HTML/add-student.html?admin_id=${admin_id}`;
  document.getElementById("manageStudentLink").href = `../HTML/manage-students.html?admin_id=${admin_id}`;
});
