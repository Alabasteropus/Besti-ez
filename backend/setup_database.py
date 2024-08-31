import sqlite3
import json

# Connect to the SQLite database
conn = sqlite3.connect('/home/ubuntu/besti-ez/backend/backend.db')
cursor = conn.cursor()

# Create the profiles table
cursor.execute('''
CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    birthday TEXT NOT NULL,
    likes TEXT NOT NULL,
    dislikes TEXT NOT NULL,
    favorite_food TEXT NOT NULL,
    favorite_movie TEXT NOT NULL,
    hobbies TEXT NOT NULL
)
''')

# Mock data from the frontend
mock_profiles = [
    {"id": 1, "name": "Alice", "relationship": "Spouse", "birthday": "1985-03-15", "likes": ["Reading", "Hiking", "Cooking"], "dislikes": ["Loud noises", "Spicy food"], "favorite_food": "Italian cuisine", "favorite_movie": "The Shawshank Redemption", "hobbies": ["Photography", "Gardening"]},
    {"id": 2, "name": "Bob", "relationship": "Kid", "birthday": "2010-07-22", "likes": ["Video games", "Soccer"], "dislikes": ["Vegetables", "Early bedtime"], "favorite_food": "Pizza", "favorite_movie": "Toy Story", "hobbies": ["Drawing", "Lego building"]},
    {"id": 3, "name": "Carol", "relationship": "Parent", "birthday": "1955-11-30", "likes": ["Gardening", "Knitting"], "dislikes": ["Technology", "Loud music"], "favorite_food": "Homemade soup", "favorite_movie": "Gone with the Wind", "hobbies": ["Birdwatching", "Crossword puzzles"]},
    {"id": 4, "name": "David", "relationship": "Friend", "birthday": "1988-09-03", "likes": ["Sports", "Traveling"], "dislikes": ["Cold weather", "Crowds"], "favorite_food": "Sushi", "favorite_movie": "Inception", "hobbies": ["Running", "Photography"]},
]

# Insert mock data into the profiles table
for profile in mock_profiles:
    cursor.execute('''
    INSERT INTO profiles (name, relationship, birthday, likes, dislikes, favorite_food, favorite_movie, hobbies)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        profile['name'],
        profile['relationship'],
        profile['birthday'],
        json.dumps(profile['likes']),
        json.dumps(profile['dislikes']),
        profile['favorite_food'],
        profile['favorite_movie'],
        json.dumps(profile['hobbies'])
    ))

# Commit the changes and close the connection
conn.commit()
conn.close()

print("Database setup completed successfully.")
