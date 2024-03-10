# Backstage-Pass

The purpose of this repository is to hold our Term Project called "Backstage Pass" for CS530 Developing User Interfaces at Drexel University for the Winter 2023-2024 Quarter.

# Setup

## Creating the Database

### Create a Database with Initialization Data

This will insert all necessary initialization data

```bash
cd dev
sqlite3 backstage_pass.db < create_db.txt
```

## Installing Dependencies
```bash
pip install -r requirements.txt
```

## Execute

In order to start the web-application, you will need to run the following command

```bash
python run.py
```

Once running, you will need to open your browser and navigate to `http://localhost:8080`

# Authors
- [Dheeraj Kaul](dk989@drexel.edu)
- [Robert Thompson](rt598@drexel.edu)
- [Zidane Wright](zdw32@drexel.edu)