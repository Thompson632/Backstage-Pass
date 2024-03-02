class EventDetailsView {
  constructor(event_details_data) {
    this.event_details_data = event_details_data;
    this.initialize();
  }

  initialize() {
    if (this.event_details_data) {
      this.updatePageWithEventDetails(this.event_details_data);
      this.initializeCollapsibleSections();
    }
  }

  updatePageWithEventDetails(data) {
    this.setEventInfo(data);
    this.setVenueImage(data.venue_image, data.venue_name);
    this.setEventImage(data.event_image, data.event_name);
    this.populateSeatList(data.seats);
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
    this.setTextContent(
      "#seats-available",
      `Seats Available: ${data.number_of_seats}`
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

  handleEventDetailsError(error) {
    alert(error);
    console.error("Error fetching event details:", error);
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

  createSeatListItem({ seat_number, seat_price, booking_status }) {
    return $("<li>").text(
      `Seat ${seat_number}: $${seat_price} - ${
        booking_status === 0 ? "Available" : "Booked"
      }`
    );
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
