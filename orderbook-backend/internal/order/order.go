package order

type Side string

const (
	SideBid Side = "bid"
	SideAsk Side = "ask"
)

type OrderType string

const (
	OrderTypeLimit  OrderType = "limit"
	OrderTypeMarket OrderType = "market"
)

type OrderStatus string

const (
	OrderStatusNew       OrderStatus = "new"
	OrderStatusPartial   OrderStatus = "partial"
	OrderStatusFilled    OrderStatus = "filled"
	OrderStatusCancelled OrderStatus = "cancelled"
)

type Order struct {
	ID        string
	MarketID  string
	Side      Side
	Type      OrderType
	Price     int64
	Quantity  int64
	Filled    int64
	Sequence  uint64
	Status    OrderStatus
	ClientID  string
}

type Trade struct {
	TakerOrderID string
	MakerOrderID string
	Price        int64
	Quantity     int64
	Timestamp    int64
}

func NewOrder(id, marketID string, side Side, orderType OrderType, price, quantity int64, clientID string, seq uint64) *Order {
	return &Order{
		ID:        id,
		MarketID:  marketID,
		Side:      side,
		Type:      orderType,
		Price:     price,
		Quantity:  quantity,
		Filled:    0,
		Sequence:  seq,
		Status:    OrderStatusNew,
		ClientID:  clientID,
	}
}

func (o *Order) Remaining() int64 {
	return o.Quantity - o.Filled
}

func (o *Order) IsFilled() bool {
	return o.Status == OrderStatusFilled
}

func (o *Order) IsCancelled() bool {
	return o.Status == OrderStatusCancelled
}