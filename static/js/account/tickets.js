class TicketsView {
  constructor(user_ticket_data) {
    this.user_ticket_data = user_ticket_data;
    this.initialize();
  }

  initialize() {
    this.renderTable();
    this.initializeVenueModal();
    this.initializeToggleDetails();
  }

  renderTable() {
    console.log("Tickets:", JSON.stringify(this.user_ticket_data, null, 2));
    
    const $ticketsTable = $("#ticketsTable").empty();
    const tableBody = $('<tbody id="ticketsTableBody"></tbody>').appendTo(
      $ticketsTable
    );

    const eventsGroup = this.groupTicketsByEvent();

    eventsGroup.forEach((group) => {
      tableBody.append(this.createEventRow(group));
      group.forEach((ticket) =>
        tableBody.append(this.createTicketDetailsRow(ticket))
      );
    });
  }

  groupTicketsByEvent() {
    return Object.values(
      this.user_ticket_data.reduce((account, ticket) => {
        (account[ticket.event_id] = account[ticket.event_id] || []).push(ticket);
        return account;
      }, {})
    );
  }

  createEventRow(group) {
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
                <button type="button" class="btn btn-link toggle-details" data-event-name="${firstTicket.event_name}">
                  <i class="fas fa-caret-down"></i> View Details
                </button>
              </div>
            </div>
            <div class="total-price"><strong>Total Price: $${this.calculateTotalPrice(group)}</strong></div>
          </div>
        </td>
      </tr>
    `);
  }

  buildVenueInformation(firstTicket) {
    return `<a href="#" class="venue-link" data-toggle="modal" data-target="#venueModal" 
            data-venue-name="${firstTicket.venue_name}" 
            data-venue-image="/static/img/venues/${firstTicket.venue_image}">${firstTicket.venue_name} - 
            ${firstTicket.venue_street}, ${firstTicket.venue_city}, ${firstTicket.venue_state}, ${firstTicket.venue_zip_code}</a>`;
  }

  calculateTotalPrice(group) {
    return group
      .reduce((acc, ticket) => acc + ticket.seat_price * ticket.quantity, 0)
      .toFixed(2);
  }

  createTicketDetailsRow(ticket) {
    return $(`
      <tr class="details-row" data-event-name="${ticket.event_name}" style="display: none;">
        <td>${this.buildTicketDetails(ticket)}</td>
      </tr>
    `);
  }

  buildTicketDetails(ticket) {
    return `
      <div class="details-content">
        <p><strong>Ticket ID:</strong> ${ticket.ticket_id}</p>
        <p><strong>Order Date:</strong> ${ticket.ticket_order_date}</p>
        <p><strong>Seat Number:</strong> ${ticket.seat_number}</p>
        <p><strong>Seat Price:</strong> $${ticket.seat_price.toFixed(2)}</p>
        <p><strong>Quantity:</strong> ${ticket.quantity}</p>
      </div>
    `;
  }

  initializeToggleDetails() {
    $(".toggle-details").on("click", function () {
      const eventName = $(this).data("event-name");
      $(`.details-row[data-event-name="${eventName}"]`).toggle();
      $(this).find("i").toggleClass("fa-caret-down fa-caret-up");
    });
  }

  initializeVenueModal() {
    $("#venueModal").on("show.bs.modal", function (event) {
      const button = $(event.relatedTarget);
      const modal = $(this);
      modal.find(".modal-title").text(button.data("venue-name"));
      modal.find("#venueImage").attr("src", button.data("venue-image"));
    });
  }

  formatTime(time) {
    return convertTo12HourFormat(time);
  }

  formatDate(dateString) {
    return convertDateToHumanReadable(dateString);
  }
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
