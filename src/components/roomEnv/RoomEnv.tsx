'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GetRoomByIdResponse } from '@/types/api';
import { BASE_URL } from '@/constants';
import ShowAction from './ShowAction';

interface RoomEnvProps {
  userId: string;
  roomId: string;
}

const RoomEnv = ({ userId, roomId }: RoomEnvProps) => {
  const [room, setRoom] = useState<GetRoomByIdResponse | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const fetchRoomInitial = useRef(true);
  const pollingInterval = useRef<ReturnType<typeof setInterval>>();

  const fetchRoom = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/groups/${roomId}`);
      const data = await response.json();
      if (response.ok) {
        setRoom(data);
      }
    } catch (error) {
      console.error('Error fetching room:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);
  useEffect(() => {
    if (roomId && !fetchRoomInitial.current) {
      fetchRoomInitial.current = true;
      fetchRoom();
    }
  }, [roomId, fetchRoom]);

  // Add polling effect
  useEffect(() => {
    // Clear any existing interval
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }

    // Start new polling interval
    pollingInterval.current = setInterval(() => {
      fetchRoom();
    }, 5000); // Poll every 5 seconds

    // Cleanup on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [fetchRoom, room]); // Restart polling when room updates

  const updateRoom = async (payload: unknown) => {
    try {
      const response = await fetch(`${BASE_URL}/api/groups/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to fetch room data');
      const data = await response.json();
      // setRoom(data);
      fetchRoom();
    } catch (error) {
      console.error('Error updating room:', error);
    }
  }
  
  const handleSendMessage = () => {
    try {
      if (!message.trim()) return;
    // Implement message sending logic here
      setMessage('')
      updateRoom({
        message: {
          content: message,
          sender_id: userId,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error(error)
    }
  };

  const handleAction = (action: string) => {
    setSelectedTool(action)
    updateRoom({
      action: {
        type: action,
        content: action,
        timestamp: new Date().toISOString(),
      },
    })
  }

  // if (loading) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <div className="text-xl">Loading room...</div>
  //     </div>
  //   );
  // }

  // if (!room) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <div className="text-xl text-red-500">Room not found</div>
  //     </div>
  //   );
  // }


  console.log(room)

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Header */}
      <div className="bg-white shadow-sm px-6 pb-4 pt-2 border-b">
        <h1 className="text-3xl font-bold">{room?.title}</h1>
        <div className="mt-2 text-gray-600 flex justify-between items-center gap-x-4">
          <p className=''>{room?.description}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="font-medium">Type:</span> {room?.type}
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">Members:</span> {room?.members?.length ?? 0}/{room?.capacity ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">Activity Score:</span> {room?.activityScore ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">Created by:</span> {room?.createBy || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {(!room?.actions?.length || (room?.actions?.length && room?.actions?.find((action) => action.type !== 'CALL'))) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {room?.members?.map((member, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center flex-col justify-center space-y-2">
                        <div className="relative">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-xl">
                              {member?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                        </div>
                        <p className="text-base text-center text-gray-500">
                          {member === userId ? 'You' : member}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {room?.actions?.map((action, index) => (
                <ShowAction members={room?.members || []} key={index} questions={room?.questions} actionType={action.type} userId={userId} />
              ))}
            </div>
          </div>

          {/* Bottom Toolbar */}
          <div className="bg-white border-t p-4">
            <div className="flex gap-4 items-center">
              <select className="w-[320px] bg-blue-100 p-2 border rounded-md text-sm" onChange={(e) => handleAction(e.target.value)}>
                <option value="">Actions</option>
                <option value="CALL">Join Call</option>
                <option value="TEST">Join Test</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="w-[380px] bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Chat</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 flex flex-col items-end justify-end">
            {(room?.messages || []).map((msg) => {
              if (msg.senderId === 'system') {
                return (
                  <div key={msg.id} className={"mb-4 rounded-md bg-gray-100"}>
                    <div className="flex items-center gap-2 px-4 py-1">
                      <span className="font-semibold">{msg.senderId}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 p-2 bg-gray-50 rounded-md">
                      {msg.content.includes('TEST') ? 'Test started' : msg.content.includes('CALL') ? 'Call started' : msg.content}
                    </div>
                  </div>
                )
              } else {
                return (
                  <div key={msg.id} className={"mb-4 rounded-md "+`${msg.senderId === userId ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-2 px-4 py-1">
                      <span className="font-semibold">{msg.senderId}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 p-2 bg-gray-50 rounded-md">
                      {msg.content}
                    </div>
                  </div>
                )
              }
            })}
          </div>
          <div className="flex gap-2 sticky bottom-0 pb-4 px-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-md"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomEnv;
