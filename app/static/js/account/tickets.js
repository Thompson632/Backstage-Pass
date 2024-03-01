class TicketsView {
  constructor(user_ticket_data, itemsPerPage = 5) {
    this.user_ticket_data = user_ticket_data;
    this.currentPage = 1;
    this.itemsPerPage = itemsPerPage;
    this.totalPages = Math.ceil(this.groupTicketsByEvent().length / this.itemsPerPage);
    this.initialize();
  }

  initialize() {
    this.updateHeader();
    this.renderTable();
    this.initializeVenueModal();
    this.initializeToggleDetails();
    this.updatePagination();
  }

  updateHeader() {
    if (this.user_ticket_data.length === 0) {
      $("#ticketHeader").text("No Tickets Purchased");
    } else {
      $("#ticketHeader").text("My Tickets");
    }
  }

  renderTable() {
    const paginatedTickets = this.paginateTickets();
    const $ticketsTable = $("#ticketsTable").empty();

    // Only build the table if we have data
    if (this.shouldRenderTable(paginatedTickets)) {
      return;
    }
  
    const tableBody = $('<tbody id="ticketsTableBody"></tbody>').appendTo($ticketsTable);
  
    for (const group of paginatedTickets) {
      tableBody.append(this.createEventRow(group));
      group.forEach((ticket) => tableBody.append(this.createTicketDetailsRow(ticket)));
    };
  }

  shouldRenderTable(paginatedTickets) {
    return paginatedTickets.length === 0;
  }

  paginateTickets() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedGroups = this.groupTicketsByEvent().slice(startIndex, endIndex);
    return paginatedGroups;
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
    $(document).on("click", ".toggle-details", function () {
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

  createPageLink(text, toPage, active, disabled) {
    const link = $(`<li class="page-item"><a class="page-link">${text}</a></li>`);

    if (active) {
      link.addClass('active');
    }
    
    if (disabled) {
      link.addClass('disabled');
    }

    link.find('.page-link').on('click', () => {
      if (!disabled) {
        this.currentPage = toPage;
        this.renderTable();
        this.updatePagination();
      }
    });

    return link;
  }

  updatePagination() {
    if (this.totalPages > 1) {
      const pagination = $('#paginationList').empty();
      pagination.append(this.createPageLink('Previous', this.currentPage - 1, false, this.currentPage === 1));
  
      for (let page = 1; page <= this.totalPages; page++) {
        pagination.append(this.createPageLink(page, page, page === this.currentPage, false));
      }
  
      pagination.append(this.createPageLink('Next', this.currentPage + 1, false, this.currentPage === this.totalPages));
    } else {
      $('#paginationList').hide();
    }
  }

  calculateTotalPrice(group) {
    return group
      .reduce((acc, ticket) => acc + ticket.seat_price * ticket.quantity, 0)
      .toFixed(2);
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