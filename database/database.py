import sqlite3
from .queries import *

class Database:
    def __init__(self, SQLITE_PATH="./dev/backstage_pass.db"):
        self.conn = sqlite3.connect(SQLITE_PATH)

        # Get Event Data
        self.GET_ALL_EVENTS = """
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
        self.execute(CREATE_USER, [first_name, last_name, username, encrypted_password])

    def get_user_by_id(self, id):
        data = self.select(GET_USER_BY_ID, [id])

        if data:
            return self.build_user_data(data[0])
        else:
            return None

    def get_user_by_username(self, username):
        data = self.select(GET_USER_BY_USERNAME, [username])

        if data:
            return self.build_user_data(data[0])
        else:
            return None

    def update_user_info(self, id, first_name, last_name):
        self.execute(UPDATE_USER_INFO, [first_name, last_name, id])

    def update_user_email_address(self, id, email_address):
        self.execute(UPDATE_EMAIL_ADDRESS, [email_address, id])

    def update_user_password(self, id, password):
        self.execute(UPDATE_PASSWORD, [password, id])

    def update_user_phone_number(self, id, phone_number):
        self.execute(UPDATE_PHONE_NUMBER, [phone_number, id])

    def update_user_address(self, id, street, city, state, zip_code, country):
        self.execute(UPDATE_ADDRESS, [street, city, state, zip_code, country, id])

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
        data = self.select(GET_TICKETS_BY_USER_ID, [id])

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
    def get_all_events(self):
        data = self.select(self.GET_ALL_EVENTS)
        print (data)
        if data:
            return [{
                'event_name': d[0],
                'artist': d[1],
                'start_date': d[2],
                'end_date': d[3],
                'start_time': d[4],
                'end_time': d[5],
                'event_image': d[6],
                'city': d[7],
                'zip_code': d[8],
                'state': d[9],
                'number_of_seats': d[10],
                'venue_img': d[11]
            } for d in data]
        else:
            return None

    # End: User Ticket Functions
