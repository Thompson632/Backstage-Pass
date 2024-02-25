class TicketsView {
  constructor(user_ticket_data) {
    this.update(user_ticket_data);
  }

  update(tickets) {
    this.updateTable(tickets);
  }

  updateTable(tickets) {
    console.log("Tickets:", JSON.stringify(tickets, null, 2));

    const $ticketsTable = $("#ticketsTable").empty();
    const tableBody = $('<tbody id="ticketsTableBody"></tbody>').appendTo($ticketsTable);

    const eventsGroup = this.groupTicketsByEvent(tickets);

    Object.values(eventsGroup).forEach((group) => {
      tableBody.append(this.createEventRow(group));
      group.forEach((ticket) => tableBody.append(this.createDetailsRow(ticket)));
    });

    this.initializeToggleDetails();
  }

  groupTicketsByEvent(tickets) {
    return tickets.reduce((acc, ticket) => {
      (acc[ticket.event_id] = acc[ticket.event_id] || []).push(ticket);
      return acc;
    }, {});
  }

  createEventRow(group) {
    const firstTicket = group[0];
    const totalPrice = group.reduce((acc, ticket) => acc + ticket.seat_price * ticket.quantity, 0).toFixed(2);
    const venueAddress = `${firstTicket.venue_street}, ${firstTicket.venue_city}, ${firstTicket.venue_state}, ${firstTicket.venue_zip_code}`;
    const startDate = convertDateToHumanReadable(firstTicket.start_date);
    const startTime = convertTo12HourFormat(firstTicket.start_time);

    return $(`
      <tr class="event-row" data-event-id="${firstTicket.event_id}">
        <td>
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
              <img src="/static/img/events/${firstTicket.event_image}" alt="Event Image" style="width: 100px; height: auto; margin-right: 20px;">
              <div>
                <h5>${firstTicket.event_name} - ${firstTicket.artist}</h5>
                <p>${firstTicket.venue_name} - ${venueAddress}<br>${startDate} at ${startTime}</p>
                <button type="button" class="btn btn-link toggle-details" data-event-name="${firstTicket.event_name}">
                  <i class="fas fa-caret-down"></i> View Details
                </button>
              </div>
            </div>
            <div class="total-price">
              <strong>Total Price: $${totalPrice}</strong>
            </div>
          </div>
        </td>
      </tr>
    `);
  }

  createDetailsRow(ticket) {
    return $(`
      <tr class="details-row" data-event-name="${ticket.event_name}" style="display: none;">
        <td>
          <div class="details-content">
            <p><strong>Ticket ID:</strong> ${ticket.ticket_id}</p>
            <p><strong>Order Date:</strong> ${ticket.ticket_order_date}</p>
            <p><strong>Seat Number:</strong> ${ticket.seat_number}</p>
            <p><strong>Seat Price:</strong> $${ticket.seat_price.toFixed(2)}</p>
            <p><strong>Quantity:</strong> ${ticket.quantity}</p>
          </div>
        </td>
      </tr>
    `);
  }

  initializeToggleDetails() {
    $(".toggle-details").on("click", function () {
      const eventName = $(this).data("event-name");
      const detailsRows = $(`.details-row[data-event-name="${eventName}"]`);
      detailsRows.toggle();
      $(this).find("i").toggleClass("fa-caret-down", detailsRows.is(":visible")).toggleClass("fa-caret-up", !detailsRows.is(":visible"));
    });
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