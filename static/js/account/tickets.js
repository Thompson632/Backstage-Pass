function TicketsView() {
  const NO_TICKETS_PURCHASED = "No Tickets Purchased";
  const MY_TICKETS = "My Tickets";
  this.currentPage = 1;
  this.itemsPerPage = 5;

  this.load = (firstName, lastName) => {
    $.get("/api/account/tickets", (data) => {
      userTicketData = data["user_ticket_data"];
      console.log(JSON.stringify(data, null, 2));
      userFullName = firstName + " " + lastName;
      this.update(data, userFullName);
    });
  };

  this.update = (data, userFullName) => {
    if (!data["user_ticket_data"] || data["user_ticket_data"].length === 0) {
      $("#ticketHeader").text(NO_TICKETS_PURCHASED);
      return;
    } else {
      $("#ticketHeader").text(MY_TICKETS);
      this.displayTickets(data["user_ticket_data"], userFullName);
      this.updatePagination(data["user_ticket_data"]);
      this.initializeVenueModal();
    }
  };

  this.createTicketElement = (ticket, userFullName) => {
    const ticketEl = $(`
      <div class="ticket mb-4" data-toggle="modal" data-target="#ticket${
        ticket["ticket_id"]
      }Modal">
          <div class="ticket-inner">
            <div class="ticket-event-section">
              <small class="text-muted">Event Name:</small>
              <span>${ticket["event_name"]} - ${ticket["artist"]}</span>
            </div>
            <div class="ticket-event-section">
              <small class="text-muted">Venue:</small>
              <span>${ticket["venue_name"]} - ${ticket["venue_street"]}, ${
      ticket["venue_city"]
    }, ${ticket["venue_state"]}, ${ticket["venue_zip_code"]}</span>
            </div>
            <div class="ticket-event-section">
              <small class="text-muted">Date:</small>
              <span>${this.formatDate(
                ticket["start_date"]
              )} at ${this.formatTime(ticket["start_time"])}</span>
            </div>
            <div class="ticket-divider"></div>
            <div id="ticketAttendee" class="ticket-event-section">
              <small class="text-muted">Attendee:</small>
              <span>${userFullName}</span>
            </div>
            <div class="ticket-attendee-section">
              <div class="ticket-attendee-col">
                <small class="text-muted">Section</small>
                <span class="ticket-section">${ticket["section_id"]}</span>
              </div>
              <div class="ticket-attendee-col"">
                <small class="text-muted">Row</small>
                <span class="ticket-section">2</span>
              </div>
              <div class="ticket-attendee-col">
                <small class="text-muted">Seat</small>
                <span class="ticket-seat-number">${ticket["seat_number"]}</span>
              </div>
            </div>
          </div>
          <div class="ticket-qr-code-container">
            <img src="/static/img/qr-code.png" class="ticket-qr-code"></div>
        </div>
    `);

    return ticketEl;
  };

  this.createTicketModal = (ticket) => {
    const modalEl = $(`
    <div class="modal fade" id="ticket${
      ticket["ticket_id"]
    }Modal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">${
              ticket["event_name"]
            } Ticket</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body d-flex align-items-center justify-content-center">
            <div class="ticket mb-4" data-toggle="modal" data-target="ticket${
              ticket["ticket_id"]
            }Modal">
            <div class="ticket-inner">
              <div class="ticket-event-section">
                <small class="text-muted">Event Name:</small>
                <span>${ticket["event_name"]} - ${ticket["artist"]}</span>
              </div>
              <div class="ticket-event-section">
                <small class="text-muted">Venue:</small>
                <span>${ticket["venue_name"]} - ${ticket["venue_street"]}, ${
      ticket["venue_city"]
    }, ${ticket["venue_state"]}, ${ticket["venue_zip_code"]}</span>
              </div>
              <div class="ticket-event-section">
                <small class="text-muted">Date:</small>
                <span>${this.formatDate(
                  ticket["start_date"]
                )} at ${this.formatTime(ticket["start_time"])}</span>
              </div>
              <div class="ticket-divider"></div>
              <div id="ticketAttendee" class="ticket-event-section">
                <small class="text-muted">Attendee:</small>
                <span>${userFullName}</span>
              </div>
              <div class="ticket-attendee-section">
                <div class="ticket-attendee-col">
                  <small class="text-muted">Section</small>
                  <span class="ticket-section">${ticket["section_id"]}</span>
                </div>
                <div class="ticket-attendee-col"">
                  <small class="text-muted">Row</small>
                  <span class="ticket-section">2</span>
                </div>
                <div class="ticket-attendee-col">
                  <small class="text-muted">Seat</small>
                  <span class="ticket-seat-number">${
                    ticket["seat_number"]
                  }</span>
                </div>
              </div>
            </div>
            <div class="ticket-qr-code-container">
              <img src="/static/img/qr-code.png" class="ticket-qr-code"></div>
          </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    `);

    return modalEl;
  };

  this.displayTickets = (userTickets, userFullName) => {
    const ticketContainer = $("#ticketList");
    userTickets.forEach((ticket) => {
      const ticketEl = this.createTicketElement(ticket, userFullName);
      const modalEl = this.createTicketModal(ticket, userFullName);
      ticketContainer.append(ticketEl);
      ticketContainer.append(modalEl);
    });
  };

  this.createTicketVenueModal = (ticket) => {};

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

  this.updatePagination = (userTicketData) => {
    const eventGroups = this.groupTicketsByEvent(userTicketData);
    const totalPages = Math.ceil(eventGroups.length / this.itemsPerPage);
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
        this.updateTable(userTicketData);
        this.updatePagination(userTicketData);
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
              <img src="/static/img/events/${
                firstTicket.event_image
              }" alt="Event Image" style="width: 100px; height: auto; margin-right: 20px;">
              <div>
                <h5>${firstTicket.event_name} - ${firstTicket.artist}</h5>
                <p>${venueInfo}<br>${this.formatDate(
      firstTicket.start_date
    )} at ${this.formatTime(firstTicket.start_time)}</p>
                <button type="button" class="btn btn-link toggle-details" data-event-name="${
                  firstTicket.event_name
                }">
                  <i class="fas fa-caret-down"></i> View Details
                </button>
              </div>
            </div>
            <div class="total-price"><strong>Total Price: $${this.calculateTotalPrice(
              group
            )}</strong></div>
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
      <tr class="details-row" data-event-name="${
        ticket.event_name
      }" style="display: none;">
        <td>${this.buildTicketDetails(ticket)}</td>
      </tr>
    `);
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
