package yellow

import (
	"context"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Client struct {
	secretKey []byte
}

func NewClient() *Client {
	secret := os.Getenv("JWT_PUBLIC_KEY")
	if secret == "" {
		secret = "test-secret-key-for-development-only"
	}
	return &Client{secretKey: []byte(secret)}
}

func (c *Client) ValidateJWT(token, sessionKey string) bool {
	keyFunc := func(token *jwt.Token) (interface{}, error) {
		return c.secretKey, nil
	}

	tokenParsed, err := jwt.Parse(token, keyFunc,
		jwt.WithIssuer("yellow-clearnode"),
		jwt.WithAudience("orderbook-backend"),
	)

	if err != nil || !tokenParsed.Valid {
		return false
	}

	claims, ok := tokenParsed.Claims.(jwt.MapClaims)
	if !ok {
		return false
	}

	claimSessionKey, ok := claims["session_key"].(string)
	if !ok || claimSessionKey != sessionKey {
		return false
	}

	return true
}

func (c *Client) CreateSession(address, sessionKey string) *Session {
	return &Session{
		ID:         uuid.New().String(),
		Address:    address,
		SessionKey: sessionKey,
		Version:    0,
	}
}

func (c *Client) Connect(ctx context.Context, wsURL string) error {
	return nil
}

var _ = time.Now
