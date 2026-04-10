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
	Name  string `json:"name"`
	Base  string `json:"base"`
	Quote string `json:"quote"`
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

	if req.Name == "" || req.Base == "" || req.Quote == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "missing required fields"})
		return
	}

	marketsMu.Lock()
	defer marketsMu.Unlock()

	if _, exists := markets[req.Name]; exists {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "market already exists"})
		return
	}

	m := Market{
		ID:    req.Name,
		Name:  req.Name,
		Base:  req.Base,
		Quote: req.Quote,
	}
	markets[req.Name] = m

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(CreateMarketResponse{Market: m})
}