package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHealthHandler_Returns200(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()

	HealthHandler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}
	if w.Body.String() != "OK\n" {
		t.Errorf("expected 'OK\\n', got '%s'", w.Body.String())
	}
}

func TestMarketsHandler_ReturnsMarketList(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/markets", nil)
	w := httptest.NewRecorder()

	MarketsHandler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var response map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("failed to parse JSON: %v", err)
	}
	if _, ok := response["markets"]; !ok {
		t.Error("expected 'markets' key in response")
	}
}

func TestCreateMarketHandler_ValidRequest(t *testing.T) {
	body := `{"name":"ETH-USD","base":"ETH","quote":"USD"}`
	req := httptest.NewRequest(http.MethodPost, "/market", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	CreateMarketHandler(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("expected status 201, got %d", w.Code)
	}
}

func TestCreateMarketHandler_InvalidJSON(t *testing.T) {
	body := `invalid json`
	req := httptest.NewRequest(http.MethodPost, "/market", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	CreateMarketHandler(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", w.Code)
	}
}