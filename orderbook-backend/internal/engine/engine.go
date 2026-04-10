package engine

import (
	"container/heap"
	"container/list"
	"errors"
)

var (
	ErrInvalidOrder  = errors.New("invalid order")
	ErrDuplicateID   = errors.New("duplicate order id")
	ErrOrderNotFound = errors.New("order not found")
)

type Side int

const (
	Bid Side = iota
	Ask
)

type Order struct {
	ID       string
	Side     Side
	Price    int64
	Quantity int64
	seq      uint64
}

type Trade struct {
	MakerOrderID string
	TakerOrderID string
	Price        int64
	Quantity     int64
}

type Engine struct {
	bids   *book
	asks   *book
	orders map[string]*orderRef
	seq    uint64
}

func NewEngine() *Engine {
	b := newBook(Bid)
	a := newBook(Ask)
	return &Engine{
		bids:   b,
		asks:   a,
		orders: make(map[string]*orderRef),
	}
}

func (e *Engine) PlaceLimitOrder(id string, side Side, price, quantity int64) ([]Trade, error) {
	if id == "" || price <= 0 || quantity <= 0 {
		return nil, ErrInvalidOrder
	}
	if _, exists := e.orders[id]; exists {
		return nil, ErrDuplicateID
	}

	o := &Order{ID: id, Side: side, Price: price, Quantity: quantity, seq: e.nextSeq()}
	trades := e.matchLimit(o)
	if o.Quantity > 0 {
		e.addToBook(o)
	}
	return trades, nil
}

func (e *Engine) PlaceMarketOrder(id string, side Side, quantity int64) ([]Trade, int64, error) {
	if id == "" || quantity <= 0 {
		return nil, 0, ErrInvalidOrder
	}
	if _, exists := e.orders[id]; exists {
		return nil, 0, ErrDuplicateID
	}

	o := &Order{ID: id, Side: side, Price: 0, Quantity: quantity, seq: e.nextSeq()}
	trades := e.matchMarket(o)
	return trades, o.Quantity, nil
}

func (e *Engine) CancelOrder(id string) error {
	ref, ok := e.orders[id]
	if !ok {
		return ErrOrderNotFound
	}

	b := e.bookForSide(ref.side)
	lvl := b.levels[ref.price]
	if lvl != nil && ref.elem != nil {
		lvl.Remove(ref.elem)
		if lvl.Len() == 0 {
			delete(b.levels, ref.price)
		}
	}
	delete(e.orders, id)
	return nil
}

func (e *Engine) AmendOrder(id string, newPrice, newQuantity int64) ([]Trade, error) {
	if id == "" || newPrice <= 0 || newQuantity <= 0 {
		return nil, ErrInvalidOrder
	}

	ref, ok := e.orders[id]
	if !ok {
		return nil, ErrOrderNotFound
	}

	side := ref.side
	_ = e.CancelOrder(id)
	return e.PlaceLimitOrder(id, side, newPrice, newQuantity)
}

func (e *Engine) nextSeq() uint64 {
	e.seq++
	return e.seq
}

func (e *Engine) bookForSide(side Side) *book {
	if side == Bid {
		return e.bids
	}
	return e.asks
}

func (e *Engine) oppositeBook(side Side) *book {
	if side == Bid {
		return e.asks
	}
	return e.bids
}

func (e *Engine) addToBook(o *Order) {
	b := e.bookForSide(o.Side)
	lvl := b.levels[o.Price]
	if lvl == nil {
		lvl = list.New()
		b.levels[o.Price] = lvl
		heap.Push(&b.prices, o.Price)
	}

	elem := lvl.PushBack(o)
	e.orders[o.ID] = &orderRef{side: o.Side, price: o.Price, elem: elem}
}

func (e *Engine) matchMarket(incoming *Order) []Trade {
	return e.match(incoming, func(_ int64) bool { return true })
}

func (e *Engine) matchLimit(incoming *Order) []Trade {
	if incoming.Side == Bid {
		return e.match(incoming, func(bestAsk int64) bool { return bestAsk <= incoming.Price })
	}
	return e.match(incoming, func(bestBid int64) bool { return bestBid >= incoming.Price })
}

func (e *Engine) match(incoming *Order, crosses func(bestOppPrice int64) bool) []Trade {
	var trades []Trade
	opp := e.oppositeBook(incoming.Side)

	for incoming.Quantity > 0 {
		bestPrice, ok := opp.bestPrice()
		if !ok {
			break
		}
		if !crosses(bestPrice) {
			break
		}

		lvl := opp.levels[bestPrice]
		if lvl == nil || lvl.Len() == 0 {
			opp.cleanupTop()
			continue
		}

		makerElem := lvl.Front()
		maker, _ := makerElem.Value.(*Order)
		if maker == nil {
			lvl.Remove(makerElem)
			continue
		}

		qty := minInt64(incoming.Quantity, maker.Quantity)
		trades = append(trades, Trade{
			MakerOrderID: maker.ID,
			TakerOrderID: incoming.ID,
			Price:        maker.Price,
			Quantity:     qty,
		})

		incoming.Quantity -= qty
		maker.Quantity -= qty

		if maker.Quantity == 0 {
			lvl.Remove(makerElem)
			delete(e.orders, maker.ID)
			if lvl.Len() == 0 {
				delete(opp.levels, bestPrice)
			}
		}
	}

	return trades
}

func minInt64(a, b int64) int64 {
	if a < b {
		return a
	}
	return b
}

type orderRef struct {
	side  Side
	price int64
	elem  *list.Element
}

type book struct {
	side   Side
	levels map[int64]*list.List
	prices priceHeap
}

func newBook(side Side) *book {
	b := &book{
		side:   side,
		levels: make(map[int64]*list.List),
		prices: priceHeap{side: side},
	}
	heap.Init(&b.prices)
	return b
}

func (b *book) bestPrice() (int64, bool) {
	b.cleanupTop()
	if len(b.prices.prices) == 0 {
		return 0, false
	}
	return b.prices.prices[0], true
}

func (b *book) cleanupTop() {
	for len(b.prices.prices) > 0 {
		p := b.prices.prices[0]
		lvl := b.levels[p]
		if lvl != nil && lvl.Len() > 0 {
			return
		}
		heap.Pop(&b.prices)
	}
}

type priceHeap struct {
	side   Side
	prices []int64
}

func (h priceHeap) Len() int { return len(h.prices) }

func (h priceHeap) Less(i, j int) bool {
	if h.side == Bid {
		return h.prices[i] > h.prices[j]
	}
	return h.prices[i] < h.prices[j]
}

func (h priceHeap) Swap(i, j int) { h.prices[i], h.prices[j] = h.prices[j], h.prices[i] }

func (h *priceHeap) Push(x any) {
	h.prices = append(h.prices, x.(int64))
}

func (h *priceHeap) Pop() any {
	old := h.prices
	n := len(old)
	x := old[n-1]
	h.prices = old[:n-1]
	return x
}
