// Ensure our script gets loaded after the DOM is fully up
document.addEventListener("DOMContentLoaded", function () {
  var loginModal = document.getElementById("loginModal");
  var openModalButton = document.getElementById("openModal");
  var closeButton = document.getElementsByClassName("close-button")[0];
  var showRegisterFormButton = document.getElementById("showRegisterForm");
  var showLoginFormButton = document.getElementById("showLoginForm");
  var loginFormDiv = document.getElementById("loginForm");
  var registerFormDiv = document.getElementById("registerForm");

  openModalButton.onclick = function () {
    loginModal.style.display = "block";
    loginFormDiv.style.display = "block";
    registerFormDiv.style.display = "none";
  };

  closeButton.onclick = function () {
    loginModal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == loginModal) {
      loginModal.style.display = "none";
    }
  };

  showRegisterFormButton.onclick = function () {
    loginFormDiv.style.display = "none";
    registerFormDiv.style.display = "block";
  };

  showLoginFormButton.onclick = function () {
    registerFormDiv.style.display = "none";
    loginFormDiv.style.display = "block";
  };
});
