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

  $("#signUpForm, #signInForm").on("submit", function (event) {
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

  $("#showSignInModalContentBtn, #signInSwitch").click(function() {
    $("#signUpModalContent").hide();
    $('#signUpForm')[0].reset();
    $("#signInModalContent").show();
    $("#authModal").modal('show');
  });

  $("#showSignUpModalContentBtn, #signUpSwitch").click(function() {
    $("#signInModalContent").hide();
    $("#signInForm")[0].reset();
    $("#signUpModalContent").show();
    $("#authModal").modal('show');
  });
});
