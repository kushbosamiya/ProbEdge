package yellow

// Trade represents a matched trade for state channel update
type Trade struct {
	MakerID   string
	TakerID   string
	Price     int64
	Quantity  int64
	MarketID  string
	Timestamp int64
}

