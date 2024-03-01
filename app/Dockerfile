# Use an official Python runtime as a parent image
FROM python:3.12

# Set the working directory in the container
WORKDIR /app

# Install any needed dependencies
RUN pip install --no-cache-dir Flask

# Copy the current directory contents into the container at /app
COPY . /app

# If there are additional dependencies (e.g., in a requirements.txt)
# then install them here
RUN pip install -r requirements.txt

CMD ["python3", "main.py"]
