
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

  // 🔐 Token check
  if (!token) {
    showToast("Unauthorized access. Please login first.", "danger");
    setTimeout(() => {
      window.location.href = "../HTML/admin-login.html";
    }, 1500);
    return;
  }

  // 🌐 Get admin_id from URL
  const urlParams = new URLSearchParams(window.location.search);
  const admin_id = urlParams.get("admin_id");

  if (!admin_id) {
    showToast("Admin ID not found!", "danger");
    setTimeout(() => {
      window.location.href = "../HTML/admin-dashboard.html";
    }, 1500);
    return;
  }

  // 🔗 Update navbar links
  document.getElementById("addStudentLink").href =
    `../HTML/add-student.html?admin_id=${admin_id}`;
  document.getElementById("viewStudentsLink").href =
    `../HTML/manage-students.html?admin_id=${admin_id}`;
  document.getElementById("dashboardLink").href =
    `../HTML/admin-dashboard.html?admin_id=${admin_id}`;

  // ⬅ Back buttons
  document.getElementById("backToDashboard").addEventListener("click", () => {
    window.location.href = `../HTML/admin-dashboard.html?admin_id=${admin_id}`;
  });

  document.getElementById("cancelBtn").addEventListener("click", () => {
    window.location.href = `../HTML/admin-dashboard.html?admin_id=${admin_id}`;
  });

  // ===========================
  // 🧮 Auto Plan Calculation
  // ===========================

  const joiningDateInput = document.getElementById("joining_date");
  const planMonthsSelect = document.getElementById("plan_months");
  const expiryDateInput = document.getElementById("plan_expiry");

  function updateExpiryDate() {
    const joiningDateValue = joiningDateInput.value;
    const planMonthsValue = parseInt(planMonthsSelect.value);

    if (!joiningDateValue || isNaN(planMonthsValue)) return;

    const joinDate = new Date(joiningDateValue);
    const expiryDate = new Date(joinDate);
    expiryDate.setMonth(expiryDate.getMonth() + planMonthsValue);

    const year = expiryDate.getFullYear();
    const month = String(expiryDate.getMonth() + 1).padStart(2, "0");
    const day = String(expiryDate.getDate()).padStart(2, "0");

    expiryDateInput.value = `${year}-${month}-${day}`;
  }

  joiningDateInput.addEventListener("change", updateExpiryDate);
  planMonthsSelect.addEventListener("change", updateExpiryDate);

  // ===========================
  // 💾 Add Student Logic
  // ===========================

  document.getElementById("addStudentForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const student_name = document.getElementById("student_name").value.trim();
    const student_phone = document.getElementById("student_phone").value.trim();
    const joining_date = joiningDateInput.value;
    const plan_months = planMonthsSelect.value;
    const plan_expiry = expiryDateInput.value;

    // 🧩 Validations
    if (!student_name || !student_phone || !joining_date || !plan_months || !plan_expiry) {
      showToast("Please fill out all fields.", "warning");
      return;
    }

    if (!/^[0-9]{10}$/.test(student_phone)) {
      showToast("Enter a valid 10-digit phone number.", "warning");
      return;
    }

    if (new Date(plan_expiry) <= new Date(joining_date)) {
      showToast("'Valid Till' must be after 'Joining Date'.", "warning");
      return;
    }

    const studentData = {
      student_name,
      student_phone,
      student_email: "",
      added_by: parseInt(admin_id),
      plan_months: parseInt(plan_months),
      date_joining: joining_date,
      plan_expiry
    };

    try {
      const response = await fetch(
        `${BASE_URL}/register-student/${admin_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(studentData),
        }
      );

      const result = await response.json();

      // ✅ SUCCESS
      if (response.ok) {
        showToast("✅ Student added successfully!", "success");
        document.getElementById("addStudentForm").reset();
        expiryDateInput.value = "";
        return;
      }

      // ⚠️ DUPLICATE STUDENT (PHONE EXISTS)
      if (response.status === 409) {
        showToast(
          "⚠️ Student already exists. Please update details instead of adding.",
          "warning"
        );

        // Optional redirect after 2 seconds
        setTimeout(() => {
          window.location.href =
            `../HTML/manage-students.html?admin_id=${admin_id}`;
        }, 2000);

        return;
      }

      // ❌ OTHER ERRORS
      showToast(result.message || "Failed to add student.", "danger");

    } catch (error) {
      console.error("Error:", error);
      showToast("Failed to connect to server.", "danger");
    }
  });
});


// document.addEventListener("DOMContentLoaded", () => {
//   const token = localStorage.getItem("token");
//   const toastEl = document.getElementById("toast");
//   const toastBody = document.getElementById("toast-message");
//   const toast = new bootstrap.Toast(toastEl);

//   function showToast(message, type = "primary") {
//     toastBody.textContent = message;
//     toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
//     toast.show();
//   }

//   // 🔐 Token check
//   if (!token) {
//     showToast("Unauthorized access. Please login first.", "danger");
//     setTimeout(() => (window.location.href = "../HTML/admin-login.html"), 1500);
//     return;
//   }

//   // 🌐 Get admin_id from URL
//   const urlParams = new URLSearchParams(window.location.search);
//   const admin_id = urlParams.get("admin_id");

//   if (!admin_id) {
//     showToast("Admin ID not found!", "danger");
//     setTimeout(() => (window.location.href = "../HTML/admin-dashboard.html"), 1500);
//     return;
//   }

//   // 🔗 Update navbar links dynamically
//   document.getElementById("addStudentLink").href = `../HTML/add-student.html?admin_id=${admin_id}`;
//   document.getElementById("viewStudentsLink").href = `../HTML/manage-students.html?admin_id=${admin_id}`;
//   document.getElementById("dashboardLink").href = `../HTML/admin-dashboard.html?admin_id=${admin_id}`;

//   // ⬅ Back to Dashboard button
//   document.getElementById("backToDashboard").addEventListener("click", () => {
//     window.location.href = `../HTML/admin-dashboard.html?admin_id=${admin_id}`;
//   });

//   // ❌ Cancel button redirects to dashboard
//   document.getElementById("cancelBtn").addEventListener("click", () => {
//     window.location.href = `../HTML/admin-dashboard.html?admin_id=${admin_id}`;
//   });

//   // ===========================
//   // 🧮 Auto Plan Logic Section
//   // ===========================

//   const joiningDateInput = document.getElementById("joining_date");
//   const planMonthsSelect = document.getElementById("plan_months");
//   const expiryDateInput = document.getElementById("plan_expiry");

//   function updateExpiryDate() {
//     const joiningDateValue = joiningDateInput.value;
//     const planMonthsValue = parseInt(planMonthsSelect.value);

//     if (!joiningDateValue || isNaN(planMonthsValue)) return;

//     const joinDate = new Date(joiningDateValue);
//     const expiryDate = new Date(joinDate);

//     // Add selected months
//     expiryDate.setMonth(expiryDate.getMonth() + planMonthsValue);

//     // Format date as yyyy-mm-dd
//     const year = expiryDate.getFullYear();
//     const month = String(expiryDate.getMonth() + 1).padStart(2, "0");
//     const day = String(expiryDate.getDate()).padStart(2, "0");

//     expiryDateInput.value = `${year}-${month}-${day}`;
//   }

//   // When joining date or plan changes
//   joiningDateInput.addEventListener("change", updateExpiryDate);
//   planMonthsSelect.addEventListener("change", updateExpiryDate);

//   // ===========================
//   // 💾 Add Student Logic
//   // ===========================

//   document.getElementById("addStudentForm").addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const student_name = document.getElementById("student_name").value.trim();
//     const joining_date = joiningDateInput.value;
//     const student_phone = document.getElementById("student_phone").value.trim();
//     const plan_months = planMonthsSelect.value;
//     const plan_expiry = expiryDateInput.value;

//     // 🧩 Validations
//     if (!student_name || !joining_date || !student_phone || !plan_months || !plan_expiry) {
//       showToast("Please fill out all fields.", "warning");
//       return;
//     }

//     if (!/^[0-9]{10}$/.test(student_phone)) {
//       showToast("Enter a valid 10-digit phone number.", "warning");
//       return;
//     }

//     if (new Date(plan_expiry) <= new Date(joining_date)) {
//       showToast("'Valid Till' date must be after 'Date of Joining'.", "warning");
//       return;
//     }

//     // Prepare student object
//     const studentData = {
//       student_name,
//       student_phone,
//       student_email: "", // optional if you don’t use email
//       added_by: parseInt(admin_id),
//       plan_months: parseInt(plan_months),
//       date_joining: new Date(joining_date).toISOString().split("T")[0],
//       plan_expiry: new Date(plan_expiry).toISOString().split("T")[0],
//     };

//     // 🧠 Debug (optional)
//     console.log("Sending student data:", studentData);

//     try {
//       const response = await fetch(`${BASE_URL}/register-student/${admin_id}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(studentData),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         showToast("✅ Student added successfully!", "success");
//         document.getElementById("addStudentForm").reset();
//       } else {
//         showToast(result.message || "Failed to add student.", "danger");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       showToast("Failed to connect to server.", "danger");
//     }
//   });
// });
