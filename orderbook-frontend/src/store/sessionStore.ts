import { create } from 'zustand'
import type { SessionStore } from '../types/session'

export const useSessionStore = create<SessionStore>((set) => ({
  jwt: null,
  sessionKey: null,
  address: null,
  status: 'disconnected',
  
  setJWT: (jwt) => set({ jwt }),
  setSessionKey: (sessionKey) => set({ sessionKey }),
  setAddress: (address) => set({ address }),
  setStatus: (status) => set({ status }),
  
  clear: () => set({ 
    jwt: null, 
    sessionKey: null, 
    address: null, 
    status: 'disconnected' 
  }),
}))