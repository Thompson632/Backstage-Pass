document.addEventListener("DOMContentLoaded", function () {
  const POST_ACTION = "POST";

  $(document).ready(function () {
    $("#updateMyInfoForm").submit(function (event) {
      event.preventDefault();

      var form = $(this);
      const userId = form.data("user-id");

      $.ajax({
        url: `/api/profile/edit/info?user_id=${userId}`,
        type: POST_ACTION,
        data: $(this).serialize(),
        success: function (response) {
          alert("Information updated successfully.");
        },
        error: function () {
          alert("An error occurred updating information.");
          console.error(error);
        },
      }).done(() => {
        location.reload();
      });
    });

    $("#updateEmailAddressForm").submit(function (event) {
      event.preventDefault();

      var form = $(this);
      const userId = form.data("user-id");

      $.ajax({
        url: `/api/profile/edit/email_address?user_id=${userId}`,
        type: POST_ACTION,
        data: form.serialize(),
        success: function (response) {
          alert("Email updated successfully.");
        },
        error: function (error) {
          alert("An error occurred updating email.");
          console.error(error);
        },
      }).done(() => {
        location.reload();
      });
    });

    $("#updatePasswordForm").submit(function (event) {
      event.preventDefault();

      var form = $(this);
      const userId = form.data("user-id");

      $.ajax({
        url: `/api/profile/edit/password?user_id=${userId}`,
        type: POST_ACTION,
        data: $(this).serialize(),
        success: function (response) {
          alert("Password updated successfully.");
        },
        error: function () {
          alert("An error occurred updating password.");
          console.error(error);
        },
      }).done(() => {
        location.reload();
      });
    });

    $("#updatePhoneNumberForm").submit(function (event) {
      event.preventDefault();

      var form = $(this);
      const userId = form.data("user-id");

      $.ajax({
        url: `/api/profile/edit/phone_number?user_id=${userId}`,
        type: POST_ACTION,
        data: $(this).serialize(),
        success: function (response) {
          alert("Phone number updated successfully.");
        },
        error: function () {
          alert("An error occurred updating phone number.");
          console.error(error);
        },
      });
    });

    $("#updateAddressForm").submit(function (event) {
      event.preventDefault();

      var form = $(this);
      const userId = form.data("user-id");

      $.ajax({
        url: `/api/profile/edit/address?user_id=${userId}`,
        type: POST_ACTION,
        data: form.serialize(),
        success: function (response) {
          alert("Address updated successfully.");
        },
        error: function () {
          alert("An error occurred updating address.");
          console.error(error);
        },
      }).done(() => {
        location.reload();
      });
    });
  });
});
