document.addEventListener("DOMContentLoaded", function () {
  function formHasChanges(form) {
    let hasChanges = false;
    form.find("input").each(function () {
      if ($(this).attr("type") === "submit" || $(this).is(":disabled")) return;

      let initialValue = $(this).data("initial-value");
      let currentUserInput = $(this).val();

      if (isNumber(initialValue)) {
        initialValue = initialValue.toString();
      }

      if (currentUserInput !== initialValue) {
        hasChanges = true;
      }
    });

    return hasChanges;
  }

  function isNumber(value) {
    return typeof value === "number";
  }

  $(
    "#updateMyInfoForm, #updateEmailAddressForm, #updatePasswordForm, #updatePhoneNumberForm, #updateAddressForm"
  ).submit(function (event) {
    event.preventDefault();

    var form = $(this);
    const userId = form.data("user-id");
    const actionUrl = form.attr("action");

    if (!formHasChanges(form)) {
      alert("There is nothing to update.");
      return;
    }

    console.log("Update UserId:", userId);
    console.log("Posting to URL:", actionUrl);
    console.log("Form:", form);

    $.ajax({
      url: actionUrl + `?user_id=${userId}`,
      type: "POST",
      data: form.serialize(),
      success: function (response) {
        alert("Updated successfully!", response);
      },
      error: function (error) {
        alert("Error occurred!", error);
        console.error(error);
      },
    }).done(() => {
      location.reload();
    });
  });
});
