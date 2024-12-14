from fastapi import FastAPI, HTTPException, Depends, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.types import JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
import os
import requests
import json
from datetime import datetime, timedelta
import logging
from dotenv import load_dotenv
import asyncio

# Load environment variables from .env file
load_dotenv()

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# GPT-4o API configuration
GPT4O_API_KEY = os.getenv("GPT4O_API_KEY")
if not GPT4O_API_KEY:
    raise ValueError("GPT4O_API_KEY environment variable is not set")
GPT4O_API_ENDPOINT = os.getenv("GPT4O_API_ENDPOINT", "https://api.openai.com/v1/chat/completions")

class ProfileCreate(BaseModel):
    name: str
    relationship: str
    birthday: str
    likes: List[str]
    dislikes: List[str]
    favorite_food: str
    favorite_movie: str
    hobbies: List[str]

class ProfileResponse(ProfileCreate):
    id: int

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    relationship: Optional[str] = None
    birthday: Optional[str] = None
    likes: Optional[List[str]] = None
    dislikes: Optional[List[str]] = None
    favorite_food: Optional[str] = None
    favorite_movie: Optional[str] = None
    hobbies: Optional[List[str]] = None

class QueryRequest(BaseModel):
    query: str

# Database setup
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.types import JSON

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////home/ubuntu/besti-ez/backend/backend.db?check_same_thread=False")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Profile(BaseModel):
    id: int
    name: str
    relationship: str
    birthday: str
    likes: List[str]
    dislikes: List[str]
    favorite_food: str
    favorite_movie: str
    hobbies: List[str]

