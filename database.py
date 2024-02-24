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
        self.execute(self.CREATE_USER, [
                     first_name, last_name, username, encrypted_password])

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
        self.execute(self.UPDATE_USER_INFO, [
                     first_name, last_name, id])

    def update_user_email_address(self, id, email_address):
        self.execute(self.UPDATE_EMAIL_ADDRESS, [email_address, id])

    def update_user_password(self, id, password):
        self.execute(self.UPDATE_PASSWORD, [password, id])

    def update_user_phone_number(self, id, phone_number):
        self.execute(self.UPDATE_PHONE_NUMBER, [phone_number, id])

    def update_user_address(self, id, street, city, state, zip_code, country):
        self.execute(self.UPDATE_ADDRESS, [
                     street, city, state, zip_code, country, id])

    def build_user_data(self, user_data):
        return {
            'id': user_data[0],
            'username': user_data[1],
            'password': user_data[2],
            'first_name': user_data[3],
            'last_name': user_data[4],
            'email_address': user_data[5],
            'phone_number': user_data[6],
            'street': user_data[7],
            'city': user_data[8],
            'state': user_data[9],
            'zip_code': user_data[10],
            'country': user_data[11]
        }
    # End: User Functions
