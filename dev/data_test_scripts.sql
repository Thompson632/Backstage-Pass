-- To generate eventseatbooking data
-- select e.id as eventId, s.id as venueSeatingId, 0 as isBooked
-- from event e 
-- INNER JOIN venue v on e.venueId = v.Id
-- INNER JOIN venueSeating s on s.venueId = v.id


-- Get all the tickets booked

-- select 
-- book.id as bookingId
-- ,   seat.id as seatingId
-- ,   v.id as venueId
-- ,   e.id as eventId
-- ,   book.eventId as bookEventId
-- ,   v.venueName
-- ,   v.city
-- ,   seat.seatNumber
-- ,   seat.price
-- ,   u.first_name
-- ,   u.last_name
-- ,   u.email_address
-- ,   u.phone_number
-- ,   e.eventName
-- ,   e.Artist
-- ,   eventStartDate  , eventStartTime 
-- ,   eventEndDate    , eventEndTime 
-- from eventseatbooking book 

-- INNER JOIN venue v on seat.venueId = v.id
-- INNER JOIN users u on book.userId = u.id
-- INNER JOIN event e on book.eventId = e.id
-- INNER JOIN venueseating seat on book.venueSeatingId = seat.Id --AND book.eventId = e.id
-- WHERE e.id = 3
-- Get all the tickets booked by a user
-- WHERE u.id = 1

SELECT 
	e.event_name
,	e.artist
,	e.start_date
,	e.end_date
,	e.start_time
,	e.end_time
,	e.event_image
,	v.city
,	v.zip_code
,	v.state
,	v.number_of_seats
,	img.image as venue_img
FROM event e 
INNER JOIN venue v ON e.venue_id = v.id 
INNER JOIN venue_image img ON v.venue_image_id = img.id


INSERt into contact_us (first_name, last_name,email_id, phone, question ) values 
('a', 'b', 'c@email.com', '2649283744', 'the question')