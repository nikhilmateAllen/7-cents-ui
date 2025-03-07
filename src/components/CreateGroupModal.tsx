'use client'

import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { CreateGroupModalProps } from '@/types/components'
import { BASE_URL } from '@/constants'

const topics = [
  'Technology',
  'Science',
  'Arts',
  'Sports',
  'Education',
  'Business',
  'Health',
  'Other',
]

export default function CreateGroupModal({ isOpen, onClose, handleSuccess, userId }: CreateGroupModalProps) {
  const [topic, setTopic] = useState('')
  const [capacity, setCapacity] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      setIsLoading(true)
      e.preventDefault()
      // Handle form submission here
      const payload = {
        "title": title,
        "tag": topic,
        "capacity": Number(capacity),
        "is_private": isPrivate,
        "createBy": userId,
      }
      const response = await fetch(`${BASE_URL}/api/groups`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        handleSuccess()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
      onClose()
    }
  }
  const disableSubmit = !title || !topic || !capacity
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      {isLoading ? (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      ) : null}
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Group</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic*
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a topic</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity*
            </label>
            <input
              type="number"
              min="2"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Privacy*
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!isPrivate}
                  onChange={() => setIsPrivate(false)}
                  className="mr-2"
                  required
                />
                Public
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(true)}
                  className="mr-2"
                  required
                />
                Private
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              {...(disableSubmit ? { "disabled": true } : {})}
              type="submit"
              className={"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 "+`${disableSubmit ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
