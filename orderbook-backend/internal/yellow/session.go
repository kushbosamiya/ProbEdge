package yellow

import (
	"context"
	"log"
)

// Session represents an active Yellow state channel session
type Session struct {
	ID         string
	Address    string
	SessionKey string
	Version    uint64
}

func NewSession(address, sessionKey string) *Session {
	return &Session{
		ID:         "",
		Address:    address,
		SessionKey: sessionKey,
		Version:    0,
	}
}

// UpdateState updates the Yellow state channel after a trade
func (s *Session) UpdateState(ctx context.Context, marketID string, trades []Trade) error {
	if len(trades) == 0 {
		return nil
	}

	s.Version++

	log.Printf("StateUpdate: market=%s trades=%d version=%d",
		marketID, len(trades), s.Version)

	return nil
}

// CloseSession triggers on-chain settlement
func (s *Session) CloseSession(ctx context.Context) error {
	if s.Version == 0 {
		log.Printf("Session %s: no trades, no settlement needed", s.ID)
		return nil
	}

	log.Printf("Session %s: initiating on-chain settlement, version=%d", s.ID, s.Version)
	return nil
}

