# Robert Thompson, rt598@drexel.edu
# CS530: DUI, Assignment [2]

import sqlite3

class Database:
    def __init__(self, SQLITE_PATH="./dev/backstage_pass.db"):
        self.conn = sqlite3.connect(SQLITE_PATH)
        
        # Begin: User Queries
        self.INSERT_USER_QUERY = "INSERT INTO users (first_name, last_name, username, password) VALUES (?, ?, ?, ?)"
        self.GET_USER_QUERY = "SELECT * FROM users WHERE username=?"
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
        self.execute(self.INSERT_USER_QUERY, [first_name, last_name, username, encrypted_password])
        
    def get_user(self, username):
        data = self.select(self.GET_USER_QUERY, [username])
        
        if data:
            user_data = data[0]
            return {
                'id': user_data[0],
                'username': user_data[1],
                'password': user_data[2],
                'first_name': user_data[3],
                'last_name': user_data[4]
            }
        else:
            return None
    # End: User Functions
