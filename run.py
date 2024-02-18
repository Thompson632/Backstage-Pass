from flask import Flask, g, jsonify, render_template, redirect, request, session
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

# Begin: Account Creation


@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user' in session:
        return redirect('/')
    else:
        message = None
        if request.method == 'POST':
            username = request.form['username']
            typed_password = request.form['password']
            if username and typed_password:
                user = get_db().get_user(username)
                if user:
                    if typed_password == user['password']:
                        session['user'] = user
                        return redirect('/')
                    else:
                        message = "Incorrect password, please try again"
                else:
                    message = "Unknown user, please try again"
            elif username and not typed_password:
                message = "Missing password, please try again"
            elif not username and typed_password:
                message = "Missing username, please try again"
        return render_template('login.html', message=message)

# End: Account Creation


# Begin: Test Routes
@app.route('/api/test/users')
def users_test():
    users = get_db().get_all_users()
    return jsonify(users)


# End: Test Routes
if __name__ == '__main__':
    app.run(host='localhost', port=8081, debug=True)
