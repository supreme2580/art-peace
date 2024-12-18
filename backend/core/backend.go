package core

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"

	"github.com/keep-starknet-strange/art-peace/backend/config"
)

type Backend struct {
	Databases         *Databases
	WSConnections     []*websocket.Conn
	WSConnectionsLock sync.Mutex

	RoundsConfig  *config.RoundsConfig
	CanvasConfig  *config.CanvasConfig
	BackendConfig *config.BackendConfig

	AdminMode bool

	// Add new fields for managing subscribers
	GeneralSubscribers map[*websocket.Conn]bool
	WorldSubscribers   map[string]map[*websocket.Conn]bool // map[worldID]map[conn]bool
	SubscribersLock    sync.RWMutex
}

var ArtPeaceBackend *Backend

func NewBackend(databases *Databases, roundsConfig *config.RoundsConfig, canvasConfig *config.CanvasConfig, backendConfig *config.BackendConfig, adminMode bool) *Backend {
	return &Backend{
		Databases:     databases,
		RoundsConfig:  roundsConfig,
		CanvasConfig:  canvasConfig,
		BackendConfig: backendConfig,
		AdminMode:     adminMode,
	}
}

func (b *Backend) Start(port int) {
	fmt.Println("Listening on port", port)
	http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	fmt.Println("Port closed")
}

func (b *Backend) GetBackendUrl() string {
	if b.BackendConfig.Production {
		return "https://api.art-peace.net"
	} else {
		return fmt.Sprintf("http://%s:%d", b.BackendConfig.Host, b.BackendConfig.Port)
	}
}

// Add these methods to handle subscribers
func (b *Backend) AddWorldSubscriber(worldID string, conn *websocket.Conn) {
	b.SubscribersLock.Lock()
	defer b.SubscribersLock.Unlock()

	if b.WorldSubscribers == nil {
		b.WorldSubscribers = make(map[string]map[*websocket.Conn]bool)
	}

	if b.WorldSubscribers[worldID] == nil {
		b.WorldSubscribers[worldID] = make(map[*websocket.Conn]bool)
	}

	b.WorldSubscribers[worldID][conn] = true
}

func (b *Backend) RemoveWorldSubscriber(worldID string, conn *websocket.Conn) {
	b.SubscribersLock.Lock()
	defer b.SubscribersLock.Unlock()

	if b.WorldSubscribers != nil && b.WorldSubscribers[worldID] != nil {
		delete(b.WorldSubscribers[worldID], conn)
		if len(b.WorldSubscribers[worldID]) == 0 {
			delete(b.WorldSubscribers, worldID)
		}
	}
}

func (b *Backend) AddGeneralSubscriber(conn *websocket.Conn) {
	b.SubscribersLock.Lock()
	defer b.SubscribersLock.Unlock()

	if b.GeneralSubscribers == nil {
		b.GeneralSubscribers = make(map[*websocket.Conn]bool)
	}

	b.GeneralSubscribers[conn] = true
}

// Optional: Add a method to remove general subscribers
func (b *Backend) RemoveGeneralSubscriber(conn *websocket.Conn) {
	b.SubscribersLock.Lock()
	defer b.SubscribersLock.Unlock()

	if b.GeneralSubscribers != nil {
		delete(b.GeneralSubscribers, conn)
	}
}

// Add a method to broadcast to world subscribers
func (b *Backend) BroadcastToWorld(worldID string, message []byte) {
	b.SubscribersLock.RLock()
	defer b.SubscribersLock.RUnlock()

	if subscribers, ok := b.WorldSubscribers[worldID]; ok {
		for conn := range subscribers {
			err := conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				// Handle error or remove subscriber
				b.RemoveWorldSubscriber(worldID, conn)
			}
		}
	}
}

// Add a method to broadcast to general subscribers
func (b *Backend) BroadcastToGeneral(message []byte) {
	b.SubscribersLock.RLock()
	defer b.SubscribersLock.RUnlock()

	for conn := range b.GeneralSubscribers {
		err := conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			// Handle error or remove subscriber
			b.RemoveGeneralSubscriber(conn)
		}
	}
}
