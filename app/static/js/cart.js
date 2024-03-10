function CartView() {
  const MINUS_TEXT = "-";
  const PLUS_TEXT = "+";
  const CART_EMPTY = "Cart is Empty!";
  const MY_CART = "My Cart";
  const CHECKOUT_QUESTION = "Are you sure you want to proceed to checkout?";
  this.currentPage = 1;
  this.itemsPerPage = 5;

  this.load = () => {
    $.get("/api/cart", (data) => {
      eventTicketDetails = data["cart"];
      console.log(JSON.stringify(eventTicketDetails, null, 2))
      this.update(data);
    });
  };

  this.update = (data) => {
    if (!data["cart"] || data["cart"].length === 0) {
      $("#cartHeader").text(CART_EMPTY);
      $("#paginationList").empty();
    } else {
      $("#cartHeader").text(MY_CART);
      this.updateTable(data["cart"]);
      this.updatePagination(data["cart"]);
      $("#checkoutButton").click(this.handleCheckout);
    }
  };

  this.updateCart = (numberOfTickets) => {
    $.post(
      "/api/update_cart",
      {
        cart: eventTicketDetails,
        num_tickets: numberOfTickets,
      },
      (data) => {
        eventTicketDetails = data["cart"];
        this.update(data);
      }
    );
  };

  this.plusAction = (eventId, seatId) => {
    for (let index = 0; index < eventTicketDetails.length; index++) {
      let event_ticket = eventTicketDetails[index];

      if (this.equalIds(eventId, event_ticket["event_id"]) &&
          this.equalIds(seatId, event_ticket["seat_id"])) {
        event_ticket["quantity"] = parseInt(event_ticket["quantity"]) + 1;
        event_ticket["total_price"] =
        event_ticket["seat_price"] * event_ticket["quantity"];
        break;
      }
    }

    this.updateCart(eventTicketDetails.length);
  };

  this.minusAction = (eventId, seatId) => {
    for (let index = 0; index < eventTicketDetails.length; index++) {
      let event_ticket = eventTicketDetails[index];

      if (this.equalIds(eventId, event_ticket["event_id"]) &&
          this.equalIds(seatId, event_ticket["seat_id"])) {
        event_ticket["quantity"] = Math.max(0, parseInt(event_ticket["quantity"]) - 1);
        event_ticket["total_price"] =
        event_ticket["seat_price"] * event_ticket["quantity"];
        break;
      }
    }

    this.updateCart(eventTicketDetails.length);
  };

  this.equalIds = (idOne, idTwo) => {
    return idOne == idTwo;
  };

  this.updateTable = (cartData) => {
    $("#cartTable").empty();
    let cartTotal = 0;
    let totalTickets = 0;

    // Calculate total and quantity here so it persists between paginated pages
    cartData.forEach((ticket) => {
      const quantity = parseInt(ticket.quantity) || 0;
      totalTickets += quantity;
      const seatPrice = parseFloat(ticket.seat_price) || 0;
      cartTotal += seatPrice * quantity;
    });

    const paginatedData = this.paginateCartData(cartData);
    const tableBody = $('<tbody id="cartBody"></tbody>');

    paginatedData.forEach((ticket) => {
      if (
        !ticket.event_id ||
        !ticket.event_name ||
        !ticket.artist ||
        !ticket.event_image ||
        isNaN(parseFloat(ticket.seat_price)) ||
        isNaN(parseInt(ticket.quantity))
      ) {
        console.error("Invalid ticket details", ticket);
        return;
      }

      const seatPrice = parseFloat(ticket.seat_price) || 0;
      const quantity = parseInt(ticket.quantity) || 0;
      const totalPrice = seatPrice * quantity;

      const eventDate = this.formatDate(ticket.start_date) +" at " + this.formatTime(ticket.start_time);
      const venueInfo = `${ticket.venue_name} - ${ticket.venue_street}, ${ticket.venue_city}, ${ticket.venue_state}, ${ticket.venue_zip_code}`;

      const row = $(`
            <tr class="event-row" data-event-id="${ticket.event_id}">
                <td>
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                            <a href="/events/event_details?event_id=${ticket.event_id}" title="Go to event">
                                <img src="/static/img/events/${ticket.event_image}" alt="Event Image" style="width: 100px; height: auto; margin-right: 20px;">
                            </a>
                            <div>
                                <h5>${ticket.event_name} - ${ticket.artist}</h5>
                                <p>${venueInfo}<br>${eventDate}</p>
                                <p>Section: ${ticket.section_name}, Seat: ${ticket.seat_id}<br>Price: $${seatPrice.toFixed(2)}, Quantity: ${quantity}</p>
                            </div>
                        </div>
                        <div>
                            <p><strong>Price: $${totalPrice.toFixed(2)}</strong></p>
                            <div class="ticket-actions">
                                <button class="minus btn btn-secondary" ${quantity <= 0 ? "disabled" : ""} data-event-id="${ticket.event_id}" data-seat-id="${ticket.seat_id}">${MINUS_TEXT}</button>
                                <button class="plus btn btn-secondary" data-event-id="${ticket.event_id}" data-seat-id="${ticket.seat_id}">${PLUS_TEXT}</button>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        `);

      $(row)
        .find(".minus")
        .on("click", (event) => {
          this.minusAction(
            $(event.currentTarget).data("event-id"),
            $(event.currentTarget).data("seat-id")
          );
          const currentCount = $('#cartCount').text();
          $('#cartCount').text(parseInt(currentCount) - 1);
        });

      $(row)
        .find(".plus")
        .on("click", (event) => {
          this.plusAction(
            $(event.currentTarget).data("event-id"),
            $(event.currentTarget).data("seat-id")
          );
          const currentCount = $('#cartCount').text();
          $('#cartCount').text(parseInt(currentCount) + 1);
        });

      tableBody.append(row);
    });

    $("#cartTable").append(tableBody);

    // Update display with the total cart price and items
    $("#cartTotal").html(`Subtotal (${totalTickets} items): <strong>$${cartTotal.toFixed(2)}</strong>`);
    // Set the width of the button to match the subtotal
    $("#checkoutButton").css("width", $("#cartTotal").width());
  };

  this.paginateCartData = (cartData) => {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return cartData.slice(startIndex, startIndex + this.itemsPerPage);
  };

  this.updatePagination = (cartData) => {
    const totalPages = Math.ceil(cartData.length / this.itemsPerPage);
    const $pagination = $("#paginationList").empty();

    for (let page = 1; page <= totalPages; page++) {
      const $pageItem = $('<li class="page-item"></li>');
      const $pageLink = $(`<a class="page-link" href="#">${page}</a>`);

      if (page === this.currentPage) {
        $pageItem.addClass("active");
      }

      $pageLink.on("click", (e) => {
        e.preventDefault();
        this.currentPage = page;
        this.updateTable(cartData);
        this.updatePagination(cartData);
      });

      $pageItem.append($pageLink);
      $pagination.append($pageItem);
    }
  };

  this.handleCheckout = () => {
    if (confirm(CHECKOUT_QUESTION)) {
      $.post({
        url: "/checkout",
        // Make sure we pass the whole cart here
        data: JSON.stringify({ cart: eventTicketDetails }),
        contentType: "application/json",
        success: function (response) {
          if (response.success) {
            alert(response.success);
            window.location.href = "/account/tickets";
          }          
        },
        error: function (xhr) {
          console.error("Error Occurred:", xhr.responseText);
          const response = JSON.parse(xhr.responseText);
          alert(`${response.error}`);
        },
      });
    }
  };

  this.formatTime = (time) => {
    return convertTo12HourFormat(time);
  };

  this.formatDate = (dateString) => {
    return convertDateToHumanReadable(dateString);
  };
}

function convertTo12HourFormat(time) {
  const [hour, minute] = time.split(":");
  const suffix = +hour < 12 ? "AM" : "PM";
  const hours12 = +hour % 12 || 12;
  return `${hours12}:${minute} ${suffix}`;
}

function convertDateToHumanReadable(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
