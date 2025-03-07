import AgoraRTC, {
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng'
import { useEffect, useState } from 'react'
;[
  ,
  '7_cents',
  '007eJxTYMhUO3ch0DnJeqXEhwcfZs6+OeHyFmczg3vXZGzkxd1tzecrMCQmGhgmmSanpqUkJptYJhpbGCUbGRqaWBqZmqYmGyVb1v09md4QyMhwf3IqIyMDBIL47Azm8cmpeSXFDAwA3XMhfw==',
  1,
]
const data = {
  appId: 'aa01b5cefdac49a382c21149255ec2c9',
  channel: '7_cents',
  token:
    '007eJxTYMhUO3ch0DnJeqXEhwcfZs6+OeHyFmczg3vXZGzkxd1tzecrMCQmGhgmmSanpqUkJptYJhpbGCUbGRqaWBqZmqYmGyVb1v09md4QyMhwf3IqIyMDBIL47Azm8cmpeSXFDAwA3XMhfw==',
  uid: 1,
}

var client = AgoraRTC.createClient({
  mode: 'rtc',
  codec: 'vp8',
})

interface LocalTracks {
  videoTrack: ICameraVideoTrack | null
  audioTrack: IMicrophoneAudioTrack | null
}

interface RemoteUser {
  [key: string]: IAgoraRTCRemoteUser
}

const Meeting = ({ members }: { members: string[] }) => {
  // Tracks state
  const [localTracks, setLocalTracks] = useState<LocalTracks>({
    videoTrack: null,
    audioTrack: null,
  })
  // Remote users state
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser>({})

  // Video quality state
  const [isHighRemoteVideoQuality, setIsHighRemoteVideoQuality] = useState(true)

  // User type state
  const [userType, setUserType] = useState<string | null>(null)

  // Device states
  const [cams, setCams] = useState<MediaDeviceInfo[]>([])
  const [mics, setMics] = useState<MediaDeviceInfo[]>([])
  const [currentCamera, setCurrentCamera] = useState<string | null>(null)
  const [currentMic, setCurrentMic] = useState<string | null>(null)

  const initDevices = async () => {
    try {
      // Initialize audio track if needed
      if (!localTracks.audioTrack) {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: 'music_standard',
        })
        setLocalTracks((prev) => ({ ...prev, audioTrack }))
      }

      // Initialize video track if needed
      if (!localTracks.videoTrack) {
        const videoTrack = await AgoraRTC.createCameraVideoTrack()
        setLocalTracks((prev) => ({ ...prev, videoTrack }))
      }

      // Get available microphones
      const micDevices = await AgoraRTC.getMicrophones()
      setMics(micDevices)
      if (micDevices.length > 0) {
        setCurrentMic(micDevices[0].deviceId)
      }

      // Get available cameras
      const camDevices = await AgoraRTC.getCameras()
      setCams(camDevices)
      if (camDevices.length > 0) {
        setCurrentCamera(camDevices[0].deviceId)
      }
    } catch (error) {
      console.error('Error initializing devices:', error)
    }
  }

  const switchCamera = async (deviceId: string) => {
    try {
      const newCamera = cams.find((cam) => cam.deviceId === deviceId)
      if (newCamera) {
        setCurrentCamera(newCamera.deviceId)
        if (localTracks.videoTrack) {
          await localTracks.videoTrack?.setDevice(deviceId)
        }
      }
    } catch (error) {
      console.error('Error switching camera:', error)
    }
  }

  const switchMicrophone = async (deviceId: string) => {
    try {
      const newMic = mics.find((mic) => mic.deviceId === deviceId)
      if (newMic) {
        setCurrentMic(newMic.deviceId)
        if (localTracks.audioTrack) {
          await localTracks.audioTrack.setDevice(deviceId)
        }
      }
    } catch (error) {
      console.error('Error switching microphone:', error)
    }
  }

  async function subscribe(
    user: IAgoraRTCRemoteUser,
    mediaType: 'video' | 'audio'
  ) {
    const uid = user.uid
    // subscribe to a remote user
    await client.subscribe(user, mediaType)
    console.log('subscribe success')
    /* if (mediaType === "video") {
      const player = $(`
        <div id="player-wrapper-${uid}">
          <p class="player-name">remoteUser(${uid})</p>
          <div id="player-${uid}" class="player"></div>
        </div>
      `);
      $("#remote-playerlist").append(player);
      user.videoTrack.play(`player-${uid}`);
    } */
    if (mediaType === 'audio') {
      user.audioTrack?.play()
    }
  }

  function handleUserPublished(
    user: IAgoraRTCRemoteUser,
    mediaType: 'video' | 'audio'
  ) {
    const id = user.uid
    setRemoteUsers((prev) => ({ ...prev, [id]: user }))
    subscribe(user, mediaType)
  }
  function handleUserUnpublished(
    user: IAgoraRTCRemoteUser,
    mediaType: 'video' | 'audio'
  ) {
    if (mediaType === 'video') {
      const id = user.uid
      setRemoteUsers((prev) => {
        const newRemoteUsers = { ...prev }
        delete newRemoteUsers[id]
        return newRemoteUsers
      })
    }
  }

  const handleJoin = async () => {
    try {
      client.on('user-published', handleUserPublished)
      client.on('user-unpublished', handleUserUnpublished)
      await client.join(data.appId, data.channel, data.token, data.uid)
    } catch (error) {
      console.error('Error joining:', error)
    }
  }

  // Initialize devices on component mount
  useEffect(() => {
    initDevices()
    return () => {
      // Cleanup tracks when component unmounts
      localTracks.audioTrack?.close()
      localTracks.videoTrack?.close()
    }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Video Call Session</h3>
        {/* <span className="text-sm text-gray-500">
          {new Date(action.timestamp).toLocaleString()}
        </span> */}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {members?.map((participant, index) => (
          <div key={participant} className="bg-gray-50 rounded-lg p-4">
            <div className="aspect-video bg-gray-200 rounded-lg h-24 mb-2">
              {/* {participant.isJoined ? (
                <div className="w-full h-full flex items-center justify-center">
                  {participant.feed ? (
                    <video
                      src={participant.feed}
                      className="w-full h-full object-cover rounded-lg"
                      autoPlay
                      muted
                      playsInline
                    />
                  ) : (
                    <div className="text-gray-400">Camera Off</div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Not Present
                </div>
              )} */}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">{participant}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  /* participant?.isJoined */ true
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Meeting
