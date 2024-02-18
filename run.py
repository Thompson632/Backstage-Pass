from flask import Flask, g, flash, render_template, redirect, request, session, jsonify
from database import Database
from passlib.hash import pbkdf2_sha256

app = Flask(__name__)
app.secret_key = 'backstage_pass_cs530'
DATABASE_PATH = './dev/backstage_pass.db'


# Start: Login Messages
SUCCESSFUL_LOGIN = "You were successfully logged in"
ERROR_USER_HAS_ACCOUNT = "Username entered already has an account."
ERROR_INVALID_DATA = "One or more fields entered is invalid."
ERROR_UNKNOWN_USER = "Unknown username, please try again."
ERROR_INVALID_PASSWORD = "Invalid password, please try again."
ERROR_MISSING_USERNAME = "Missing username, please try again"
ERROR_MISSING_PASSWORD = "Missing password, please try again"
# End: Login Message


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

# Begin: Account Creation


@app.route('/create_account', methods=['POST'])
def create_account():
    if request.method == 'POST':
        first_name = request.form["firstName"]
        last_name = request.form["lastName"]
        username = request.form["username"]
        password = request.form["password"]

        if is_valid_data([first_name, last_name, username, password]):
            if get_db().get_user(username) is None:
                encrypted_password = pbkdf2_sha256.hash(password)
                get_db().create_user(first_name, last_name, username, encrypted_password)
                session['user'] = get_db().get_user(username)
                flash(SUCCESSFUL_LOGIN)
                return jsonify({'success': True})
            else:
                return jsonify({'success': False, 'error': ERROR_USER_HAS_ACCOUNT})

        return jsonify({'success': False, 'error': ERROR_INVALID_DATA})


@app.route('/login', methods=['POST'])
def login():
    if 'user' in session:
        return redirect('/')
    else:
        error_message = None
        if request.method == 'POST':
            username = request.form['username']
            password = request.form['password']

            if username and password:
                user = get_db().get_user(username)

                if user:
                    if pbkdf2_sha256.verify(password, user['password']):
                        session['user'] = user
                        flash(SUCCESSFUL_LOGIN)
                        return jsonify({'success': True})
                    else:
                        error_message = ERROR_INVALID_PASSWORD
                else:
                    error_message = ERROR_UNKNOWN_USER
            elif username and not password:
                error_message = ERROR_MISSING_PASSWORD
            elif not username and password:
                error_message = ERROR_MISSING_USERNAME

    flash(error_message)
    return jsonify({'success': False, 'error': error_message})


@app.route('/signout')
def signout():
    session.pop('user', None)
    return redirect('/')


def is_valid_data(parameters=[]):
    for param in parameters:
        if param is None:
            return False
    return True
# End: Account Creation


if __name__ == '__main__':
    app.run(host='localhost', port=8080, debug=True)
