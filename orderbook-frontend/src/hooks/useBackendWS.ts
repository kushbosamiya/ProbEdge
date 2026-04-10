import { useRef, useEffect, useState, useCallback } from 'react'
import { useSessionStore } from '../store/sessionStore'

interface WSMessage {
  type: string
  payload?: unknown
}

export function useBackendWS(url?: string) {
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  
  const jwt = useSessionStore((state) => state.jwt)
  const wsUrl = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws'

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setConnected(true)
      reconnectAttempts.current = 0
      
      if (jwt) {
        ws.send(JSON.stringify({
          type: 'yellow_auth',
          payload: { jwt_token: jwt }
        }))
      }
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setLastMessage(data)
      } catch {
        console.error('Failed to parse WS message')
      }
    }

    ws.onclose = () => {
      setConnected(false)
      wsRef.current = null
      
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
      reconnectAttempts.current++
      
      reconnectTimeoutRef.current = setTimeout(connect, delay)
    }

    ws.onerror = () => {
      ws.close()
    }

    wsRef.current = ws
  }, [wsUrl, jwt])

  const send = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      wsRef.current?.close()
    }
  }, [connect])

  return {
    connected,
    send,
    lastMessage,
    reconnect: connect,
  }
}