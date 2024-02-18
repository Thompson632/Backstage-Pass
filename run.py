from flask import Flask, g, flash, render_template, redirect, request, session
from database import Database
from passlib.hash import pbkdf2_sha256

app = Flask(__name__)
app.secret_key = 'backstage_pass_cs530'
DATABASE_PATH = './dev/backstage_pass.db'



# Start: Login Messages
SUCCESSFUL_LOGIN = "You were successfully logged in"
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
@app.route('/create_account', methods=['GET', 'POST'])
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
                return redirect('/')
            else:
                # TODO: Change this to re-direct to login modal to login with their credentials
                print("**********************************************************")
                print("User:" + username +
                      " is already created - not fully implemented to stay on login modal")
                print("**********************************************************")
                return redirect('/')

    # TODO: Stay on the create account modal as there was an error
    print("**********************************************************")
    print("Error occured creating an account - not fully implemented")
    print("**********************************************************")
    return redirect('/')


@app.route('/login', methods=['GET', 'POST'])
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
                        return redirect('/')
                    else:
                        error_message = ERROR_INVALID_PASSWORD
                else:
                    error_message = ERROR_UNKNOWN_USER
            elif username and not password:
                error_message = ERROR_MISSING_PASSWORD
            elif not username and password:
                error_message = ERROR_MISSING_USERNAME

    # TODO: Stay on the login modal as there was an error. Pass error to the login modal
    print("*****************************************************************")
    print("Error occured logging in - not fully implemented:", error_message)
    print("*****************************************************************")
    flash(error_message)
    return redirect('/')


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
