package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/gorilla/websocket"

	"github.com/keep-starknet-strange/art-peace/backend/core"
)

func InitWebsocketRoutes() {
	http.HandleFunc("/ws", wsEndpoint)
}

func wsReader(conn *websocket.Conn) {
	for {
		_, p, err := conn.ReadMessage()
		if err != nil {
			fmt.Println(err)
			return
		}

		var message struct {
			Event string `json:"event"`
			Data  struct {
				Channel string `json:"channel"`
			} `json:"data"`
		}

		if err := json.Unmarshal(p, &message); err != nil {
			fmt.Println("Error parsing message:", err)
			continue
		}

		switch message.Event {
		case "subscribe":
			if strings.HasPrefix(message.Data.Channel, "world_") {
				worldID := strings.TrimPrefix(message.Data.Channel, "world_")
				core.ArtPeaceBackend.AddWorldSubscriber(worldID, conn)
			} else {
				core.ArtPeaceBackend.AddGeneralSubscriber(conn)
			}

		case "unsubscribe":
			if strings.HasPrefix(message.Data.Channel, "world_") {
				worldID := strings.TrimPrefix(message.Data.Channel, "world_")
				core.ArtPeaceBackend.RemoveWorldSubscriber(worldID, conn)
			}
		}
	}
}

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{
		ReadBufferSize:  core.ArtPeaceBackend.BackendConfig.WebSocket.ReadBufferSize,
		WriteBufferSize: core.ArtPeaceBackend.BackendConfig.WebSocket.WriteBufferSize,
	}
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}

	core.ArtPeaceBackend.WSConnectionsLock.Lock()
	core.ArtPeaceBackend.WSConnections = append(core.ArtPeaceBackend.WSConnections, ws)
	core.ArtPeaceBackend.WSConnectionsLock.Unlock()
	wsReader(ws)
}
