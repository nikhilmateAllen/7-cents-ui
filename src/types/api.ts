export type GetGroupBySearchResponse = Group[]

export interface Group {
  id: string
  title: string
  description: string
  members: string[]
  tag: string
  type: string
  private: boolean
  messages: Message[]
  actions: Action[]
  questions: Question[]
  createBy: string
  capacity: number
  activityScore: number
  recommendationScore?: number
}

export interface GetGroupByTagsResponse {
  system_recommended_groups: Group[]
  user_active_groups: Group[]
}

export type Tab = {
  id: string
  label: string
}

export interface GetRoomByIdResponse extends Group {}

export interface Message {
  id: string
  content: string
  senderId: string
  timestamp: string
}

export interface Action {
  id: string
  type: string
  content: string
  senderId: string
  timestamp: string
}

export interface Question {
  id: string
  content: string
  options: string[]
  timestamp: string
}
