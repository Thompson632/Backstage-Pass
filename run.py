# Robert Thompson, rt598@drexel.edu
# CS530: DUI, Assignment [2]

from flask import Flask, g, jsonify, render_template, request, session
from database import Database
app = Flask(__name__)

DATABASE_PATH = './dev/backstage_pass.db'


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = Database(DATABASE_PATH)
    return db


@app.route('/')
def home():
    return render_template('home.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/api/test/users')
def users_test():
    users = get_db().get_all_users()
    return jsonify(users)

if __name__ == '__main__':
    app.run(host='localhost', port=8080, debug=True)
