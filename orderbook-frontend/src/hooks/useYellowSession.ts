import { useState, useCallback, useRef, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useSessionStore } from '../store/sessionStore'
import { useBackendWS } from './useBackendWS'

function generateRandomHex(length: number): string {
  const arr = new Uint8Array(length)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

interface YellowMessage {
  type: string
  payload?: unknown
}

export function useYellowSession() {
  const { address } = useAccount()
  const [connecting, setConnecting] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const resolveRef = useRef<((value: string) => void) | null>(null)
  const rejectRef = useRef<((err: Error) => void) | null>(null)
  
  const { jwt, sessionKey, status, setJWT, setSessionKey, setStatus, clear } = useSessionStore()
  const backendWS = useBackendWS()
  
  const yellowWSUrl = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_YELLOW_WS || 'wss://clearnode.yellow.org/ws')
    : ''

  const generateSessionKey = useCallback(() => {
    const key = generateRandomHex(32)
    setSessionKey(key)
    return key
  }, [setSessionKey])

  const connect = useCallback(async () => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    setConnecting(true)
    setStatus('connecting')

    try {
      const key = generateSessionKey()
      
      const ws = new WebSocket(yellowWSUrl)
      wsRef.current = ws

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          ws.close()
          reject(new Error('Connection timeout'))
        }, 10000)

        ws.onopen = () => {
          clearTimeout(timeout)
          
          ws.send(JSON.stringify({
            type: 'auth_request',
            payload: {
              address,
              session_key: key,
              allowances: [],
              expires_at: Math.floor(Date.now() / 1000) + 3600
            }
          }))
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as YellowMessage
            
            if (data.type === 'auth_challenge') {
              const challenge = (data.payload as { challenge_message: string }).challenge_message
              
              // For now, simulate receiving the JWT (real impl would EIP-712 sign)
              // TODO: Implement actual EIP-712 signing with wallet
              setTimeout(() => {
                const mockJWT = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: address, session_key: key }))}.mock`
                setJWT(mockJWT)
                setStatus('connected')
                
                // Connect to backend
                backendWS.reconnect()
                
                resolve()
              }, 100)
            } else if (data.type === 'auth_error') {
              const err = (data.payload as { reason: string }).reason
              ws.close()
              reject(new Error(err))
            }
          } catch {
            reject(new Error('Invalid message format'))
          }
        }

        ws.onerror = () => {
          clearTimeout(timeout)
          reject(new Error('WebSocket error'))
        }

        ws.onclose = () => {
          clearTimeout(timeout)
          if (status !== 'connected') {
            reject(new Error('Connection closed'))
          }
        }
      })

    } catch (error) {
      setStatus('disconnected')
      throw error
    } finally {
      setConnecting(false)
    }
  }, [address, generateSessionKey, setJWT, setSessionKey, setStatus, yellowWSUrl, backendWS, status])

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    clear()
    setStatus('disconnected')
  }, [clear, setStatus])

  return {
    address,
    jwt,
    sessionKey,
    status: status as 'disconnected' | 'connecting' | 'connected',
    connecting,
    connect,
    disconnect,
    backendWS,
  }
}