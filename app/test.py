import csv
import random

# Generate sample data for event_seats table
event_seats_data = []
counter = 1  # Initialize a counter for unique seat_ids across all events
for event_id in range(1, 21):  # 20 events
    for _ in range(1, 101):  # 100 seats for each event
        seat_price = round(random.uniform(50, 200), 2)  # Price range between $50 and $200
        booking_status = random.randint(0, 1)  # Booking status either 0 (not booked) or 1 (booked)
        # Use the counter for both id and seat_id to ensure they range from 1 to 2000
        event_seats_data.append((counter, event_id, counter, seat_price, booking_status))
        counter += 1  # Increment the counter

# Write the data to a CSV file
with open('event_seats_data.csv', mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(["id", "event_id", "seat_id", "seat_price", "booking_status"])
    for row in event_seats_data:
        writer.writerow(row)
