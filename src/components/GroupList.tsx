'use client'

import { Group } from "@/types/api"

interface GroupListProps {
  groupsList: Group[]
  handleJoinGroup: (groupId: string) => void
  personalGrp: boolean
  handleLeaveGroup: (groupId: string) => void
}

export default function GroupList({ groupsList, handleJoinGroup, personalGrp, handleLeaveGroup }: GroupListProps) {
  // // Mock data - replace with actual data fetching
  // const groups: Group[] = [
  //   {
  //     id: '1',
  //     title: 'Web Development Group',
  //     description:
  //       'A group for web developers to share knowledge and collaborate on projects.',
  //     currentMembers: 5,
  //     capacity: 10,
  //     topic: 'Technology',
  //     isPrivate: false,
  //     status: 'active'
  //   },
  //   {
  //     id: '2',
  //     title: 'Data Science Community',
  //     description:
  //       'Join us to discuss data science, machine learning, and analytics.',
  //     currentMembers: 8,
  //     capacity: 15,
  //     topic: 'Science',
  //     isPrivate: true,
  //     status: 'pending'
  //   },
  //   // Add more mock groups as needed
  // ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(groupsList || [])?.map((group) => (
        <div
          key={group?.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">{group?.title}</h3>
            <span className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded">
              {group?.tag}
            </span>
          </div>

          <p className="text-gray-600 mb-4">{group.description}</p>

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">
              {group?.members?.length ?? 0}/{group.capacity} members
            </div>
            <div className="text-sm text-gray-500">
              {group?.type === 'private' ? 'Private' : 'Public'}
            </div>
          </div>

          <div className={"flex justify-between gap-x-2"}>
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={() => handleLeaveGroup(group?.id)}>
              {personalGrp ? 'Leave Group' : 'Reject'}
            </button>
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={() => handleJoinGroup(group?.id)}>
              {personalGrp ? 'Enter' : 'Join Group'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
