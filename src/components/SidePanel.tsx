'use client'

import { Tab } from "@/types/api"

interface SidePanelProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  tabList: Tab[]
  user?: {
    id: string
    name: string
    email: string
  }
}

export default function SidePanel({ activeTab, setActiveTab, tabList, user }: SidePanelProps) {

  return (
    <div className="w-64 bg-white border-r">
      <div className="p-4">
        <div className="flex flex-col items-center">
          <h2 className="text-xl px-4 leading-none py-2 border-2 border-solid border-blue-950 rounded-lg text-blue-950 font-bold">ALLEN Connect</h2>
          <p className="text-base text-orange-700 text-center font-bold leading-none mt-1">Match! Learn! Grow!</p>
        </div>
        <h2 className="text-xl font-semibold mb-4 mt-4">Welcome, {user?.name}</h2>
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="space-y-2">
          {tabList.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
