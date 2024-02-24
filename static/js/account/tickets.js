var user_ticket_data = {
    tickets: [
      {
        eventName: "The Beauty Is Everywhere Tour",
        venueName: "The Met Presented by Highmark",
        artist: "Chelsea Cutler",
        date: "2024-02-22",
        seatNumber: "1",
        orderId: "1",
      }
    ],
    total: 1,
  };
  
  function TicketsView() {
    this.load = () => {
      $.get("", (data) => {
        this.update(user_ticket_data);
      });
    };
  
    this.update = (data) => {
      this.updateTable(data.tickets, data.total);
    };
  
    this.updateTable = (tickets) => {
      var $ticketsTable = $("#ticketsTable");
      $ticketsTable.empty();
  
      const tableHead = $(`
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Artist</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
      `);
      $ticketsTable.append(tableHead);
  
      const tableBody = $('<tbody id="ticketsTableBody"></tbody>');
  
      tickets.forEach((ticket) => {
        const row = $(`
          <tr>
            <td>${ticket.eventName}</td>
            <td>${ticket.artist}</td>
            <td>${ticket.date}</td>
            <td><button type="button" class="btn btn-primary view-details" data-ticket-id="${ticket.ticketId}">View ticket details</button></td>
          </tr>
        `);
        tableBody.append(row);
      });
  
      $ticketsTable.append(tableBody);
  
      $(".view-details").on("click", function() {
        // window.location.href = '/account/tickets/ticket_details?ticketId=' + $(this).data('ticket-id');
        window.location.href = '/account/tickets/ticket_details';
      });
    };
  }