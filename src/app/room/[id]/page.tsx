"use client"
import RoomEnv from "@/components/roomEnv/RoomEnv"
import { usePathname, useSearchParams } from "next/navigation"
import { useMemo } from "react"

const RoomPage = () => {
  const path = usePathname()
  const params = useSearchParams()
  const userId = params.get('userId')
  
  // Get the last segment of the pathname
  const lastSegment = useMemo(() => path.split('/').filter(Boolean).pop(), [path])

  return <RoomEnv userId={userId || ""} roomId={lastSegment || ""} />
}

export default RoomPage
