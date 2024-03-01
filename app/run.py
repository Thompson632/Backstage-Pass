from flask import Flask, g, render_template, redirect, request, session, jsonify
from database.database import Database
from passlib.hash import pbkdf2_sha256
import logging

logging.basicConfig(level=logging.INFO)

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
        user_id = session["user"]["id"]
        user_ticket_data = get_db().get_user_tickets(user_id)
        print(user_ticket_data)
        return render_template(
            "account/tickets.html", user_ticket_data=user_ticket_data
        )
    else:
        redirect("/")


# End: Account Tickets

# Start: Get Events
@app.route("/events", methods=["GET","POST"])
def all_events():
    search_events = request.args.get('search_events','')
    
    filter_event_name = request.form.getlist('formControlEventName')
    filter_city = request.form.getlist('formControlCity')
    filter_artist = request.form.getlist('formControlArtist')
    filter_from_date = request.form.get('fromDate')
    filter_to_date = request.form.getlist('toDate')
    # print (filter_event_name)
    
    return render_template("events/events.html", search_events=search_events, filter_event_name=filter_event_name)

def generate_response(args):
    search_events = request.args.get('search_events')
    filter_event_name = request.form.getlist('filter_event_name')
    if search_events :
        search_events = search_events
        # print("Search Criteria Found")
    else:
        # print("Search Criteria NOT Found")
        search_events = ''

    return jsonify({
        'events': get_db().get_events(search_events, filter_event_name),
        'event_names' : get_db().get_distinct_events(search_events,filter_event_name),
        'city_names' : get_db().get_distinct_cities(search_events,filter_event_name),
        'artist_names' : get_db().get_distinct_artists(search_events, filter_event_name)
    })

@app.route('/api/get_events', methods=['GET','POST'])
def api_get_events():
    
    filter_event_name = request.args.get('filter_event_name')
    print(filter_event_name)
    # print(len(filter_event_name))
    if filter_event_name:
        lst = filter_event_name.split(',')
        print("*****************************")
        print(lst)

    
    # print(len(filter_event_name))
    return generate_response(request.form)

# End: Get Events

# Begin Contact Us
@app.route("/contactus", methods=["POST"])
def submit_contact_us():
    first_name = request.form.get("first_name_input")
    last_name = request.form.get("last_name_input")
    email_id = request.form.get("email_id_input")
    phone = request.form.get("phone_input")
    question = request.form.get("query_input")
    get_db().insert_contact_us(first_name, last_name, email_id, phone, question)
    return redirect("/")


# End Contact Us


# Start: Event Details
@app.route("/events/event_details", methods=["GET"])
def get_event_details():
    event_id = request.args.get("event_id")
    print(request)
    print(request.form)
    print("Querying for:", event_id)
    event_details_data = get_db().get_ticket_details(event_id)
    return render_template(
        "events/event_details.html", event_details_data=event_details_data
    )


@app.route("/api/event_details/test", methods=["GET"])
def test_get_event_details():
    event_details_data = get_db().get_ticket_details("1")
    return jsonify(event_details_data)


# End: Event Details
def is_valid_data(parameters=[]):
    for param in parameters:
        if param is None:
            return False
    return True


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--host", type=str, default="127.0.0.1")

    args = parser.parse_args()

    app.run(debug=True, host=args.host, port=8080)
