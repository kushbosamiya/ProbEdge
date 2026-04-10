export type SessionStatus = 'disconnected' | 'connecting' | 'connected'

export interface YellowSession {
  jwt: string | null
  sessionKey: string | null
  address: string | null
  status: SessionStatus
}

export interface SessionStore extends YellowSession {
  setJWT: (jwt: string) => void
  setSessionKey: (key: string) => void
  setAddress: (address: string) => void
  setStatus: (status: SessionStatus) => void
  clear: () => void
}