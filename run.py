from flask import Flask, g, flash, render_template, redirect, request, session, jsonify
from database import Database
from passlib.hash import pbkdf2_sha256

app = Flask(__name__)
app.secret_key = "backstage_pass_cs530"
DATABASE_PATH = "./dev/backstage_pass.db"

# Start: Login Messages
SUCCESSFUL_LOGIN = "You were successfully logged in!"
ACCOUNT_CREATION = "Account successfully created!"
ERROR_USER_HAS_ACCOUNT = "Username entered already has an account."
ERROR_INVALID_DATA = "One or more fields entered is invalid."
ERROR_UNKNOWN_USER = "Unknown username, please try again."
ERROR_INVALID_PASSWORD = "Invalid password, please try again."
ERROR_MISSING_USERNAME = "Missing username, please try again"
ERROR_MISSING_PASSWORD = "Missing password, please try again"
# End: Login Message


def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = Database(DATABASE_PATH)
    return db


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/about")
def about():
    return render_template("about.html")


# Begin: Account Creation
@app.route("/create_account", methods=["POST"])
def create_account():
    if request.method == "POST":
        first_name = request.form.get("firstName")
        last_name = request.form.get("lastName")
        username = request.form.get("username")
        password = request.form.get("password")

        if is_valid_data([first_name, last_name, username, password]):
            if get_db().get_user_by_username(username) is None:
                encrypted_password = pbkdf2_sha256.hash(password)
                get_db().create_user(
                    first_name, last_name, username, encrypted_password
                )
                session["user"] = get_db().get_user_by_username(username)
                return jsonify({"success": True, "message": ACCOUNT_CREATION})
            else:
                return jsonify({"success": False, "error": ERROR_USER_HAS_ACCOUNT})

        return jsonify({"success": False, "error": ERROR_INVALID_DATA})


@app.route("/login", methods=["POST"])
def login():
    if "user" in session:
        return redirect("/")
    else:
        error_message = None
        if request.method == "POST":
            username = request.form.get("username")
            password = request.form.get("password")

            if username and password:
                user = get_db().get_user_by_username(username)

                if user:
                    if pbkdf2_sha256.verify(password, user["password"]):
                        session["user"] = user
                        return jsonify({"success": True, "message": SUCCESSFUL_LOGIN})
                    else:
                        error_message = ERROR_INVALID_PASSWORD
                else:
                    error_message = ERROR_UNKNOWN_USER
            elif username and not password:
                error_message = ERROR_MISSING_PASSWORD
            elif not username and password:
                error_message = ERROR_MISSING_USERNAME

    return jsonify({"success": False, "error": error_message})


@app.route("/signout")
def signout():
    session.pop("user", None)
    return redirect("/")


# End: Account Creation


# Start: Account Profile
@app.route("/account/settings", methods=["GET"])
def my_profile():
    if "user" in session:
        user_data = get_db().get_user_by_username(session["user"]["username"])
        return render_template("account/profile.html", user=user_data)
    else:
        redirect("/")


@app.route("/api/profile/edit/info", methods=["GET", "POST"])
def edit_user_info():
    if "user" in session:
        user_id = request.args.get("user_id")
        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")
        get_db().update_user_info(user_id, first_name, last_name)
        user_data = get_db().get_user_by_id(user_id)

        if user_data:
            return render_template("account/profile.html", user=user_data)
        else:
            return ("Error: Failed to update user info", 404)
    else:
        redirect("/")


@app.route("/api/profile/edit/email_address", methods=["POST"])
def edit_user_email_address():
    if "user" in session:
        user_id = request.args.get("user_id")
        email_address = request.form.get("email_address")
        get_db().update_user_email_address(user_id, email_address)
        user_data = get_db().get_user_by_id(user_id)

        if user_data:
            return render_template("account/profile.html", user=user_data)
        else:
            return ("Error: Failed to update user email address", 404)
    else:
        return redirect("/")


@app.route("/api/profile/edit/password", methods=["POST"])
def edit_user_password():
    if "user" in session:
        user_id = request.args.get("user_id")
        password = request.form.get("password")
        encrypted_password = pbkdf2_sha256.hash(password)
        get_db().update_user_password(user_id, encrypted_password)
        user_data = get_db().get_user_by_id(user_id)

        if user_data:
            return render_template("account/profile.html", user=user_data)
        else:
            return ("Error: Failed to update user password", 404)
    else:
        redirect("/")


@app.route("/api/profile/edit/phone_number", methods=["POST"])
def edit_user_phone_number():
    if "user" in session:
        user_id = request.args.get("user_id")
        phone_number = request.form.get("phone_number")
        get_db().update_user_phone_number(user_id, phone_number)
        user_data = get_db().get_user_by_id(user_id)

        if user_data:
            return render_template("account/profile.html", user=user_data)
        else:
            return ("Error: Failed to update user phone number", 404)
    else:
        redirect("/")


@app.route("/api/profile/edit/address", methods=["POST"])
def edit_user_address():
    if "user" in session:
        user_id = request.args.get("user_id")
        street = request.form.get("street")
        city = request.form.get("city")
        state = request.form.get("state")
        zip_code = request.form.get("zip_code")
        country = request.form.get("country")
        get_db().update_user_address(user_id, street, city, state, zip_code, country)
        user_data = get_db().get_user_by_id(user_id)

        if user_data:
            return render_template("account/profile.html", user=user_data)
        else:
            return ("Error: Failed to update user address", 404)
    else:
        redirect("/")
# End: Account Profile

# Start: Account Tickets
@app.route("/account/tickets", methods=["GET"])
def my_tickets():
    if "user" in session:
        user_ticket_data = get_db().get_user_by_username(session["user"]["username"])
        return render_template("account/tickets.html", user_ticket_data=user_ticket_data)
    else:
        redirect("/")
        
@app.route("/account/tickets", methods=["GET"])
def get_my_tickets():
    if "user" in session:
        print("not implemented")
    else:
        redirect("/")

@app.route("/account/tickets/ticket_details", methods=["GET"])
def get_my_ticket_details_by_id():
    if "user" in session:
        print("not implemented")
        return render_template("account/ticket_details.html")
    else:
        redirect("/")
# End: Account Tickets

def is_valid_data(parameters=[]):
    for param in parameters:
        if param is None:
            return False
    return True


if __name__ == "__main__":
    app.run(host="localhost", port=8080, debug=True)