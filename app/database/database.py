import sqlite3

from .queries import *
from datetime import datetime


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
            "venue_id": ticket[4],
            "venue_name": ticket[5],
            "venue_street": ticket[6],
            "venue_city": ticket[7],
            "venue_state": ticket[8],
            "venue_zip_code": ticket[9],
            "venue_country": ticket[10],
            "venue_image": ticket[11],
            "artist": ticket[12],
            "start_date": ticket[13],
            "start_time": ticket[14],
            "event_image": ticket[15],
            "quantity": ticket[16],
            "ticket_order_date": ticket[17],
            "ticket_order_price": ticket[18],
            "seat_price": ticket[19],
            "seat_number": ticket[20],
            "section_id": ticket[21],
            "section_name": ticket[22],
            "section_image": ticket[23],
        }

    # End: User Ticket Functions

    # Get All events
    def get_events(
        self,
        search_criteria,
        filter_event_name,
        filter_city_name,
        filter_artist_name,
        filter_from_date,
        filter_to_date,
        n,
        offset,
    ):

        QUERY_STR = EVENT_TABLE_COLUMNS + EVENT_JOINS
        AND_CLAUSE = ""
        criteria_list = []
        QUERY_STR = QUERY_STR + self.format_filter_query_lists(
            FILTER_CRITERIA_EVENT_NAMES, filter_event_name, criteria_list
        )
        QUERY_STR = QUERY_STR + self.format_filter_query_lists(
            FILTER_CRITERIA_CITY, filter_city_name, criteria_list
        )
        QUERY_STR = QUERY_STR + self.format_filter_query_lists(
            FILTER_CRITERIA_ARTISTS, filter_artist_name, criteria_list
        )
        QUERY_STR = QUERY_STR + self.format_filter_query_string(
            FILTER_CRITERIA_FROM_DATE, filter_from_date, criteria_list
        )
        QUERY_STR = QUERY_STR + self.format_filter_query_string(
            FILTER_CRITERIA_TO_DATE, filter_to_date, criteria_list
        )

        if search_criteria != "":
            criteria_list.append(search_criteria)
            criteria_list.append(search_criteria)
            criteria_list.append(search_criteria)
            AND_CLAUSE = " AND " + AND_CLAUSE + SEARCH_CRITERIA

        criteria_list.append(n)
        criteria_list.append(offset)

        if criteria_list != None:
            QUERY_STR = QUERY_STR + AND_CLAUSE + ORDER_BY + QRY_LIMIT_OFFSET_EVENT
            data = self.select(QUERY_STR, criteria_list)
        else:
            data = self.select(QUERY_STR + ORDER_BY + QRY_LIMIT_OFFSET_EVENT)

        if data:
            return self.format_events(data)
        else:
            return None

    def get_event_count(
        self,
        search_criteria,
        filter_event_name,
        filter_city_name,
        filter_artist_name,
        filter_from_date,
        filter_to_date,
    ):

        QUERY_STR = QRY_COLS_EVENT_COUNT + EVENT_JOINS
        AND_CLAUSE = ""
        criteria_list = []
        QUERY_STR = QUERY_STR + self.format_filter_query_lists(
            FILTER_CRITERIA_EVENT_NAMES, filter_event_name, criteria_list
        )
        QUERY_STR = QUERY_STR + self.format_filter_query_lists(
            FILTER_CRITERIA_CITY, filter_city_name, criteria_list
        )
        QUERY_STR = QUERY_STR + self.format_filter_query_lists(
            FILTER_CRITERIA_ARTISTS, filter_artist_name, criteria_list
        )
        QUERY_STR = QUERY_STR + self.format_filter_query_string(
            FILTER_CRITERIA_FROM_DATE, filter_from_date, criteria_list
        )
        QUERY_STR = QUERY_STR + self.format_filter_query_string(
            FILTER_CRITERIA_TO_DATE, filter_to_date, criteria_list
        )

        if search_criteria != "":
            criteria_list.append(search_criteria)
            criteria_list.append(search_criteria)
            criteria_list.append(search_criteria)
            AND_CLAUSE = " AND " + AND_CLAUSE + SEARCH_CRITERIA

        if criteria_list != None:
            QUERY_STR = QUERY_STR + AND_CLAUSE + ORDER_BY
            data = self.select(QUERY_STR, criteria_list)
        else:
            data = self.select(QUERY_STR + ORDER_BY)

        if data:
            return [{"total_event_count": d[0]} for d in data]
        else:
            return None

    def get_distinct_events(self, search_criteria, filter_event_name):
        QUERY_STR = DISTINCT_EVENT_NAME + EVENT_JOINS
        if search_criteria != "":
            QUERY_STR = QUERY_STR + SEARCH_CRITERIA + ORDER_BY_FOR_FILTER
            data = self.select(
                QUERY_STR, [search_criteria, search_criteria, search_criteria]
            )
        else:
            data = self.select(QUERY_STR + ORDER_BY_FOR_FILTER)
        if data:
            return [{"event_name": d[0]} for d in data]
        else:
            return None

    def get_distinct_cities(self, search_criteria, filter_event_name):
        QUERY_STR = DISTINCT_CITY_NAME + EVENT_JOINS
        if search_criteria != "":
            QUERY_STR = QUERY_STR + SEARCH_CRITERIA + ORDER_BY_FOR_FILTER
            data = self.select(
                QUERY_STR, [search_criteria, search_criteria, search_criteria]
            )
        else:
            data = self.select(QUERY_STR + ORDER_BY_FOR_FILTER)

        if data:
            return [{"city": d[0]} for d in data]
        else:
            return None

    def get_distinct_artists(self, search_criteria, filter_event_name):
        QUERY_STR = DISTINCT_ARTIST_NAME + EVENT_JOINS
        if search_criteria != "":
            QUERY_STR = QUERY_STR + SEARCH_CRITERIA + ORDER_BY_FOR_FILTER
            data = self.select(
                QUERY_STR, [search_criteria, search_criteria, search_criteria]
            )
        else:
            data = self.select(QUERY_STR + ORDER_BY_FOR_FILTER)
        if data:
            return [{"artist": d[0]} for d in data]
        else:
            return None

    def format_events(self, data):
        return [
            {
                "event_id": d[0],
                "event_name": d[1],
                "artist": d[2],
                "start_date": d[3],
                "end_date": d[4],
                "start_time": d[5],
                "end_time": d[6],
                "event_image": d[7],
                "city": d[8],
                "zip_code": d[9],
                "state": d[10],
                "number_of_seats": d[11],
                "venue_img": d[12],
            }
            for d in data
        ]

    def format_filter_query_lists(
        self, filter_criteria_query, filter_list, criteria_list
    ):

        AND_CLAUSE = ""
        if filter_list != None and filter_list != "" and len(filter_list) != 0:
            AND_CLAUSE = " AND ("

            for item in filter_list:
                AND_CLAUSE = AND_CLAUSE + filter_criteria_query + " OR "
                criteria_list.append(item)

            # To remove last OR Clause
            AND_CLAUSE = AND_CLAUSE[:-3]
            AND_CLAUSE = AND_CLAUSE + ")"
        return AND_CLAUSE

    def format_filter_query_string(
        self, filter_criteria_query, filter_string, criteria_list
    ):

        AND_CLAUSE = ""
        if filter_string != None and filter_string != "" and len(filter_string) != 0:
            AND_CLAUSE = " AND ("
            AND_CLAUSE = AND_CLAUSE + filter_criteria_query
            criteria_list.append(filter_string)
            AND_CLAUSE = AND_CLAUSE + ")"
        return AND_CLAUSE

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
                "event_seat_id": ticket_detail[17],
                "seat_id": ticket_detail[18],
                "seat_price": ticket_detail[19],
                "booking_status": ticket_detail[20],
                "section_id": ticket_detail[21],
                "section_name": ticket_detail[22],
                "seat_image": ticket_detail[23],
            }
        else:
            return {
                "event_id": ticket_detail[0],
                "venue_id": ticket_detail[1],
                "event_name": ticket_detail[2],
                "artist": ticket_detail[3],
                "start_date": ticket_detail[4],
                "end_date": ticket_detail[5],
                "start_time": ticket_detail[6],
                "end_time": ticket_detail[7],
                "event_image": ticket_detail[8],
                "venue_name": ticket_detail[9],
                "venue_street": ticket_detail[10],
                "venue_city": ticket_detail[11],
                "venue_state": ticket_detail[12],
                "venue_zip_code": ticket_detail[13],
                "venue_country": ticket_detail[14],
                "number_of_seats": ticket_detail[15],
                "venue_image": ticket_detail[16],
                "seats": [],
            }

    # End: Event Details Functions

    # Begin: Checkout Functions
    def checkout(self, user_id, ticket_details, ticket_order_price):
        # Get the current date in the format YYYY-MM-DD
        ticket_order_date = datetime.now().strftime("%Y-%m-%d")

        self.execute(
            INSERT_TICKET_ORDER, [user_id, ticket_order_date, ticket_order_price]
        )
        ticket_order_id = self.get_last_inserted_id()

        for ticket_detail in ticket_details:
            event_id = ticket_detail["event_id"]
            event_seat_id = ticket_detail["seat_id"]
            quantity = ticket_detail["quantity"]
            self.execute(
                INSERT_TICKET_ORDER_DETAILS, [ticket_order_id, event_id, event_seat_id, quantity]
            )

            self.execute(UPDATE_EVENT_SEAT_BOOKING_STATUS, [event_seat_id])

    def get_last_inserted_id(self):
        c = self.conn.cursor()
        c.execute("SELECT last_insert_rowid()")
        return c.fetchone()[0]


# End: Checkout Functions
