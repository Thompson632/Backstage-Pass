from flask import (
    Flask,
    flash,
    g,
    make_response,
    render_template,
    redirect,
    request,
    session,
    jsonify,
)
from database.database import Database
from passlib.hash import pbkdf2_sha256
from werkzeug.datastructures import MultiDict
import logging

from errors import *

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
app.secret_key = "backstage_pass_cs530"
DATABASE_PATH = "./dev/backstage_pass.db"


def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = Database(DATABASE_PATH)
    return db


@app.route("/")
def home():
    events = get_db().get_events("", [], [], [], "", "", 4, 0)
    return render_template("home.html", events=events)


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
                        flash(SUCCESSFUL_LOGIN, "success")
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
        return redirect("/")


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
            return jsonify({"error": FAILED_TO_UPDATE_USER_INFO}), 404
    else:
        return redirect("/")


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
            return jsonify({"error": FAILED_TO_UPDATE_USER_EMAIL_ADDRESS}), 404
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
            return jsonify({"error": FAILED_TO_UPDATE_USER_PASSWORD}), 404
    else:
        return redirect("/")


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
            return jsonify({"error": FAILED_TO_UPDATE_USER_PHONE_NUMBER}), 404
    else:
        return redirect("/")


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
            return jsonify({"error": FAILED_TO_UPDATE_USER_ADDRESS}), 404
    else:
        return redirect("/")


# End: Account Profile


# Start: Account Tickets
@app.route("/account/tickets", methods=["GET"])
def my_tickets():
    if "user" in session:
        return render_template("account/tickets.html")
    else:
        return redirect("/")


@app.route("/api/account/tickets", methods=["GET"])
def get_my_tickets():
    if "user" in session:
        user_id = session["user"]["id"]
        print("Getting Tickets for User Id:", user_id)
        user_ticket_data = get_db().get_user_tickets(user_id)
        return {"user_ticket_data": user_ticket_data}
    else:
        return redirect("/")


# End: Account Tickets

# Start: Get Events
@app.route("/events", methods=["GET","POST"])
def all_events():
    search_events = request.args.get('search_events','')
    
    filter_event_name = request.form.getlist('formControlEventName')
    filter_city = request.form.getlist('formControlCity')
    filter_artist = request.form.getlist('formControlArtist')
    filter_from_date = request.form.get('fromDate', '')
    filter_to_date = request.form.get('toDate', '')
    
    return render_template("events/events.html", search_events=search_events
                           , filter_event_name=filter_event_name
                           , filter_city_name = filter_city
                           , filter_artist_name = filter_artist
                           , filter_from_date = filter_from_date
                           , filter_to_date = filter_to_date
                           )

def generate_response(args):
    n = request.args.get('n', default=5)
    offset = request.args.get('offset', default=0)
    
    # print(n)
    # print(offset)
    search_events = request.args.get('search_events')
    # filter_event_name = request.form.getlist('filter_event_name[]')
    # filter_city_name = request.form.getlist('filter_city_name[]')
    # filter_artist_name = request.form.getlist('filter_artist_name[]')
    # filter_from_date = request.form.get('filter_from_date')
    # filter_to_date = request.form.get('filter_to_date')

    filter_event_name = request.args.getlist('filter_event_name[]')
    filter_city_name = request.args.getlist('filter_city_name[]')
    filter_artist_name = request.args.getlist('filter_artist_name[]')
    filter_from_date = request.args.get('filter_from_date')
    filter_to_date = request.args.get('filter_to_date')   
    if search_events :
        search_events = search_events
    else:
        search_events = ''

    return jsonify({
        'events': get_db().get_events(search_events, filter_event_name,filter_city_name,filter_artist_name, filter_from_date, filter_to_date, n, offset),
        'event_names' : get_db().get_distinct_events(search_events,filter_event_name),
        'city_names' : get_db().get_distinct_cities(search_events,filter_city_name),
        'artist_names' : get_db().get_distinct_artists(search_events, filter_artist_name),
        'total' : get_db().get_event_count(search_events, filter_event_name,filter_city_name,filter_artist_name, filter_from_date, filter_to_date),
    })

@app.route('/api/get_events', methods=['GET','POST'])
def api_get_events():
    return generate_response(request.form)


# End: Get Events


# Start: Checkout
@app.route("/checkout", methods=["POST"])
def checkout():
    if "user" in session:
        user_id = session["user"]["id"]

        total = 0
        for ticket in session["event_details_cart"]:
            total += float(ticket["total_price"])

        get_db().checkout(user_id, session["event_details_cart"], total)
        session["event_details_cart"] = []
        return jsonify({"success": SUCCESSFUL_CHECKOUT})
    else:
        return jsonify({"error": USER_NOT_LOGGED_IN}), 401


# End: Checkout


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
    print("Querying for:", event_id)
    event_details_data = get_db().get_ticket_details(event_id)
    return render_template(
        "events/event_details.html", event_details_data=event_details_data
    )


# End: Event Details


# Start: Cart
@app.route("/cart")
def cart():
    return render_template("cart.html")


@app.route("/api/cart", methods=["GET"])
def get_cart():
    if "event_details_cart" in session:
        return {"cart": session["event_details_cart"]}
    else:
        return {"cart": []}


