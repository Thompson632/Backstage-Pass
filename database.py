import sqlite3


class Database:
    def __init__(self, SQLITE_PATH="./dev/backstage_pass.db"):
        self.conn = sqlite3.connect(SQLITE_PATH)

        # Begin: User Queries
        self.CREATE_USER = "INSERT INTO user (first_name, last_name, username, password) VALUES (?, ?, ?, ?)"
        self.GET_USER_BY_USERNAME = "SELECT * FROM user WHERE username=?"
        self.GET_USER_BY_ID = "SELECT * FROM user where id=?"
        self.UPDATE_USER_INFO = "UPDATE user SET first_name=?, last_name=? WHERE id=?"
        self.UPDATE_EMAIL_ADDRESS = "UPDATE user SET email_address=? WHERE id=?"
        self.UPDATE_PASSWORD = "UPDATE user SET password=? WHERE id=?"
        self.UPDATE_PHONE_NUMBER = "UPDATE user SET phone_number=? WHERE id=?"
        self.UPDATE_ADDRESS = "UPDATE user SET street=?, city=?, state=?, zip_code=?, country=? WHERE id=?"
        # End: User Queries

        # Begin: User Ticket Queries
        self.GET_TICKETS_BY_USER_ID = """
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
        # end: User Ticket Queries

        # Get Event Data
        self.GET_ALL_EVENTS = """
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
                    FROM event e 
                    INNER JOIN venue v ON e.venue_id = v.id 
                    INNER JOIN venue_image img ON v.venue_image_id = img.id
                    WHERE e.start_date >= date('now')
                """
        self.SEARCH_CRITERIA = """
                 AND  e.event_name LIKE '%' || ?  || '%'
                 OR     e.artist LIKE '%' || ?  || '%'
                 OR     v.city LIKE '%' || ?  || '%' 
                """
        self.ORDER_BY = """
                 ORDER BY e.start_date DESC
                """
  
        # end: Get Event Data
    
    def select(self, sql, parameters=[]):
        c = self.conn.cursor()
        c.execute(sql, parameters)
        return c.fetchall()

    def execute(self, sql, parameters=[]):
        c = self.conn.cursor()
        c.execute(sql, parameters)
        self.conn.commit()

    def close(self):
        self.conn.close()

    # Begin: User Functions
    def create_user(self, first_name, last_name, username, encrypted_password):
        self.execute(
            self.CREATE_USER, [first_name, last_name, username, encrypted_password]
        )

    def get_user_by_id(self, id):
        data = self.select(self.GET_USER_BY_ID, [id])

        if data:
            return self.build_user_data(data[0])
        else:
            return None

    def get_user_by_username(self, username):
        data = self.select(self.GET_USER_BY_USERNAME, [username])

        if data:
            return self.build_user_data(data[0])
        else:
            return None

    def update_user_info(self, id, first_name, last_name):
        self.execute(self.UPDATE_USER_INFO, [first_name, last_name, id])

    def update_user_email_address(self, id, email_address):
        self.execute(self.UPDATE_EMAIL_ADDRESS, [email_address, id])

    def update_user_password(self, id, password):
        self.execute(self.UPDATE_PASSWORD, [password, id])

    def update_user_phone_number(self, id, phone_number):
        self.execute(self.UPDATE_PHONE_NUMBER, [phone_number, id])

    def update_user_address(self, id, street, city, state, zip_code, country):
        self.execute(self.UPDATE_ADDRESS, [street, city, state, zip_code, country, id])

    def build_user_data(self, user_data):
        return {
            "id": user_data[0],
            "username": user_data[1],
            "password": user_data[2],
            "first_name": user_data[3],
            "last_name": user_data[4],
            "email_address": user_data[5],
            "phone_number": user_data[6],
            "street": user_data[7],
            "city": user_data[8],
            "state": user_data[9],
            "zip_code": user_data[10],
            "country": user_data[11],
        }

    # End: User Functions

    # Begin: User Ticket Functions
    def get_user_tickets(self, id):
        data = self.select(self.GET_TICKETS_BY_USER_ID, [id])

        if data:
            return self.build_user_tickets(data)
        else:
            return None

    def build_user_tickets(self, tickets):
        user_tickets = []
        for ticket in tickets:
            user_tickets.append(self.build_user_ticket(ticket))

        return user_tickets

    def build_user_ticket(self, ticket):
        return {
            "user_id": ticket[0],
            "ticket_id": ticket[1],
            "event_id": ticket[2],
            "event_name": ticket[3],
            "venue_name": ticket[4],
            "venue_street": ticket[5],
            "venue_city": ticket[6],
            "venue_state": ticket[7],
            "venue_zip_code": ticket[8],
            "venue_country": ticket[9],
            "venue_image": ticket[10],
            "artist": ticket[11],
            "start_date": ticket[12],
            "start_time": ticket[13],
            "event_image": ticket[14],
            "quantity": ticket[15],
            "ticket_order_date": ticket[16],
            "ticket_order_price": ticket[17],
            "seat_price": ticket[18],
            "seat_number": ticket[19],
        }

    # Get All events
    def get_all_events(self, search_criteria):
        
        if search_criteria != "" :
            data = self.select(self.GET_ALL_EVENTS + self.SEARCH_CRITERIA + self.ORDER_BY, [search_criteria ,search_criteria,search_criteria])
        else:
            data = self.select(self.GET_ALL_EVENTS + self.ORDER_BY)
        
        print (data)
        if data:
            return [{
                'event_id': d[0],
                'event_name': d[1],
                'artist': d[2],
                'start_date': d[3],
                'end_date': d[4],
                'start_time': d[5],
                'end_time': d[6],
                'event_image': d[7],
                'city': d[8],
                'zip_code': d[9],
                'state': d[10],
                'number_of_seats': d[11],
                'venue_img': d[12]
            } for d in data]
        else:
            return None

    # End: User Ticket Functions
