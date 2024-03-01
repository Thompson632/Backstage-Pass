# Start: User Queries
CREATE_USER = (
    "INSERT INTO user (first_name, last_name, username, password) VALUES (?, ?, ?, ?)"
)
GET_USER_BY_USERNAME = "SELECT * FROM user WHERE username=?"
GET_USER_BY_ID = "SELECT * FROM user where id=?"
UPDATE_USER_INFO = "UPDATE user SET first_name=?, last_name=? WHERE id=?"
UPDATE_EMAIL_ADDRESS = "UPDATE user SET email_address=? WHERE id=?"
UPDATE_PASSWORD = "UPDATE user SET password=? WHERE id=?"
UPDATE_PHONE_NUMBER = "UPDATE user SET phone_number=? WHERE id=?"
UPDATE_ADDRESS = (
    "UPDATE user SET street=?, city=?, state=?, zip_code=?, country=? WHERE id=?"
)
# End: User Queries

# Start: User Ticket Queries
GET_TICKETS_BY_USER_ID = """
    SELECT
        u.id AS user_id,
        tod.id AS ticket_id,
        e.id AS event_id,
        e.event_name AS event_name,
        v.venue_name AS venue_name,
        v.street AS venue_street,
        v.city AS venue_city,
        v.state AS venue_state,
        v.zip_code AS venue_zip_code,
        v.country AS venue_country,
        vi.image AS venue_image,
        e.artist AS artist,
        e.start_date AS start_date,
        e.start_time AS start_time,
        e.event_image AS event_image,
        tod.quantity AS quantity,
        ticket_orders.ticket_order_date AS ticket_order_date,
        ticket_orders.ticket_order_price AS ticket_order_price,
        es.seat_price AS seat_price,
        es.seat_number AS seat_number
    FROM
        ticket_orders
    INNER JOIN user u ON ticket_orders.user_id = u.id
    INNER JOIN ticket_order_details tod ON ticket_orders.id = tod.ticket_order_id
    INNER JOIN event_seat es ON tod.seat_id = es.id -- Correct reference to event_seat table
    INNER JOIN event e ON es.event_id = e.id
    INNER JOIN venue v ON e.venue_id = v.id
    LEFT JOIN venue_image vi ON v.venue_image_id = vi.id
    WHERE
        u.id = ?;
"""
# End: User Ticket Queries

# Start: Get Events/Search Queries
        # Get Event Data
EVENT_TABLE_COLUMNS = """
                SELECT 
                        e.id AS event_id
                    ,   e.event_name
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
            """

DISTINCT_EVENT_NAME = """
            SELECT DISTINCT   e.event_name
            """   

DISTINCT_CITY_NAME = """
            SELECT DISTINCT   v.city
            """  

DISTINCT_ARTIST_NAME = """
            SELECT DISTINCT   e.artist
            """  
                        
EVENT_JOINS = """
            FROM event e 
            INNER JOIN venue v ON e.venue_id = v.id 
            INNER JOIN venue_image img ON v.venue_image_id = img.id
        """
    # WHERE e.start_date >= date('now')

FILTER_CRITERIA_EVENT_NAMES ="""
            AND e.event_name IN (?)
        """

FILTER_CRITERIA_CITY ="""
            AND v.city IN (?)
        """

FILTER_CRITERIA_ARTISTS ="""
            AND e.artist IN (?)
        """

FILTER_CRITERIA_FROM_DATE ="""
        AND   e.start_date >= ?
        """

FILTER_CRITERIA_TO_DATE ="""
        AND   e.end_date <= ?
        """                                
SEARCH_CRITERIA = """
            AND  (e.event_name LIKE '%' || ?  || '%'
            OR     e.artist LIKE '%' || ?  || '%'
            OR     v.city LIKE '%' || ?  || '%' )
        """
ORDER_BY = """
            ORDER BY e.start_date DESC
        """


# end: Get Event Data

# Start: Contact Us Queries
INSERT_CONTACT_US = """
                INSERT INTO contact_us ( first_name , last_name ,   email_id,  phone , question)
                VALUES (?, ?, ?, ?, ?)
                ;
                """
# End: Contact Us Queries

# Start: Event Details Queries
GET_EVENT_DETAILS_BY_EVENT_ID = """
    SELECT 
        e.id AS event_id,
        e.event_name,
        e.artist,
        e.start_date,
        e.end_date,
        e.start_time,
        e.end_time,
        e.event_image,
        v.venue_name,
        v.street AS venue_street,
        v.city AS venue_city,
        v.state AS venue_state,
        v.zip_code AS venue_zip,
        v.country AS venue_country,
        v.number_of_seats,
        vi.image AS venue_image,
        es.id AS seat_id,
        es.seat_number,
        es.seat_price,
        es.booking_status
    FROM 
        event e
    INNER JOIN venue v ON e.venue_id = v.id
    INNER JOIN venue_image vi ON v.venue_image_id = vi.id
    INNER JOIN event_seat es ON e.id = es.event_id
    WHERE 
        e.id = ?;
"""
