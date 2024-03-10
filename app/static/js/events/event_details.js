const ERROR_LOG = "Error: No event details found - check the server logs";

class EventDetailsView {
  constructor(eventDetailsData) {
    this.eventDetailsData = eventDetailsData;
    this.initialize();
  }

  initialize() {
    if (!this.eventDetailsData) {
      alert(ERROR_LOG);
      console.error(ERROR_LOG);
    }

    console.log(JSON.stringify(this.eventDetailsData, null, 2));

    this.updatePageWithEventDetails(this.eventDetailsData);
    this.initializeCollapsibleSections();
    this.attachAddToCartButtonListener();
  }

  updatePageWithEventDetails(data) {
    this.setEventInfo(data);
    this.setVenueImage(data.venue_image, data.venue_name);
    this.setEventImage(data.event_image, data.event_name);
    this.populateSeatList(data.seats);

    // Calculate available seats
    const availableSeats = data.seats.filter(
      (seat) => seat.booking_status === 0
    ).length;
    this.setTextContent(
      "#seats-available",
      `Seats Available: ${availableSeats}`
    );
  }

  setEventInfo(data) {
    this.setTextContent("#event-name", data.event_name);
    this.setTextContent("#artist-name", data.artist);
    this.setTextContent(
      "#event-date",
      `Date: ${this.getHumanReadableDateRange(data.start_date, data.end_date)}`
    );
    this.setTextContent(
      "#event-time",
      `Time: ${this.getEventTimeRange(data.start_time, data.end_time)}`
    );
    this.setTextContent("#event-venue", `Venue: ${data.venue_name}`);
    this.setTextContent(
      "#event-address",
      `Address: ${this.formatAddress(data)}`
    );
  }

  setVenueImage(src, alt) {
    this.setImageAttributes(
      "#venue-img",
      `/static/img/venues/${src}`,
      `Image of venue: ${alt}`
    );
  }

  setEventImage(src, alt) {
    this.setImageAttributes(
      "#event-header img",
      `/static/img/events/${src}`,
      `Image of event: ${alt}`
    );
  }

  populateSeatList(seats) {
    var seatList = $("#seat-list").empty();
    seats.sort((a, b) => a.seat_id - b.seat_id);
    seats.forEach((seat) => seatList.append(this.createSeatListItem(seat)));
  }
  

  initializeCollapsibleSections() {
    this.initializeCollapsibleSection("#toggle-venue-image", "#venue-img");
    this.initializeCollapsibleSection("#toggle-seat-info", "#seat-list");
  }

  setTextContent(selector, text) {
    $(selector).text(text);
  }

  setImageAttributes(selector, src, alt) {
    $(selector).attr("src", src).attr("alt", alt);
  }

  getHumanReadableDateRange(startDate, endDate) {
    return `${this.formatDate(startDate)} to ${this.formatDate(endDate)}`;
  }

  getEventTimeRange(startTime, endTime) {
    return `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`;
  }

  formatAddress({
    venue_street,
    venue_city,
    venue_state,
    venue_zip_code,
    venue_country,
  }) {
    return `${venue_street}, ${venue_city}, ${venue_state}, ${venue_zip_code}, ${venue_country}`;
  }

  createSeatListItem(seat) {
    const item = $("<li>")
      .text(`Seat ${seat.seat_id}: $${seat.seat_price.toFixed(2)}`)
      .css({
        cursor: seat.booking_status === 0 ? "pointer" : "not-allowed",
        opacity: seat.booking_status === 0 ? 1 : 0.6,
      })
      .attr("data-event-seat-id", seat.event_seat_id)
      .attr("data-seat-id", seat.seat_id)
      .attr("data-section-name", seat.section_name)
      .attr("data-seat-price", seat.seat_price);

    // Only add the seat listener if its available for booking
    if (seat.booking_status === 0) {
      item.on("click", () => {
        $(".selected-seat").removeClass("selected-seat");
        item.addClass("selected-seat");
        this.openSeatDetailsModal(seat);
      });
    }

    return item;
  }

  openSeatDetailsModal(seat) {
    $("#modal-seat-number").html(
      `<strong>Seat Number:</strong> ${seat.seat_id}`
    );
    $("#modal-seat-section").html(
      `<strong>Seat Section:</strong> ${seat.section_name}`
    );
    $("#modal-seat-price").html(
      `<strong>Price:</strong> $${seat.seat_price.toFixed(2)}`
    );
    $("#modal-seat-image").attr("src", `/static/img/seats/${seat.seat_image}`);
    $("#seatDetailsModal").modal("show");
  }

  initializeCollapsibleSection(toggleSelector, targetSelector) {
    $(toggleSelector).click(function () {
      $(targetSelector).slideToggle();
      $(this).find("i").toggleClass("fa-chevron-down fa-chevron-up");
    });
  }

  attachAddToCartButtonListener() {
    const addToCartButton = document.querySelector(
      "#seatDetailsModal #addToCartBtn"
    );
    addToCartButton.addEventListener("click", () => {
      this.addToCart();
    });
  }

  addToCart() {
    const selectedSeat = this.getSelectedSeat();
    if (selectedSeat) {
      const eventDetails = this.buildAddToCartSeat(selectedSeat);

      $.post("/api/cart/add", {
        event_details: eventDetails,
      })
        .done(() => {
          console.log("Seat added to cart:", selectedSeat);
          $("#seatDetailsModal").modal("hide");

          const quantity = eventTicketDetails.reduce((prev, curr) => prev + parseInt(curr['quantity']), 0);
          const currentCount = cartCount.text(quantity);
          $('#cartCount').text(parseInt(currentCount) + 1);
        })
        .fail(() => {
          console.error("Failed to add seat to cart");
        });
    } else {
      console.log("No seat selected!");
    }
  }

  buildAddToCartSeat(selectedSeat) {
    return {
      event_id: this.eventDetailsData.event_id,
      event_name: this.eventDetailsData.event_name,
      venue_name: this.eventDetailsData.venue_name,
      venue_street: this.eventDetailsData.venue_street,
      venue_city: this.eventDetailsData.venue_city,
      venue_state: this.eventDetailsData.venue_state,
      venue_zip_code: this.eventDetailsData.venue_zip_code,
      venue_country: this.eventDetailsData.venue_country,
      venue_image: this.eventDetailsData.venue_image,
      artist: this.eventDetailsData.artist,
      start_date: this.eventDetailsData.start_date,
      start_time: this.eventDetailsData.start_time,
      event_image: this.eventDetailsData.event_image,
      seat: selectedSeat,
    };
  }

  getSelectedSeat() {
    const selectedSeatElement = document.querySelector(".selected-seat");

    if (selectedSeatElement) {
      const eventSeatId = selectedSeatElement.dataset.eventSeatId;
      const seatId = selectedSeatElement.dataset.seatId;
      const sectionName = selectedSeatElement.dataset.sectionName;
      const seatPrice = parseFloat(selectedSeatElement.dataset.seatPrice);

      return {
        event_seat_id: eventSeatId,
        seat_id: seatId,
        section_name: sectionName,
        seat_price: seatPrice,
      };
    } else {
      return null;
    }
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
