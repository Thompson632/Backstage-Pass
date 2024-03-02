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
    venue_zip,
    venue_country,
  }) {
    return `${venue_street}, ${venue_city}, ${venue_state}, ${venue_zip}, ${venue_country}`;
  }

  createSeatListItem(seat) {
    const item = $("<li>")
      .text(`Seat ${seat.seat_id}: $${seat.seat_price.toFixed(2)}`)
      .css({
        cursor: seat.booking_status === 0 ? "pointer" : "not-allowed",
        opacity: seat.booking_status === 0 ? 1 : 0.6,
      });

    if (seat.booking_status === 0) {
      item.on("click", () => this.openSeatDetailsModal(seat));
    }

    return item;
  }

  openSeatDetailsModal(seat) {
    $("#modal-seat-number").html(`<strong>Seat Number:</strong> ${seat.seat_id}`);
    $("#modal-seat-section").html(`<strong>Seat Section:</strong> ${seat.section_name}`);
    $("#modal-seat-price").html(`<strong>Price:</strong> $${seat.seat_price.toFixed(2)}`);
    $("#modal-seat-image").attr("src", `/static/img/seats/${seat.seat_image}`);
    $("#seatDetailsModal").modal("show");
  }

  initializeCollapsibleSection(toggleSelector, targetSelector) {
    $(toggleSelector).click(function () {
      $(targetSelector).slideToggle();
      $(this).find("i").toggleClass("fa-chevron-down fa-chevron-up");
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
