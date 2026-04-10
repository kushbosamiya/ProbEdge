package yellow

import (
	"context"
	"testing"
)

func TestUpdateState_IncrementsVersion(t *testing.T) {
	s := &Session{
		ID:      "test-session",
		Version: 0,
	}

	trades := []Trade{
		{MakerID: "maker1", TakerID: "taker1", Price: 50000, Quantity: 1, MarketID: "BTC-USD"},
	}

	err := s.UpdateState(context.Background(), "BTC-USD", trades)

	if err != nil {
		t.Fatalf("UpdateState returned error: %v", err)
	}

	if s.Version != 1 {
		t.Errorf("expected version 1, got %d", s.Version)
	}
}

func TestUpdateState_SkipsEmptyTrades(t *testing.T) {
	s := &Session{
		ID:      "test-session",
		Version: 5,
	}

	err := s.UpdateState(context.Background(), "BTC-USD", nil)

	if err != nil {
		t.Fatalf("UpdateState returned error: %v", err)
	}

	if s.Version != 5 {
		t.Errorf("version should not change with empty trades, got %d", s.Version)
	}
}

func TestUpdateState_MultipleTrades(t *testing.T) {
	s := &Session{
		ID:      "test-session",
		Version: 0,
	}

	trades := []Trade{
		{MakerID: "maker1", TakerID: "taker1", Price: 50000, Quantity: 1, MarketID: "BTC-USD"},
		{MakerID: "maker2", TakerID: "taker2", Price: 50001, Quantity: 2, MarketID: "BTC-USD"},
		{MakerID: "maker3", TakerID: "taker3", Price: 50002, Quantity: 3, MarketID: "BTC-USD"},
	}

	err := s.UpdateState(context.Background(), "BTC-USD", trades)

	if err != nil {
		t.Fatalf("UpdateState returned error: %v", err)
	}

	if s.Version != 1 {
		t.Errorf("expected version 1, got %d", s.Version)
	}
}