# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, cafeterias, orders, vendor
from fastapi import WebSocket, WebSocketDisconnect

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SlotBite Campus")

# CORS (important for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers under /api/v1 to match frontend requests
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(cafeterias.router, prefix="/api/v1/cafeterias", tags=["cafeterias"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(vendor.router, prefix="/api/v1/vendor", tags=["vendor"])  # if you have separate

@app.get("/api/v1")
@app.get("/")
def root():
    return {
        "message": "SlotBite Campus API is running 🚀",
        "version": "1.0",
        "hackathon_mode": True
    }



# Add this after your other imports and app creation
active_connections = []

@app.websocket("/ws/vendor")
async def vendor_websocket(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        active_connections.remove(websocket)