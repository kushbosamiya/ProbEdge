'use client'

import { useWallet } from '../hooks/useWallet'
import { useYellowSession } from '../hooks/useYellowSession'

export function YellowAuthButton() {
  const { address: walletAddress, isConnected: walletConnected, connect: connectWallet, disconnect: disconnectWallet } = useWallet()
  const { status: yellowStatus, connect: connectYellow, disconnect: disconnectYellow, connecting } = useYellowSession()

  const isWalletConnected = walletConnected && !!walletAddress
  const isYellowConnected = yellowStatus === 'connected'
  const isConnecting = yellowStatus === 'connecting' || connecting

  const handleWalletClick = async () => {
    if (!isWalletConnected) {
      await connectWallet()
    } else {
      disconnectWallet()
      disconnectYellow()
    }
  }

  const handleYellowClick = async () => {
    if (isYellowConnected) {
      disconnectYellow()
    } else if (!isConnecting && isWalletConnected) {
      try {
        await connectYellow()
      } catch (error) {
        console.error('Failed to connect to Yellow:', error)
      }
    }
  }

  const getButtonText = () => {
    if (!isWalletConnected) return 'Connect Wallet'
    if (isConnecting) return 'Connecting...'
    if (isYellowConnected) return 'Disconnect Yellow'
    return 'Connect Yellow'
  }

  const getButtonClass = () => {
    const base = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50'
    
    if (!isWalletConnected) {
      return `${base} bg-blue-600 hover:bg-blue-700 text-white`
    }
    
    if (isYellowConnected) {
      return `${base} bg-green-600 hover:bg-green-700 text-white`
    }
    
    if (isConnecting) {
      return `${base} bg-yellow-600 hover:bg-yellow-700 text-white`
    }
    
    return `${base} bg-purple-600 hover:bg-purple-700 text-white`
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleWalletClick}
        className={getButtonClass()}
        disabled={isConnecting}
      >
        {getButtonText()}
      </button>

      {isYellowConnected && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-300">
            {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </span>
        </div>
      )}
    </div>
  )
}