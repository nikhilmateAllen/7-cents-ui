export interface Group {
  id: string
  title: string
  description: string
  currentMembers: number
  capacity: number
  topic: string
  isPrivate: boolean
  status: 'pending' | 'active'
}

export interface SidePanelProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export interface GroupListProps {
  searchQuery: string
  activeTab: string
}

export interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  handleSuccess: () => void
  userId: string
} 