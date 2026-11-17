import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ai_service import process
from catalogue import PRODUCTS
from database import get_history, get_stats, init_db, save_query

app = FastAPI(title="RemedySetu AI Sales Assistant")
init_db()

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProcessRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/products")
def list_products():
    return PRODUCTS


@app.post("/api/process")
def process_message(req: ProcessRequest):
    message = req.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    result = process(message)
    try:
        result["id"] = save_query(result)
    except Exception:
        result["id"] = None
    return result


@app.get("/api/history")
def history():
    return get_history()


@app.get("/api/stats")
def stats():
    return get_stats()