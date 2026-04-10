package api

import (
	"encoding/json"
	"net/http"
	"sync"
)

type Market struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Base  string `json:"base"`
	Quote string `json:"quote"`
}

type MarketsResponse struct {
	Markets []Market `json:"markets"`
}

var (
	marketsMu sync.RWMutex
	markets   = map[string]Market{
		"BTC-USD": {ID: "BTC-USD", Name: "BTC-USD", Base: "BTC", Quote: "USD"},
	}
)

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK\n"))
}

func MarketsHandler(w http.ResponseWriter, r *http.Request) {
	marketsMu.RLock()
	defer marketsMu.RUnlock()

	list := make([]Market, 0, len(markets))
	for _, m := range markets {
		list = append(list, m)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(MarketsResponse{Markets: list})
}

type CreateMarketRequest struct {
	Name        string `json:"name"`
	Base        string `json:"base"`
	Quote       string `json:"quote"`
	Description string `json:"description"`
	Expiry      string `json:"expiry"`
}

type CreateMarketResponse struct {
	Market Market `json:"market"`
}

func CreateMarketHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	var req CreateMarketRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid JSON"})
		return
	}

	if req.Name == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "missing required fields"})
		return
	}

	base := req.Base
	quote := req.Quote
	if base == "" || quote == "" {
		// Accept "BTC/USDC" or "BTC-USDC" and infer base/quote.
		if b, q, ok := splitPair(req.Name); ok {
			base, quote = b, q
		}
	}
	if base == "" || quote == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "missing required fields"})
		return
	}

	marketsMu.Lock()
	defer marketsMu.Unlock()

	id := req.Name
	if b, q, ok := splitPair(req.Name); ok {
		// Make the market ID URL-safe for routing: "BTC/USDC" -> "BTC-USDC".
		id = b + "-" + q
	}

	if _, exists := markets[id]; exists {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "market already exists"})
		return
	}

	m := Market{
		ID:    id,
		Name:  req.Name,
		Base:  base,
		Quote: quote,
	}
	markets[id] = m

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(CreateMarketResponse{Market: m})
}

func MarketByIDHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	// Path shape: /markets/{id}
	const prefix = "/markets/"
	if len(r.URL.Path) <= len(prefix) {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	id := r.URL.Path[len(prefix):]
	if id == "" {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	marketsMu.RLock()
	m, ok := markets[id]
	marketsMu.RUnlock()
	if !ok {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "not found"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(m)
}

func splitPair(name string) (string, string, bool) {
	for _, sep := range []string{"/", "-"} {
		for i := 0; i < len(name); i++ {
			if name[i:i+1] == sep {
				base := name[:i]
				quote := name[i+1:]
				if base != "" && quote != "" {
					return base, quote, true
				}
				return "", "", false
			}
		}
	}
	return "", "", false
}
