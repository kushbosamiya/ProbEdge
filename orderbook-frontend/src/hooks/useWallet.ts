import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useSessionStore } from '../store/sessionStore'

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const clearSession = useSessionStore((state) => state.clear)

  const connectWallet = async () => {
    const connector = connectors[0]
    if (connector) {
      await connect({ connector })
    }
  }

  const disconnectWallet = () => {
    wagmiDisconnect()
    clearSession()
  }

  return {
    address,
    isConnected,
    connect: connectWallet,
    disconnect: disconnectWallet,
  }
}