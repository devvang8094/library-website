document.addEventListener("DOMContentLoaded", async () => {
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

  function showToast(msg, type = "danger") {
    toastBody.textContent = msg;
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.show();
  }

  const tableBody = document.getElementById("studentsTable");
  const cardContainer = document.getElementById("studentCards");
  const searchInput = document.getElementById("searchInput");

  function getPlanStatus(expiryDate) {
    if (!expiryDate) return { text: "-", card: "card-active" };
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (days <= 0) return { text: "Expired", color: "expired-text", card: "card-expired" };
    if (days <= 5) return { text: `${days} days left`, color: "warning-text", card: "card-warning" };
    return { text: `${days} days left`, color: "days-remaining", card: "card-active" };
  }

  function renderStudents(students) {
    const sorted = [...students].sort((a, b) =>
      a.student_name.localeCompare(b.student_name)
    );

    const searchTerm = searchInput.value.toLowerCase();
    const filtered = sorted.filter((s) =>
      s.student_name.toLowerCase().includes(searchTerm)
    );

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No matching students found.</td></tr>`;
      cardContainer.innerHTML = `<p class="text-center text-muted">No matching students found.</p>`;
      return;
    }

    // Desktop Table
    tableBody.innerHTML = filtered
      .map((s) => {
        const plan = getPlanStatus(s.plan_expiry);
        return `
          <tr class="${plan.card.replace('card-', 'table-')}">
            <td>${s.student_name}</td>
            <td>${s.student_phone}</td>
            <td>${s.date_joining ? s.date_joining.split("T")[0] : "-"}</td>
            <td>${s.plan_expiry ? s.plan_expiry.split("T")[0] : "-"}</td>
            <td class="${plan.color}">${plan.text}</td>
            <td>${s.total_active_days || 0}</td>
          </tr>`;
      })
      .join("");

    // Mobile Cards
    cardContainer.innerHTML = filtered
      .map((s) => {
        const plan = getPlanStatus(s.plan_expiry);
        return `
        <div class="student-card ${plan.card}">
          <div class="student-name">${s.student_name}</div>
          <div class="student-detail">📞 ${s.student_phone}</div>
          <div class="student-detail">📅 Joined: ${s.date_joining?.split("T")[0] || "-"}</div>
          <div class="student-detail">⏳ Expires: ${s.plan_expiry?.split("T")[0] || "-"}</div>
          <div class="student-detail ${plan.color}">🕒 ${plan.text}</div>
          <div class="student-detail fw-bold">📆 Total Active Days: ${s.total_active_days || 0}</div>
        </div>`;
      })
      .join("");
  }

  try {
    const res = await fetch(`${BASE_URL}/students`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.ok && Array.isArray(data.data)) {
      const students = data.data;
      renderStudents(students);
      searchInput.addEventListener("input", () => renderStudents(students));
    } else {
      showToast(data.message || "Failed to fetch students");
    }
  } catch (err) {
    console.error(err);
    showToast("Server error, please try again later.");
  }

  // Navbar links
  document.getElementById(
    "dashboardLink"
  ).href = `../HTML/admin-dashboard.html?admin_id=${admin_id}`;
  document.getElementById(
    "addStudentLink"
  ).href = `../HTML/add-student.html?admin_id=${admin_id}`;
});
