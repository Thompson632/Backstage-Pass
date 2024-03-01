import sqlite3
from .queries import *


class Database:
    def __init__(self, SQLITE_PATH="./dev/backstage_pass.db"):
        self.conn = sqlite3.connect(SQLITE_PATH)

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

  # End: User Ticket Functions

  # Get All events
    def get_events(self, search_criteria, filter_event_name):
        
        QUERY_STR = EVENT_TABLE_COLUMNS + EVENT_JOINS 
        criteria_list = []
        # if len(filter_event_name) != 0 :
        #     QUERY_STR = QUERY_STR + self.FILTER_CRITERIA_EVENT_NAMES
        if search_criteria != "" :
            criteria_list.append(search_criteria)
            criteria_list.append(search_criteria)
            criteria_list.append(search_criteria)
            QUERY_STR = QUERY_STR + SEARCH_CRITERIA + ORDER_BY
            # data = self.select(QUERY_STR, criteria_list)
            data = self.select(QUERY_STR, [search_criteria,search_criteria,search_criteria])
        else:
            data = self.select(QUERY_STR)
        
        # print (data)
        if data:
            return self.format_events (data)
        else:
            return None

    def get_distinct_events(self, search_criteria, filter_event_name):
        QUERY_STR = DISTINCT_EVENT_NAME + EVENT_JOINS 
        if search_criteria != "" :
                QUERY_STR = QUERY_STR + SEARCH_CRITERIA + ORDER_BY
                data = self.select(QUERY_STR, [search_criteria,search_criteria,search_criteria])
        else:
            data = self.select(QUERY_STR)
        if data:
            return [{
                'event_name': d[0]
            } for d in data]
        else:
            return None


    def get_distinct_cities(self, search_criteria, filter_event_name):
        QUERY_STR = DISTINCT_CITY_NAME + EVENT_JOINS 
        if search_criteria != "" :
                QUERY_STR = QUERY_STR + SEARCH_CRITERIA + ORDER_BY
                data = self.select(QUERY_STR, [search_criteria,search_criteria,search_criteria])
        else:
            data = self.select(QUERY_STR)

        if data:
            return [{
                'city': d[0]
            } for d in data]
        else:
            return None

    def get_distinct_artists(self, search_criteria, filter_event_name):
        QUERY_STR = DISTINCT_ARTIST_NAME + EVENT_JOINS 
        if search_criteria != "" :
                QUERY_STR = QUERY_STR + SEARCH_CRITERIA + ORDER_BY
                data = self.select(QUERY_STR, [search_criteria,search_criteria,search_criteria])
        else:
            data = self.select(QUERY_STR)
        if data:
            return [{
                'artist': d[0]
            } for d in data]
        else:
            return None

    def get_filtered_events(self, search_criteria):
        QUERY_STR = 'GET_ALL_EVENTS' 
        if search_criteria != "" :
            QUERY_STR = QUERY_STR + SEARCH_CRITERIA + ORDER_BY
            data = self.select(QUERY_STR, [search_criteria,search_criteria,search_criteria])
        else:
            data = self.select(QUERY_STR)
        if data:
            return [{
                'event_name': d[0]
            } for d in data]
        else:
            return None
        
    def format_events (self,data):
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

   # End: Event / Search Functions

    # Start: Insert into Contact Us
    def insert_contact_us(self, first_name, last_name, email_id, phone, question):
        self.execute(
            INSERT_CONTACT_US, [first_name, last_name, email_id, phone, question]
        )

    # End : Insert into Contact Us
    # Start: Event Details Functions
    def get_ticket_details(self, event_id):
        data = self.select(GET_EVENT_DETAILS_BY_EVENT_ID, [event_id])

        if data:
            return self.build_ticket_details(data)
        else:
            return None

    def build_ticket_details(self, ticket_details):
        event_info = self.build_ticket_detail(ticket_details[0])
        event_info["seats"] = [
            self.build_ticket_detail(row, only_seat=True) for row in ticket_details
        ]
        
        return event_info

    def build_ticket_detail(self, ticket_detail, only_seat=False):
        if only_seat:
            return {
                "seat_id": ticket_detail[16],
                "seat_number": ticket_detail[17],
                "seat_price": ticket_detail[18],
                "booking_status": ticket_detail[19],
            }
        else:
            return {
                "event_id": ticket_detail[0],
                "event_name": ticket_detail[1],
                "artist": ticket_detail[2],
                "start_date": ticket_detail[3],
                "end_date": ticket_detail[4],
                "start_time": ticket_detail[5],
                "end_time": ticket_detail[6],
                "event_image": ticket_detail[7],
                "venue_name": ticket_detail[8],
                "venue_street": ticket_detail[9],
                "venue_city": ticket_detail[10],
                "venue_state": ticket_detail[11],
                "venue_zip": ticket_detail[12],
                "venue_country": ticket_detail[13],
                "number_of_seats": ticket_detail[14],
                "venue_image": ticket_detail[15],
                "seats": [],
            }

    # End: Event Details Functions
