export interface PollItem {
  id: string
  title: string
  status: 'active' | 'scheduled' | 'closed'
  responseMode: 'verified' | 'anonymous'
  totalVotes: number
  createdAt: string
  expiresAt: string
  startsAt: string;  
}

export interface ShareModalProps {
  poll: PollItem | null
  isOpen: boolean
  onClose: () => void
}

export type Polls= {
  id: string;
  title: string;
  creatorId: string;
  isPublished: boolean;
  responseMode: 'verified' | 'anonymous'; // Use union if there are other modes like 'anonymous'
  createdAt: string;                  // ISO Date string
  updatedAt: string;                  // ISO Date string
  startsAt: string;                   // ISO Date string
  expiresAt: string;                  // ISO Date string
}
