from fastapi import WebSocket
from typing import Dict, Set, Any

class ConnectionManager:
    def __init__(self):
        # cafeteria_id -> set of websockets
        self.vendor_connections: Dict[int, Set[WebSocket]] = {}
        # user_id -> set of websockets
        self.student_connections: Dict[int, Set[WebSocket]] = {}

    async def connect_vendor(self, websocket: WebSocket, cafeteria_id: int):
        await websocket.accept()
        self.vendor_connections.setdefault(cafeteria_id, set()).add(websocket)

    async def connect_student(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.student_connections.setdefault(user_id, set()).add(websocket)

    def disconnect_vendor(self, websocket: WebSocket, cafeteria_id: int):
        if cafeteria_id in self.vendor_connections:
            self.vendor_connections[cafeteria_id].discard(websocket)

    def disconnect_student(self, websocket: WebSocket, user_id: int):
        if user_id in self.student_connections:
            self.student_connections[user_id].discard(websocket)

    async def broadcast_to_vendor(self, cafeteria_id: int, message: Any):
        if cafeteria_id in self.vendor_connections:
            for connection in self.vendor_connections[cafeteria_id]:
                await connection.send_json(message)

    async def broadcast_to_student(self, user_id: int, message: Any):
        if user_id in self.student_connections:
            for connection in self.student_connections[user_id]:
                await connection.send_json(message)

manager = ConnectionManager()