class ProfileDB(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    relationship = Column(String)
    birthday = Column(String)
    likes = Column(String)  # Store as JSON string
    dislikes = Column(String)  # Store as JSON string
    favorite_food = Column(String)
    favorite_movie = Column(String)
    hobbies = Column(String)  # Store as JSON string

Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/profiles/", response_model=ProfileResponse)
async def create_profile(profile: ProfileCreate, db: Session = Depends(get_db)):
    db_profile = ProfileDB(
        name=profile.name,
        relationship=profile.relationship,
        birthday=profile.birthday,
        likes=json.dumps(profile.likes),
        dislikes=json.dumps(profile.dislikes),
        favorite_food=profile.favorite_food,
        favorite_movie=profile.favorite_movie,
        hobbies=json.dumps(profile.hobbies)
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return ProfileResponse(
        id=db_profile.id,
        name=db_profile.name,
        relationship=db_profile.relationship,
        birthday=db_profile.birthday,
        likes=json.loads(db_profile.likes),
        dislikes=json.loads(db_profile.dislikes),
        favorite_food=db_profile.favorite_food,
        favorite_movie=db_profile.favorite_movie,
        hobbies=json.loads(db_profile.hobbies)
    )

@app.get("/profiles/{profile_id}", response_model=ProfileResponse)
async def get_profile(profile_id: int, db: Session = Depends(get_db)):
    db_profile = db.query(ProfileDB).filter(ProfileDB.id == profile_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfileResponse(
        id=db_profile.id,
        name=db_profile.name,
        relationship=db_profile.relationship,
        birthday=db_profile.birthday,
        likes=json.loads(db_profile.likes),
        dislikes=json.loads(db_profile.dislikes),
        favorite_food=db_profile.favorite_food,
        favorite_movie=db_profile.favorite_movie,
        hobbies=json.loads(db_profile.hobbies)
    )

@app.put("/profiles/{profile_id}", response_model=ProfileResponse)
async def update_profile(profile_id: int, profile_update: ProfileUpdate, db: Session = Depends(get_db)):
    db_profile = db.query(ProfileDB).filter(ProfileDB.id == profile_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = profile_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key in ['likes', 'dislikes', 'hobbies']:
            setattr(db_profile, key, json.dumps(value))
        else:
            setattr(db_profile, key, value)

    db.commit()
    db.refresh(db_profile)

    return ProfileResponse(
        id=db_profile.id,
        name=db_profile.name,
        relationship=db_profile.relationship,
        birthday=db_profile.birthday,
        likes=json.loads(db_profile.likes),
        dislikes=json.loads(db_profile.dislikes),
        favorite_food=db_profile.favorite_food,
        favorite_movie=db_profile.favorite_movie,
        hobbies=json.loads(db_profile.hobbies)
    )

@app.delete("/profiles/{profile_id}")
async def delete_profile(profile_id: int, db: Session = Depends(get_db)):
    db_profile = db.query(ProfileDB).filter(ProfileDB.id == profile_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    db.delete(db_profile)
    db.commit()
    return {"message": "Profile deleted successfully"}

def query_gpt4o_api(profile: ProfileDB, query: str):
    logging.info(f"Querying GPT-4o API for profile {profile.id} with query: {query}")
    headers = {
        "Authorization": f"Bearer {GPT4O_API_KEY}",
        "Content-Type": "application/json"
    }

    # Ensure likes, dislikes, and hobbies are properly parsed from JSON
    likes = json.loads(profile.likes) if isinstance(profile.likes, str) else profile.likes
    dislikes = json.loads(profile.dislikes) if isinstance(profile.dislikes, str) else profile.dislikes
    hobbies = json.loads(profile.hobbies) if isinstance(profile.hobbies, str) else profile.hobbies

    prompt = f"""
    Profile Information:
    Name: {profile.name}
    Relationship: {profile.relationship}
    Birthday: {profile.birthday}
    Likes: {', '.join(likes)}
    Dislikes: {', '.join(dislikes)}
    Favorite Food: {profile.favorite_food}
    Favorite Movie: {profile.favorite_movie}
    Hobbies: {', '.join(hobbies)}

    User Query: {query}

    Please provide a detailed and personalized response based on the profile information above.
    """

    data = {
        "model": "gpt-4",  # or whichever model is appropriate for GPT-4o
        "messages": [{"role": "system", "content": "You are a helpful assistant with detailed knowledge about the user's loved ones."},
                     {"role": "user", "content": prompt}]
    }

    try:
        logging.info("Sending request to GPT-4o API")
        response = requests.post(GPT4O_API_ENDPOINT, headers=headers, json=data)
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content']
        logging.info("Received response from GPT-4o API")
        return content
    except requests.RequestException as e:
        logging.error(f"Error querying GPT-4o API: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error querying GPT-4o API: {str(e)}")

@app.post("/profiles/{profile_id}/query")
async def query_gpt4o(profile_id: int, query_request: QueryRequest, db: Session = Depends(get_db)):
    logging.info(f"Received query request for profile_id: {profile_id}")
    logging.debug(f"Query content: {query_request.query}")

    db_profile = db.query(ProfileDB).filter(ProfileDB.id == profile_id).first()
    if not db_profile:
        logging.warning(f"Profile not found for id: {profile_id}")
        raise HTTPException(status_code=404, detail="Profile not found")

    logging.info(f"Profile found: {db_profile.name}")

    logging.info("Calling GPT-4o API")
    response = query_gpt4o_api(db_profile, query_request.query)
    logging.info("Received response from GPT-4o API")

    return {"response": response}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            logging.info(f"Received message: {data}")
            message = json.loads(data)

            if message['action'] == 'query_gpt4o':
                db = next(get_db())
                profile_id = message['profile_id']
                query = message['query']

                db_profile = db.query(ProfileDB).filter(ProfileDB.id == profile_id).first()
                if not db_profile:
                    response = {"error": "Profile not found"}
                else:
                    gpt4o_response = query_gpt4o_api(db_profile, query)
                    response = {
                        "action": "suggestion_response",
                        "suggestion": gpt4o_response
                    }
            else:
                response = {"error": "Unknown action"}

            await websocket.send_text(json.dumps(response))
            logging.info(f"Sent response: {response}")
    except WebSocketDisconnect:
        logging.info("WebSocket disconnected")
    except json.JSONDecodeError:
        logging.error("Invalid JSON received")
        await websocket.send_text(json.dumps({"error": "Invalid JSON"}))
    except Exception as e:
        logging.error(f"WebSocket error: {str(e)}")
        await websocket.send_text(json.dumps({"error": str(e)}))
    finally:
        logging.info("WebSocket connection closed")
