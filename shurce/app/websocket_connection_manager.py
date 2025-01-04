from fastapi import WebSocket

from .models import User, WebSocketConnection, WebsocketMessage


class WebsocketConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocketConnection] = []

    def __get_user_connections(self, user: User):
        return [conn for conn in self.active_connections if conn.user.id == user.id]

    async def connect_user(self, user: User, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(WebSocketConnection(user, websocket))

    def disconnect_user(self, user: User):
        user_connections = self.__get_user_connections(user)

        for user_connection in user_connections:
            self.active_connections.remove(user_connection)

    async def broadcast_to_user(self, user: User, message: WebsocketMessage):
        user_connections = self.__get_user_connections(user)

        for user_connection in user_connections:
            await user_connection.websocket.send_text(message)

    async def broadcast_to_all(self, message: WebsocketMessage):
        for active_connection in self.active_connections:
            await active_connection.websocket.send_text(message)
