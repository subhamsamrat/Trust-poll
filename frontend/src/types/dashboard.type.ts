export interface PollItem {
  id: string
  title: string
  status: 'active' | 'scheduled' | 'closed'
  responseMode: 'verified' | 'anonymous'
  totalVotes: number
  createdAt: string
  expiresAt: string
}

export interface ShareModalProps {
  poll: PollItem | null
  isOpen: boolean
  onClose: () => void
}