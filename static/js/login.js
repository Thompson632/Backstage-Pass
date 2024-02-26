document.addEventListener("DOMContentLoaded", function () {
  const BASE_HOME_REDIRECT = "/";
  const DEFAULT_ACTION = "POST";
  const DEFAULT_DATA_TYPE = "json";
  const DEFAULT_ERROR_LOG = "An error occurred. Please try again later.";
  const CREATE_ACCOUNT_HEADER = "Create Account";
  const LOGIN_HEADER = "Login";

  $(document).ready(function () {
    function clearErrorMessage() {
      $(".alert-danger").remove();
    }

    function updateModalTitle(title) {
      $("#modalTitle").text(title);
    }

    $("#registerForm, #loginForm").on("submit", function (event) {
      event.preventDefault();

      var form = $(this);
      var url = form.attr("action");
      
      clearErrorMessage();

      $.ajax({
        type: DEFAULT_ACTION,
        url: url,
        data: form.serialize(),
        dataType: DEFAULT_DATA_TYPE,
        success: function (response) {
          if (response.success) {
            alert(response.message);
            window.location.href = BASE_HOME_REDIRECT;
          } else {
            form.prepend(
              '<div class="alert alert-danger">' + response.error + "</div>"
            );
          }
        },
        error: function () {
          form.prepend(
            '<div class="alert alert-danger">' + DEFAULT_ERROR_LOG + "</div>"
          );
        },
      });
    });

    $("#showRegisterForm").click(function () {
      $("#loginForm").hide();
      $("#registerForm").show();
      updateModalTitle(CREATE_ACCOUNT_HEADER);
      clearErrorMessage();
    });

    $("#showLoginForm").click(function () {
      $("#registerForm").hide();
      $("#loginForm").show();
      updateModalTitle(LOGIN_HEADER);
      clearErrorMessage();
    });

    $("#openModal").click(function () {
      $("#loginModal").show();
      clearErrorMessage();
    });

    $(".close-button").click(function () {
      $("#loginModal").hide();
      clearErrorMessage();
    });
  });
});
