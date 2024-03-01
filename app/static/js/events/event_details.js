import { convertTo12HourFormat, convertDateToHumanReadable } from "../utils.js";

$(document).ready(function () {
  initializeEventDetailsPage();
});

function initializeEventDetailsPage() {
  getEventDetails();
  initializeCollapsibleSections();
}

function getEventDetails() {
  $.ajax({
    // TODO: Change to this when Dheeraj is done
    // url: "/events/event_details"
    url: "/api/event_details/test",
    type: "GET",
    dataType: "json",
    success: updatePageWithEventDetails,
    error: handleEventDetailsError,
  });
}

function updatePageWithEventDetails(data) {
  setEventInfo(data);
  setVenueImage(data.venue_image, data.venue_name);
  setEventImage(data.event_image, data.event_name);
  populateSeatList(data.seats);
}

function setEventInfo(data) {
  setTextContent("#event-name", data.event_name);
  setTextContent("#artist-name", data.artist);
  setTextContent(
    "#event-date",
    `Date: ${getHumanReadableDateRange(data.start_date, data.end_date)}`
  );
  setTextContent(
    "#event-time",
    `Time: ${getEventTimeRange(data.start_time, data.end_time)}`
  );
  setTextContent("#event-venue", `Venue: ${data.venue_name}`);
  setTextContent("#event-address", `Address: ${formatAddress(data)}`);
  setTextContent(
    "#seats-available",
    `Seats Available: ${data.number_of_seats}`
  );
}

function setVenueImage(src, alt) {
  setImageAttributes(
    "#venue-img",
    `/static/img/venues/${src}`,
    `Image of venue: ${alt}`
  );
}

function setEventImage(src, alt) {
  setImageAttributes(
    "#event-header img",
    `/static/img/events/${src}`,
    `Image of event: ${alt}`
  );
}

function populateSeatList(seats) {
  var seatList = $("#seat-list").empty();
  seats.forEach((seat) => seatList.append(createSeatListItem(seat)));
}

function initializeCollapsibleSections() {
  initializeCollapsibleSection("#toggle-venue-image", "#venue-img");
  initializeCollapsibleSection("#toggle-seat-info", "#seat-list");
}

// Utility Functions
function handleEventDetailsError(error) {
  alert(error);
  console.error("Error fetching event details:", error);
}

function setTextContent(selector, text) {
  $(selector).text(text);
}

function setImageAttributes(selector, src, alt) {
  $(selector).attr("src", src).attr("alt", alt);
}

function getHumanReadableDateRange(startDate, endDate) {
  return `${convertDateToHumanReadable(
    startDate
  )} to ${convertDateToHumanReadable(endDate)}`;
}

function getEventTimeRange(startTime, endTime) {
  return `${convertTo12HourFormat(startTime)} - ${convertTo12HourFormat(
    endTime
  )}`;
}

function formatAddress({
  venue_street,
  venue_city,
  venue_state,
  venue_zip,
  venue_country,
}) {
  return `${venue_street}, ${venue_city}, ${venue_state}, ${venue_zip}, ${venue_country}`;
}

function createSeatListItem({ seat_number, seat_price, booking_status }) {
  return $("<li>").text(
    `Seat ${seat_number}: $${seat_price} - ${
      booking_status === 0 ? "Available" : "Booked"
    }`
  );
}

function initializeCollapsibleSection(toggleSelector, targetSelector) {
  $(toggleSelector).click(function () {
    $(targetSelector).slideToggle();
    $(this).find("i").toggleClass("fa-chevron-down fa-chevron-up");
  });
}