@app.route("/api/cart/add", methods=["POST"])
def add_to_cart():
    event_details = build_event_details_dict(request.form)

    # If there is not a cart or if that cart is empty, add our event details
    if "event_details_cart" not in session or not session["event_details_cart"]:
        session["event_details_cart"] = [event_details]
    else:
        event_details_cart = session["event_details_cart"]
        event_seat_ids, seat_ids = get_seat_ids(event_details_cart)

        if event_details["event_seat_id"] in event_seat_ids and event_details["seat_id"] in seat_ids:
            original_ticket = get_original_ticket(event_details["event_seat_id"],
                event_details["event_id"], event_details["seat_id"], event_details_cart
            )

            if original_ticket:
                # Remove the original so we can update
                event_details_cart.remove(original_ticket)

                original_ticket["quantity"] = int(original_ticket["quantity"]) + 1
                original_ticket["total_price"] = float(
                    original_ticket["seat_price"]
                ) * int(original_ticket["quantity"])

                # Add it back with our updated seat price and quantity
                event_details_cart.append(original_ticket)
        else:
            event_details_cart.append(event_details)

        
        session["event_details_cart"] = event_details_cart
        
    print("Number of items in cart:", len(session["event_details_cart"]))
    return make_response()


def build_event_details_dict(form):
    event_id = form.get("event_details[event_id]")
    event_name = form.get("event_details[event_name]")
    venue_name = form.get("event_details[venue_name]")
    venue_street = form.get("event_details[venue_street]")
    venue_city = form.get("event_details[venue_city]")
    venue_state = form.get("event_details[venue_state]")
    venue_zip_code = form.get("event_details[venue_zip_code]")
    venue_country = form.get("event_details[venue_country]")
    venue_image = form.get("event_details[venue_image]")
    artist = form.get("event_details[artist]")
    start_date = form.get("event_details[start_date]")
    start_time = form.get("event_details[start_time]")
    event_image = form.get("event_details[event_image]")
    event_seat_id = form.get("event_details[seat][event_seat_id]")
    seat_id = form.get("event_details[seat][seat_id]")
    section_name = form.get("event_details[seat][section_name]")
    seat_price = form.get("event_details[seat][seat_price]")

    return MultiDict(
        [
            ("event_id", event_id),
            ("event_name", event_name),
            ("venue_name", venue_name),
            ("venue_street", venue_street),
            ("venue_city", venue_city),
            ("venue_state", venue_state),
            ("venue_zip_code", venue_zip_code),
            ("venue_country", venue_country),
            ("venue_image", venue_image),
            ("artist", artist),
            ("start_date", start_date),
            ("start_time", start_time),
            ("event_image", event_image),
            ("event_seat_id", event_seat_id),
            ("seat_id", seat_id),
            ("section_name", section_name),
            ("seat_price", seat_price),
            ("total_price", seat_price),
            ("quantity", 1),
        ]
    )


def get_original_ticket(event_seat_id, event_id, seat_id, cart_with_tickets):
    for ticket in cart_with_tickets:
        if ticket["event_seat_id"] == event_seat_id and ticket["event_id"] == event_id and ticket["seat_id"] == seat_id:
            return ticket

def get_seat_ids(event_details_cart):
    event_seat_ids = []
    for ticket in event_details_cart:
        event_seat_ids.append(ticket["event_seat_id"])
        
    seat_ids = []
    for ticket in event_details_cart:
        seat_ids.append(ticket["seat_id"])
    
    return event_seat_ids, seat_ids


@app.route("/api/update_cart", methods=["POST"])
def update_cart():
    event_details_cart = []
    session["event_details_cart"] = event_details_cart

    num_tickets = int(request.form.get("num_tickets"))

    for current_index in range(num_tickets):
        event_details = build_cart_event_details(str(current_index), request.form)
        # Only add if there is at least a quantity of one
        if event_details:
            event_details_cart.append(
                build_cart_event_details(str(current_index), request.form)
            )

    session["event_details_cart"] = event_details_cart
    return {"cart": event_details_cart}


def build_cart_event_details(current_index, form):
    event_id = form.get("cart" + "[" + current_index + "][event_id]")
    event_name = form.get("cart" + "[" + current_index + "][event_name]")
    venue_name = form.get("cart" + "[" + current_index + "][venue_name]")
    venue_street = form.get("cart" + "[" + current_index + "][venue_street]")
    venue_city = form.get("cart" + "[" + current_index + "][venue_city]")
    venue_state = form.get("cart" + "[" + current_index + "][venue_state]")
    venue_zip_code = form.get("cart" + "[" + current_index + "][venue_zip_code]")
    venue_country = form.get("cart" + "[" + current_index + "][venue_country]")
    venue_image = form.get("cart" + "[" + current_index + "][venue_image]")
    artist = form.get("cart" + "[" + current_index + "][artist]")
    start_date = form.get("cart" + "[" + current_index + "][start_date]")
    start_time = form.get("cart" + "[" + current_index + "][start_time]")
    event_image = form.get("cart" + "[" + current_index + "][event_image]")
    seat_id = form.get("cart" + "[" + current_index + "][seat_id]")
    section_name = form.get("cart" + "[" + current_index + "][section_name]")
    seat_price = form.get("cart" + "[" + current_index + "][seat_price]")
    quantity = form.get("cart" + "[" + current_index + "][quantity]")
    total_price = form.get("cart" + "[" + current_index + "][total_price]")

    # We don't want to keep the ticket in the list
    # if the quantity is less than 1
    if int(quantity) >= 1:
        return MultiDict(
            [
                ("event_id", event_id),
                ("event_name", event_name),
                ("venue_name", venue_name),
                ("venue_street", venue_street),
                ("venue_city", venue_city),
                ("venue_state", venue_state),
                ("venue_zip_code", venue_zip_code),
                ("venue_country", venue_country),
                ("venue_image", venue_image),
                ("artist", artist),
                ("start_date", start_date),
                ("start_time", start_time),
                ("event_image", event_image),
                ("seat_id", seat_id),
                ("section_name", section_name),
                ("seat_price", seat_price),
                ("total_price", total_price),
                ("quantity", quantity),
            ]
        )
    else:
        return None


# End: Cart
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
