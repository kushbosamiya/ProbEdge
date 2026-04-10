package ws

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/kushbosamiya/orderbooktrade-yellow/internal/engine"
	"github.com/kushbosamiya/orderbooktrade-yellow/internal/yellow"
)

type Message struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type Conn struct {
	ID      string
	Address string

	mu   sync.Mutex
	sent []Message
}

func (c *Conn) Send(msg Message) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.sent = append(c.sent, msg)
}

type YellowClient interface {
	ValidateJWT(token, sessionKey string) bool
	CreateSession(address, sessionKey string) *yellow.Session
}

type Hub struct {
	rooms map[string]map[string]bool
	mu    sync.RWMutex

	yellowClient YellowClient
	sessions     map[*Conn]*yellow.Session

	engine *engine.Engine
}

func NewHub() *Hub {
	return &Hub{
		rooms:        make(map[string]map[string]bool),
		yellowClient: yellow.NewClient(),
		sessions:     make(map[*Conn]*yellow.Session),
		engine:       engine.NewEngine(),
	}
}

func (h *Hub) JoinRoom(roomID, clientID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.rooms[roomID] == nil {
		h.rooms[roomID] = make(map[string]bool)
	}
	h.rooms[roomID][clientID] = true
}

func (h *Hub) LeaveRoom(roomID, clientID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.rooms[roomID] != nil {
		delete(h.rooms[roomID], clientID)
		if len(h.rooms[roomID]) == 0 {
			delete(h.rooms, roomID)
		}
	}
}

func (h *Hub) IsInRoom(roomID, clientID string) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if clients, ok := h.rooms[roomID]; ok {
		return clients[clientID]
	}
	return false
}

func (h *Hub) BroadcastToRoom(roomID string, msg Message) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if clients, ok := h.rooms[roomID]; ok {
		data, _ := json.Marshal(msg)
		for clientID := range clients {
			_ = clientID
			_ = data
		}
	}
}

func (h *Hub) RoomClientCount(roomID string) int {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if clients, ok := h.rooms[roomID]; ok {
		return len(clients)
	}
	return 0
}

func (h *Hub) HandleMessage(conn *Conn, msg Message) {
	switch msg.Type {
	case "yellow_auth":
		h.handleYellowAuth(conn, msg)
	case "place_order":
		h.handlePlaceOrder(conn, msg)
	case "cancel_order":
		log.Printf("cancel_order received from %s - Chunk 4 pending", conn.ID)
	case "subscribe":
		log.Printf("subscribe received from %s - Chunk 4 pending", conn.ID)
	default:
		log.Printf("unknown message type: %s from %s", msg.Type, conn.ID)
	}
}

func (h *Hub) handleYellowAuth(conn *Conn, msg Message) {
	payload, _ := msg.Payload.(map[string]any)
	token, _ := payload["jwt_token"].(string)
	sessionKey, _ := payload["session_key"].(string)

	if h.yellowClient != nil && h.yellowClient.ValidateJWT(token, sessionKey) {
		session := h.yellowClient.CreateSession(conn.Address, sessionKey)
		h.sessions[conn] = session
		conn.Send(Message{
			Type:    "yellow_auth_success",
			Payload: map[string]any{"session_id": session.ID},
		})
		return
	}

	conn.Send(Message{
		Type:    "yellow_auth_error",
		Payload: map[string]any{"reason": "invalid token"},
	})
}

func (h *Hub) handlePlaceOrder(conn *Conn, msg Message) {
	payload, _ := msg.Payload.(map[string]any)
	marketID, _ := payload["market_id"].(string)
	orderID, _ := payload["order_id"].(string)
	sideStr, _ := payload["side"].(string)

	price, ok := toInt64(payload["price"])
	if !ok {
		log.Printf("place_order invalid price from %s", conn.ID)
		return
	}
	qty, ok := toInt64(payload["quantity"])
	if !ok {
		log.Printf("place_order invalid quantity from %s", conn.ID)
		return
	}

	var side engine.Side
	switch sideStr {
	case "bid":
		side = engine.Bid
	case "ask":
		side = engine.Ask
	default:
		log.Printf("place_order invalid side from %s", conn.ID)
		return
	}

	trades, err := h.engine.PlaceLimitOrder(orderID, side, price, qty)
	if err != nil {
		log.Printf("place_order engine error from %s: %v", conn.ID, err)
		return
	}

	if len(trades) > 0 {
		if session := h.sessions[conn]; session != nil {
			ctx := context.Background()
			_ = session.UpdateState(ctx, marketID, toYellowTrades(trades, marketID))
		}
	}
}

func toYellowTrades(engineTrades []engine.Trade, marketID string) []yellow.Trade {
	out := make([]yellow.Trade, 0, len(engineTrades))
	now := time.Now().Unix()
	for _, t := range engineTrades {
		out = append(out, yellow.Trade{
			MakerID:   t.MakerOrderID,
			TakerID:   t.TakerOrderID,
			Price:     t.Price,
			Quantity:  t.Quantity,
			MarketID:  marketID,
			Timestamp: now,
		})
	}
	return out
}

func toInt64(v any) (int64, bool) {
	switch n := v.(type) {
	case int:
		return int64(n), true
	case int64:
		return n, true
	case float64:
		return int64(n), true
	case float32:
		return int64(n), true
	default:
		return 0, false
	}
}
