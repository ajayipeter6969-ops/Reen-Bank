const PROFILE_USER_KEY = "reenUser";
const profileUser = JSON.parse(localStorage.getItem(PROFILE_USER_KEY) || "null");

if (!profileUser) {
  window.location.replace("login.html");
} else {
  const profileForm = document.getElementById("profile-form");
  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");
  const accountNumberInput = document.getElementById("profile-account-number");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const profileStatus = document.getElementById("profile-status");
  const profilePhotoInput = document.getElementById("profile-photo-input");
  const sidebar = document.getElementById("sidebar");
  const sidebarBackdrop = document.getElementById("sidebar-backdrop");

  function renderProfile() {
    nameInput.value = profileUser.name || "";
    emailInput.value = profileUser.email || "";
    accountNumberInput.value = profileUser.accountNumber || "";
    document.getElementById("profile-header-name").textContent = profileUser.name || "";
    document.getElementById("profile-header-account").textContent = profileUser.accountNumber || "";
    document.getElementById("profile-display-name").textContent = profileUser.name || "Your profile";
    document.getElementById("profile-display-email").textContent = profileUser.email || "";
    document.querySelectorAll("[data-profile-avatar]").forEach(function (avatar) {
      avatar.src = profileUser.profileImage || "https://i.pravatar.cc/150?u=maureen";
    });

    const isVerified = profileUser.verified === true;
    const verificationBadge = document.getElementById("profile-verification");
    document.getElementById("profile-verification-text").textContent =
      isVerified ? "Email verified" : "Email not verified";
    verificationBadge.classList.toggle("text-reen-green", isVerified);
    verificationBadge.classList.toggle("text-red-600", !isVerified);
    document.getElementById("profile-header-verification").classList.toggle("hidden", !isVerified);
  }

  renderProfile();

  document.getElementById("change-profile-photo").addEventListener("click", function () {
    profilePhotoInput.click();
  });

  profilePhotoInput.addEventListener("change", async function () {
    const file = profilePhotoInput.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      profileStatus.textContent = "Choose an image smaller than 10 MB.";
      profileStatus.classList.replace("text-reen-green", "text-red-600");
      profilePhotoInput.value = "";
      return;
    }

    try {
      const image = await createImageBitmap(file);
      const scale = Math.min(1, 512 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.close();

      const updatedUser = {
        ...profileUser,
        profileImage: canvas.toDataURL("image/jpeg", 0.82)
      };
      localStorage.setItem(PROFILE_USER_KEY, JSON.stringify(updatedUser));
      Object.assign(profileUser, updatedUser);
      profileStatus.classList.remove("text-red-600");
      profileStatus.classList.add("text-reen-green");
      profileStatus.textContent = "Profile photo updated.";
      renderProfile();
    } catch {
      profileStatus.classList.replace("text-reen-green", "text-red-600");
      profileStatus.textContent = "This image could not be saved. Try a smaller image.";
    }

    profilePhotoInput.value = "";
  });

  profileForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    profileStatus.classList.remove("text-red-600");
    profileStatus.classList.add("text-reen-green");

    if (newPassword || confirmPassword) {
      if (newPassword.length < 8) {
        profileStatus.textContent = "Use at least 8 characters for the new password.";
        profileStatus.classList.replace("text-reen-green", "text-red-600");
        return;
      }
      if (newPassword !== confirmPassword) {
        profileStatus.textContent = "The passwords do not match.";
        profileStatus.classList.replace("text-reen-green", "text-red-600");
        return;
      }
    }

    profileUser.name = nameInput.value.trim();
    profileUser.email = emailInput.value.trim();
    if (newPassword) profileUser.password = newPassword;

    localStorage.setItem(PROFILE_USER_KEY, JSON.stringify(profileUser));
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
    profileStatus.textContent = "Profile updated.";
    renderProfile();
  });

  function closeMobileMenu() {
    sidebar.classList.add("-translate-x-full");
    sidebarBackdrop.classList.add("hidden");
  }

  document.getElementById("mobile-menu-btn").addEventListener("click", function () {
    sidebar.classList.remove("-translate-x-full");
    sidebarBackdrop.classList.remove("hidden");
  });
  sidebarBackdrop.addEventListener("click", closeMobileMenu);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMobileMenu();
  });
}