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
        <h2 className="text-xl px-6 py-3 border-2 border-solid border-blue-950 rounded-lg mb-4 text-blue-950 font-bold">ALLEN Connect</h2>
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}</h2>
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
