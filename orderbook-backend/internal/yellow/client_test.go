package yellow

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

func TestValidateJWT_ValidToken(t *testing.T) {
	c := NewClient()

	token := createTestJWT(t, "test-address", "test-session-key", time.Hour)
	result := c.ValidateJWT(token, "test-session-key")

	assert.True(t, result, "valid JWT should pass validation")
}

func TestValidateJWT_ExpiredToken(t *testing.T) {
	c := NewClient()

	token := createTestJWT(t, "test-address", "test-session-key", -time.Hour)
	result := c.ValidateJWT(token, "test-session-key")

	assert.False(t, result, "expired JWT should fail validation")
}

func TestValidateJWT_WrongSessionKey(t *testing.T) {
	c := NewClient()

	token := createTestJWT(t, "test-address", "correct-session-key", time.Hour)
	result := c.ValidateJWT(token, "wrong-session-key")

	assert.False(t, result, "wrong session key should fail validation")
}

func TestCreateSession_ReturnsSession(t *testing.T) {
	c := NewClient()

	session := c.CreateSession("0x1234567890abcdef", "test-session-key")

	assert.NotNil(t, session, "session should not be nil")
	assert.Equal(t, "0x1234567890abcdef", session.Address, "address should match")
	assert.Equal(t, "test-session-key", session.SessionKey, "session key should match")
	assert.Equal(t, uint64(0), session.Version, "version should start at 0")
}

func createTestJWT(t *testing.T, address, sessionKey string, duration time.Duration) string {
	secret := "test-secret-key-for-development-only"
	claims := jwt.MapClaims{
		"iss":         "yellow-clearnode",
		"aud":         "orderbook-backend",
		"sub":         address,
		"session_key": sessionKey,
		"exp":         time.Now().Add(duration).Unix(),
		"iat":         time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		t.Fatalf("failed to sign token: %v", err)
	}
	return tokenString
}