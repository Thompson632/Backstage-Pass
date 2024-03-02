function TicketsView() {
  const NO_TICKETS_PURCHASED = "No Tickets Purchased";
  const MY_TICKETS = "My Tickets";
  this.currentPage = 1;
  this.itemsPerPage = 5;

  this.load = () => {
    $.get("/api/account/tickets", (data) => {
      userTicketData = data["user_ticket_data"];
      this.update(data);
    });
  };

  this.update = (data) => {
    console.log(data["user_ticket_data"]);
    if (!data["user_ticket_data"] || data["user_ticket_data"].length === 0) {
      $("#ticketHeader").text(NO_TICKETS_PURCHASED);
      return;
    } else {
      $("#ticketHeader").text(MY_TICKETS);
      this.updateTable(data["user_ticket_data"]);
      this.updatePagination(data["user_ticket_data"]);
      this.initializeVenueModal();
      this.initializeToggleDetails();
    }
  };

  this.updateTable = (userTicketData) => {
    $("#ticketsTable").empty();

    const paginatedTickets = this.paginateTickets(userTicketData);
    const tableBody = $('<tbody id="ticketsTableBody"></tbody>');

    for (const group of paginatedTickets) {
      tableBody.append(this.createEventRow(group));
      group.forEach((ticket) =>
        tableBody.append(this.createTicketDetailsRow(ticket))
      );
    }

    $("#ticketsTable").append(tableBody);
  };

  this.paginateTickets = (userTicketData) => {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedGroups = this.groupTicketsByEvent(userTicketData).slice(
      startIndex,
      endIndex
    );
    return paginatedGroups;
  };

  this.groupTicketsByEvent = (userTicketData) => {
    return Object.values(
      userTicketData.reduce((account, ticket) => {
        (account[ticket.event_id] = account[ticket.event_id] || []).push(
          ticket
        );
        return account;
      }, {})
    );
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

  this.createEventRow = (group) => {
    const firstTicket = group[0];
    const venueInfo = this.buildVenueInformation(firstTicket);

    return $(`
      <tr class="event-row" data-event-id="${firstTicket.event_id}">
        <td>
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
              <img src="/static/img/events/${firstTicket.event_image}" alt="Event Image" style="width: 100px; height: auto; margin-right: 20px;">
              <div>
                <h5>${firstTicket.event_name} - ${firstTicket.artist}</h5>
                <p>${venueInfo}<br>${this.formatDate(firstTicket.start_date)} at ${this.formatTime(firstTicket.start_time)}</p>
                <button type="button" class="btn btn-link toggle-details" data-event-name="${
                  firstTicket.event_name
                }">
                  <i class="fas fa-caret-down"></i> View Details
                </button>
              </div>
            </div>
            <div class="total-price"><strong>Total Price: $${this.calculateTotalPrice(group)}</strong></div>
          </div>
        </td>
      </tr>
    `);
  };

  this.buildVenueInformation = (firstTicket) => {
    return `<a href="#" class="venue-link" data-toggle="modal" data-target="#venueModal" 
            data-venue-name="${firstTicket.venue_name}" 
            data-venue-image="/static/img/venues/${firstTicket.venue_image}">${firstTicket.venue_name} - 
            ${firstTicket.venue_street}, ${firstTicket.venue_city}, ${firstTicket.venue_state}, ${firstTicket.venue_zip_code}</a>`;
  };

  this.createTicketDetailsRow = (ticket) => {
    return $(`
      <tr class="details-row" data-event-name="${ticket.event_name}" style="display: none;">
        <td>${this.buildTicketDetails(ticket)}</td>
      </tr>
    `);
  };

  this.buildTicketDetails = (ticket) => {
    return `
      <div class="details-content d-flex align-items-center">
      <div class="ticket-image-container mr-3">
        <img src="/static/img/seats/${ticket.section_image}" alt="Section Image" style="width: 100px; height: auto;">
      </div>
      <div class="ticket-details">
        <p><strong>Ticket ID:</strong> ${ticket.ticket_id}</p>
        <p><strong>Order Date:</strong> ${ticket.ticket_order_date}</p>
        <p><strong>Seat Number:</strong> ${ticket.seat_number}</p>
        <p><strong>Section:</strong> ${ticket.section_name}</p>
        <p><strong>Seat Price:</strong> $${ticket.seat_price.toFixed(2)}</p>
        <p><strong>Quantity:</strong> ${ticket.quantity}</p>
      </div>
    </div>
    `;
  };

  this.initializeToggleDetails = () => {
    $(document).on("click", ".toggle-details", function () {
      const eventName = $(this).data("event-name");
      $(`.details-row[data-event-name="${eventName}"]`).toggle();
      $(this).find("i").toggleClass("fa-caret-down fa-caret-up");
    });
  };

  this.initializeVenueModal = () => {
    $("#venueModal").on("show.bs.modal", function (event) {
      const button = $(event.relatedTarget);
      const modal = $(this);
      modal.find(".modal-title").text(button.data("venue-name"));
      modal.find("#venueImage").attr("src", button.data("venue-image"));
    });
  };

  this.calculateTotalPrice = (group) => {
    return group
      .reduce((acc, ticket) => acc + ticket.seat_price * ticket.quantity, 0)
      .toFixed(2);
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
