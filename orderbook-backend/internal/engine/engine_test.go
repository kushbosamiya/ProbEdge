package engine

import "testing"

func TestFIFOPriceTimeWithinPriceLevel(t *testing.T) {
	e := NewEngine()

	if _, err := e.PlaceLimitOrder("ask1", Ask, 100, 5); err != nil {
		t.Fatalf("place ask1: %v", err)
	}
	if _, err := e.PlaceLimitOrder("ask2", Ask, 100, 5); err != nil {
		t.Fatalf("place ask2: %v", err)
	}

	trades, remaining, err := e.PlaceMarketOrder("bidMkt", Bid, 6)
	if err != nil {
		t.Fatalf("market bid: %v", err)
	}
	if remaining != 0 {
		t.Fatalf("remaining = %d, want 0", remaining)
	}
	if len(trades) != 2 {
		t.Fatalf("trades len = %d, want 2", len(trades))
	}
	if trades[0].MakerOrderID != "ask1" || trades[0].TakerOrderID != "bidMkt" || trades[0].Price != 100 || trades[0].Quantity != 5 {
		t.Fatalf("trade[0] = %+v, want maker=ask1 taker=bidMkt price=100 qty=5", trades[0])
	}
	if trades[1].MakerOrderID != "ask2" || trades[1].TakerOrderID != "bidMkt" || trades[1].Price != 100 || trades[1].Quantity != 1 {
		t.Fatalf("trade[1] = %+v, want maker=ask2 taker=bidMkt price=100 qty=1", trades[1])
	}
}

func TestPricePriorityBeatsTime(t *testing.T) {
	e := NewEngine()

	if _, err := e.PlaceLimitOrder("ask100", Ask, 100, 1); err != nil {
		t.Fatalf("place ask100: %v", err)
	}
	if _, err := e.PlaceLimitOrder("ask99", Ask, 99, 1); err != nil {
		t.Fatalf("place ask99: %v", err)
	}

	trades, err := e.PlaceLimitOrder("bid1", Bid, 100, 1)
	if err != nil {
		t.Fatalf("place bid1: %v", err)
	}
	if len(trades) != 1 {
		t.Fatalf("trades len = %d, want 1", len(trades))
	}
	if trades[0].MakerOrderID != "ask99" || trades[0].TakerOrderID != "bid1" || trades[0].Price != 99 || trades[0].Quantity != 1 {
		t.Fatalf("trade = %+v, want maker=ask99 taker=bid1 price=99 qty=1", trades[0])
	}
}

func TestCancelRemovesFromBook(t *testing.T) {
	e := NewEngine()

	if _, err := e.PlaceLimitOrder("ask1", Ask, 100, 1); err != nil {
		t.Fatalf("place ask1: %v", err)
	}
	if err := e.CancelOrder("ask1"); err != nil {
		t.Fatalf("cancel ask1: %v", err)
	}

	trades, remaining, err := e.PlaceMarketOrder("bidMkt", Bid, 1)
	if err != nil {
		t.Fatalf("market bid: %v", err)
	}
	if len(trades) != 0 {
		t.Fatalf("trades len = %d, want 0", len(trades))
	}
	if remaining != 1 {
		t.Fatalf("remaining = %d, want 1", remaining)
	}
}

func TestAmendRepriceCanCrossAndMatch(t *testing.T) {
	e := NewEngine()

	if _, err := e.PlaceLimitOrder("ask1", Ask, 105, 1); err != nil {
		t.Fatalf("place ask1: %v", err)
	}
	if trades, err := e.PlaceLimitOrder("bid1", Bid, 100, 1); err != nil {
		t.Fatalf("place bid1: %v", err)
	} else if len(trades) != 0 {
		t.Fatalf("unexpected trades: %+v", trades)
	}

	trades, err := e.AmendOrder("ask1", 100, 1)
	if err != nil {
		t.Fatalf("amend ask1: %v", err)
	}
	if len(trades) != 1 {
		t.Fatalf("trades len = %d, want 1", len(trades))
	}
	if trades[0].MakerOrderID != "bid1" || trades[0].TakerOrderID != "ask1" || trades[0].Price != 100 || trades[0].Quantity != 1 {
		t.Fatalf("trade = %+v, want maker=bid1 taker=ask1 price=100 qty=1", trades[0])
	}
}
