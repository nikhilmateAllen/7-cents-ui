'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import GroupList from './GroupList'
import SidePanel from './SidePanel'
import CreateGroupModal from './CreateGroupModal'
import { GetGroupBySearchResponse, GetGroupByTagsResponse, Tab } from '@/types/api'
import { useSearchParams, useRouter } from 'next/navigation'
import { BASE_URL } from '@/constants'

const tabs: Tab[] = [
  { id: 'system_recommended_groups', label: 'Recommended' },
  { id: 'user_active_groups', label: 'Active' },
]

// TODO: reject button in recommended groups

export default function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>("")
  const [groupsByTagsData, setGroupsByTagsData] = useState<GetGroupByTagsResponse | null>(
    null
  )
  const [groupsBySearchData, setGroupsBySearchData] = useState<GetGroupBySearchResponse | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const params = useSearchParams()
  const router = useRouter()
  const fetchListRef = useRef<boolean>(false)
  const userId = useMemo(() => {
    const user = params.get('userId')
    return user || ''
  }, [params])
  
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(BASE_URL + '/api/groups/user/' + userId)
      const data = await response.json()
      setGroupsByTagsData(data)
      if (data?.user_active_groups?.length > 0) {
        setActiveTab("user_active_groups")
      } else if (data?.system_recommended_groups?.length > 0) {
        setActiveTab("system_recommended_groups")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId && !fetchListRef.current) {
      fetchListRef.current = true
      fetchData()
    }
  }, [userId, fetchData])
  const tabList = useMemo(() => {
    if (!groupsByTagsData) return []
    return tabs.filter((group) => groupsByTagsData.hasOwnProperty(group.id))
  }, [groupsByTagsData])

  const handleSearch = async (query: string) => {
    try {
      if (query.trim() === "") {
        if (groupsByTagsData?.user_active_groups?.length) {
          setActiveTab("user_active_groups")
        } else if (groupsByTagsData?.system_recommended_groups?.length) {
          setActiveTab("system_recommended_groups")
        }
      } else {
        setActiveTab("")
      }
      setSearchQuery(query.trim())
      const response = await fetch(BASE_URL + '/api/groups/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tag: query.trim()
        })
      })
      const data = await response.json()
      setGroupsBySearchData(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const groupsList = useMemo(() => {
    // if (!groupsByTagsData) return []
    // if (!groupsBySearchData) return []
    if (searchQuery) return groupsBySearchData
    if (activeTab === "system_recommended_groups") {
      return groupsByTagsData?.system_recommended_groups
    } else if (activeTab === "user_active_groups") {
      return groupsByTagsData?.user_active_groups
    }
    return []
  }, [groupsByTagsData, groupsBySearchData, activeTab, searchQuery])

  const handleSetActiveTab = (tab: string) => {
    setSearchQuery("")
    setActiveTab(tab)
  }

  // const joinGroup = async (groupId: string) => {

  const handleJoinGroup = async (groupId: string) => {
    try {
      const response = await fetch(BASE_URL + `/api/groups/${groupId}/join/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (response.ok) {
        router.push(`/room/${groupId}?userId=${userId}`)
      }
      console.log(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    try {
      if (activeTab === "user_active_groups") {
        const response = await fetch(BASE_URL + `/api/groups/${groupId}/leave/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          fetchData()
        }
      } else {
        const response = await fetch(BASE_URL + `/api/groups/${groupId}/reject/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          fetchData()
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleJoin = (groupId: string) => {
    if (activeTab === "user_active_groups") {
      router.push(`/room/${groupId}?userId=${userId}`)
    } else if (activeTab === "system_recommended_groups") {
      handleJoinGroup(groupId)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {isLoading ? (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      ) : null}
      {/* Left Panel */}
      <SidePanel activeTab={activeTab} setActiveTab={handleSetActiveTab} tabList={tabList} user={groupsByTagsData?.user} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar with Search and Create Button */}
        <div className="bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search groups..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Group
            </button>
          </div>
        </div>

        {/* Group List */}
        <div className="flex-1 overflow-y-auto p-6">
          {groupsList?.length ? (
            <GroupList groupsList={groupsList || []} personalGrp={activeTab === "user_active_groups"} handleJoinGroup={handleJoin} handleLeaveGroup={handleLeaveGroup} />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gray-100">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{"Data not found"}</h3>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        handleSuccess={() => {
          setSearchQuery("")
          setActiveTab("")
          if (searchQuery !== "") {
            handleSearch(searchQuery)
          } else {
            fetchData()
          }
        }}
        userId={userId}
      />
    </div>
  )
}
