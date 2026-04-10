package ws

import (
	"encoding/json"
	"testing"

	"github.com/kushbosamiya/orderbooktrade-yellow/internal/yellow"
)

func TestHub_RoomManagement(t *testing.T) {
	h := NewHub()
	roomID := "BTC-USD"

	h.JoinRoom(roomID, "client1")
	h.JoinRoom(roomID, "client2")

	if !h.IsInRoom(roomID, "client1") {
		t.Error("client1 should be in room")
	}
	if !h.IsInRoom(roomID, "client2") {
		t.Error("client2 should be in room")
	}

	h.LeaveRoom(roomID, "client1")
	if h.IsInRoom(roomID, "client1") {
		t.Error("client1 should have left room")
	}
}

func TestHub_BroadcastToRoom(t *testing.T) {
	h := NewHub()
	roomID := "BTC-USD"

	h.JoinRoom(roomID, "client1")
	h.JoinRoom(roomID, "client2")

	msg := Message{Type: "orderbook", Payload: map[string]interface{}{"bids": []int{100, 101}}}
	h.BroadcastToRoom(roomID, msg)
}

func TestMessage_JSONSerialization(t *testing.T) {
	msg := Message{
		Type:    "place_order",
		Payload: map[string]interface{}{"market": "BTC-USD", "side": "bid"},
	}

	data, err := json.Marshal(msg)
	if err != nil {
		t.Fatalf("failed to marshal: %v", err)
	}

	var decoded Message
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("failed to unmarshal: %v", err)
	}

	if decoded.Type != msg.Type {
		t.Errorf("expected type %s, got %s", msg.Type, decoded.Type)
	}
}

type mockYellowClient struct {
	validate func(token, sessionKey string) bool
	create   func(address, sessionKey string) *yellow.Session
}

func (m mockYellowClient) ValidateJWT(token, sessionKey string) bool {
	return m.validate(token, sessionKey)
}

func (m mockYellowClient) CreateSession(address, sessionKey string) *yellow.Session {
	return m.create(address, sessionKey)
}

func TestYellowAuth_ValidToken_SendsSuccess(t *testing.T) {
	h := NewHub()
	h.yellowClient = mockYellowClient{
		validate: func(token, sessionKey string) bool { return true },
		create: func(address, sessionKey string) *yellow.Session {
			return &yellow.Session{ID: "sess-1", Address: address}
		},
	}

	conn := &Conn{ID: "c1", Address: "0xabc"}
	h.HandleMessage(conn, Message{
		Type: "yellow_auth",
		Payload: map[string]any{
			"jwt_token":   "jwt",
			"session_key": "sk",
		},
	})

	if got := len(conn.sent); got != 1 {
		t.Fatalf("sent messages = %d, want 1", got)
	}
	if conn.sent[0].Type != "yellow_auth_success" {
		t.Fatalf("msg type = %q, want %q", conn.sent[0].Type, "yellow_auth_success")
	}

	payload, _ := conn.sent[0].Payload.(map[string]any)
	if payload == nil || payload["session_id"] != "sess-1" {
		t.Fatalf("payload = %+v, want session_id=sess-1", conn.sent[0].Payload)
	}

	if h.sessions[conn] == nil || h.sessions[conn].ID != "sess-1" {
		t.Fatalf("session stored = %+v, want sess-1", h.sessions[conn])
	}
}

func TestYellowAuth_InvalidToken_SendsError(t *testing.T) {
	h := NewHub()
	h.yellowClient = mockYellowClient{
		validate: func(token, sessionKey string) bool { return false },
		create: func(address, sessionKey string) *yellow.Session {
			t.Fatalf("CreateSession should not be called")
			return nil
		},
	}

	conn := &Conn{ID: "c1", Address: "0xabc"}
	h.HandleMessage(conn, Message{
		Type: "yellow_auth",
		Payload: map[string]any{
			"jwt_token":   "jwt",
			"session_key": "sk",
		},
	})

	if got := len(conn.sent); got != 1 {
		t.Fatalf("sent messages = %d, want 1", got)
	}
	if conn.sent[0].Type != "yellow_auth_error" {
		t.Fatalf("msg type = %q, want %q", conn.sent[0].Type, "yellow_auth_error")
	}
	if h.sessions[conn] != nil {
		t.Fatalf("session stored = %+v, want nil", h.sessions[conn])
	}
}

func TestPlaceOrder_WiresTradesToUpdateState(t *testing.T) {
	h := NewHub()
	conn := &Conn{ID: "c1", Address: "0xabc"}
	h.sessions[conn] = &yellow.Session{ID: "sess-1", Address: "0xabc"}

	h.HandleMessage(conn, Message{
		Type: "place_order",
		Payload: map[string]any{
			"market_id": "BTC-USD",
			"order_id":  "ask-1",
			"side":      "ask",
			"price":     100,
			"quantity":  1,
		},
	})
	if h.sessions[conn].Version != 0 {
		t.Fatalf("version after first order = %d, want 0", h.sessions[conn].Version)
	}

	h.HandleMessage(conn, Message{
		Type: "place_order",
		Payload: map[string]any{
			"market_id": "BTC-USD",
			"order_id":  "bid-1",
			"side":      "bid",
			"price":     100,
			"quantity":  1,
		},
	})

	if h.sessions[conn].Version != 1 {
		t.Fatalf("version after match = %d, want 1", h.sessions[conn].Version)
	}
}

func TestPlaceOrder_NoUpdateWhenNoMatch(t *testing.T) {
	h := NewHub()
	conn := &Conn{ID: "c1", Address: "0xabc"}
	h.sessions[conn] = &yellow.Session{ID: "sess-1", Address: "0xabc"}

	h.HandleMessage(conn, Message{
		Type: "place_order",
		Payload: map[string]any{
			"market_id": "BTC-USD",
			"order_id":  "ask-1",
			"side":      "ask",
			"price":     100,
			"quantity":  1,
		},
	})

	if h.sessions[conn].Version != 0 {
		t.Fatalf("version = %d, want 0", h.sessions[conn].Version)
	}
}
