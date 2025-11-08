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

  document.getElementById("backToDashboard").addEventListener("click", () => {
    window.location.href = `../HTML/admin-dashboard.html?admin_id=${admin_id}`;
  });

  const deleteModalEl = document.getElementById("deleteConfirmModal");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  let selectedStudentId = null;

  function openDeleteModal(student_id) {
    selectedStudentId = student_id;
    const modal = new bootstrap.Modal(deleteModalEl);
    modal.show();
  }

  function getPlanStatus(expiryDate) {
    if (!expiryDate) return { text: "-", card: "card-active", daysLeft: 999 };

    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (days <= 0)
      return { text: "Expired", card: "card-expired", daysLeft: 0 };
    if (days <= 5)
      return { text: `${days} days left`, card: "card-warning", daysLeft: days };
    return { text: `${days} days left`, card: "card-active", daysLeft: days };
  }

  confirmDeleteBtn.addEventListener("click", async () => {
    if (!selectedStudentId) return;

    try {
      const res = await fetch(
        `http://localhost:5500/delete-student/${selectedStudentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (res.ok) {
        showToast("✅ Student deleted successfully", "success");
        setTimeout(() => location.reload(), 800);
      } else {
        showToast(data.message || "Failed to delete student", "danger");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error, please try again later.", "danger");
    }

    const modal = bootstrap.Modal.getInstance(deleteModalEl);
    modal.hide();
    selectedStudentId = null;
  });

  function updateStudent(student) {
    try {
      localStorage.setItem("updateStudent", JSON.stringify(student));
      window.location.href = `../HTML/update-students.html?student_id=${student.student_id}&admin_id=${admin_id}`;
    } catch (err) {
      console.error("Error saving student to localStorage:", err);
      showToast("Unable to redirect to update form", "danger");
    }
  }

  // ✅ WhatsApp Notification Helper
  function notifyStudent(student) {
    const phone = student.student_phone;
    const days = student.daysLeft;
    const name = student.student_name;

    let msg;
    if (days > 0)
      msg = `Hello ${name}, your library membership has ${days} day(s) remaining. Please renew soon. - Shree Swastik Library 📚`;
    else
      msg = `Hello ${name}, your library membership has expired. Please renew to continue enjoying our services. - Shree Swastik Library 📚`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  // ✅ Render Students with Notify Buttons
  function renderStudents(students) {
    const tableBody = document.getElementById("studentsTable");
    const cardContainer = document.getElementById("studentCards");
    const searchInput = document.getElementById("searchInput");

    const enhanced = students.map((s) => ({
      ...s,
      ...getPlanStatus(s.plan_expiry),
    }));

    const sorted = enhanced.sort((a, b) => a.daysLeft - b.daysLeft);
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = sorted.filter((s) =>
      s.student_name.toLowerCase().includes(searchTerm)
    );

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No matching students found.</td></tr>`;
      cardContainer.innerHTML = `<p class="text-center text-muted">No matching students found.</p>`;
      return;
    }

    // 🖥️ Desktop Table
    tableBody.innerHTML = filtered
      .map((s) => {
        const studentJSON = encodeURIComponent(JSON.stringify(s));
        return `
          <tr class="${s.card.replace("card-", "table-")}">
            <td>${s.student_name}</td>
            <td>${s.student_phone}</td>
            <td>${s.date_joining ? s.date_joining.split("T")[0] : "-"}</td>
            <td>${s.plan_expiry ? s.plan_expiry.split("T")[0] : "-"}</td>
            <td>${s.text}</td>
            <td>
              <button class="action-btn btn-update" data-student='${studentJSON}'>Update</button>
              <button class="action-btn btn-delete" data-id='${s.student_id}'>Delete</button>
              <button class="action-btn btn-notify" data-student='${studentJSON}'>Notify</button>
            </td>
          </tr>`;
      })
      .join("");

    // 📱 Mobile Cards
    cardContainer.innerHTML = filtered
      .map((s) => {
        const studentJSON = encodeURIComponent(JSON.stringify(s));
        return `
          <div class="student-card ${s.card}">
            <div class="student-name">${s.student_name}</div>
            <div class="student-detail">📞 ${s.student_phone}</div>
            <div class="student-detail">📅 Joined: ${s.date_joining ? s.date_joining.split("T")[0] : "-"}</div>
            <div class="student-detail">⏳ Expires: ${s.plan_expiry ? s.plan_expiry.split("T")[0] : "-"}</div>
            <div class="student-detail"><strong>🕒 ${s.text}</strong></div>
            <div class="mt-2 d-flex flex-wrap gap-2">
              <button class="action-btn btn-update" data-student='${studentJSON}'>Update</button>
              <button class="action-btn btn-delete" data-id='${s.student_id}'>Delete</button>
              <button class="action-btn btn-notify" data-student='${studentJSON}'>Notify</button>
            </div>
          </div>`;
      })
      .join("");

    // Event Listeners
    document.querySelectorAll(".btn-delete").forEach((btn) =>
      btn.addEventListener("click", (e) =>
        openDeleteModal(e.target.getAttribute("data-id"))
      )
    );
    document.querySelectorAll(".btn-update").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const student = JSON.parse(
          decodeURIComponent(e.target.getAttribute("data-student"))
        );
        updateStudent(student);
      })
    );
    document.querySelectorAll(".btn-notify").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const student = JSON.parse(
          decodeURIComponent(e.target.getAttribute("data-student"))
        );
        notifyStudent(student);
      })
    );

    searchInput.addEventListener("input", () => renderStudents(students));
  }

  // ✅ Notify All Students
  // document.getElementById("notifyAllBtn").addEventListener("click", async () => {
  //   try {
  //     const res = await fetch(`http://localhost:5500/students`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const data = await res.json();

  //     if (res.ok && Array.isArray(data.data)) {
  //       data.data.forEach((student) => {
  //         const enriched = { ...student, ...getPlanStatus(student.plan_expiry) };
  //         notifyStudent(enriched);
  //       });
  //     } else {
  //       showToast("Failed to load students for notification", "danger");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     showToast("Error notifying students", "danger");
  //   }
  // });

  // ✅ Fetch Students Initially
  try {
    const res = await fetch(`http://localhost:5500/students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (res.ok && Array.isArray(data.data)) {
      renderStudents(data.data);
    } else {
      showToast(data.message || "Failed to fetch students", "danger");
    }
  } catch (err) {
    console.error(err);
    showToast("Server error, please try again later.", "danger");
  }

  document.getElementById("dashboardLink").href = `../HTML/admin-dashboard.html?admin_id=${admin_id}`;
  document.getElementById("addStudentLink").href = `../HTML/add-student.html?admin_id=${admin_id}`;
});
