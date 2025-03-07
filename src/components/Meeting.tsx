import AgoraRTC, {
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  ILocalTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng'
import { useEffect, useState } from 'react'
import Tracks from './Tracks'
const data = {
  appId: 'aa01b5cefdac49a382c21149255ec2c9',
  channel: '7_cents',
  token:
    '007eJxTYPA4cDD5Znunh7bErMAnSf8Ndm5aHX6E4WXg/6pZ+0+xPmNWYEhMNDBMMk1OTUtJTDaxTDS2MEo2MjQ0sTQyNU1NNkq23DLnVHpDICNDWX4FIyMDBIL47Azm8cmpeSXFDAwARUciiA==',
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

const Meeting = ({ members, userId }: { members: string[], userId: string }) => {
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
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  const [isJoined, setIsJoined] = useState(false);

  const initDevices = async () => {
    try {
      // Initialize audio track if needed
      if (!localTracks.audioTrack) {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: 'music_standard',
        })
        audioTrack.setMuted(true)
        setLocalTracks((prev) => ({ ...prev, audioTrack }))
      }

      // Initialize video track if needed
      if (!localTracks.videoTrack) {
        const videoTrack = await AgoraRTC.createCameraVideoTrack()
        videoTrack.setMuted(true)
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

  /* const switchCamera = async (deviceId: string) => {
    try {
      const newCamera = cams.find((cam) => cam.deviceId === deviceId)
      if (newCamera) {
        setIsVideoOn(prev => !prev)
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
        setIsMicOn(prev => !prev)
        setCurrentMic(newMic.deviceId)
        if (localTracks.audioTrack) {
          await localTracks.audioTrack.setDevice(deviceId)
        }
      }
    } catch (error) {
      console.error('Error switching microphone:', error)
    }
  } */

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
      await client.join(data.appId, data.channel, data.token, userId)
      const remoteTrack: {
        audioTrack: IMicrophoneAudioTrack | null,
        videoTrack: ICameraVideoTrack | null
      } = {
        audioTrack: null,
        videoTrack: null
      }
      if (!localTracks.audioTrack) {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: "music_standard",
          microphoneId: currentMic || ""
        });
        remoteTrack.audioTrack = audioTrack
      }
      if (!localTracks.videoTrack) {
        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: '360_8',
          cameraId: currentCamera || ""
        });
        remoteTrack.videoTrack = videoTrack
      }
      if (remoteTrack.audioTrack && remoteTrack.videoTrack) setLocalTracks((prev) => ({ ...prev, audioTrack: remoteTrack?.audioTrack, videoTrack: remoteTrack?.videoTrack }))
      await client.publish([localTracks?.audioTrack, localTracks?.videoTrack] as ILocalTrack[])
      setIsJoined(true)
    } catch (error) {
      console.error('Error joining:', error)
    }
  }  
  // Initialize devices on component mount
  useEffect(() => {
    async function init() {
      await initDevices()
      handleJoin()
    }
    init()
    return () => {
      // Cleanup tracks when component unmounts
      localTracks.audioTrack?.close()
      localTracks.videoTrack?.close()
      async function leave() {
        await client.leave()
        setLocalTracks({ audioTrack: null, videoTrack: null })
      }
      leave()
    }
  }, [])

  const handleLeaveJoin = async () => {
    if (isJoined) {
      setIsJoined(false)
      await client.leave()
      setLocalTracks({ audioTrack: null, videoTrack: null })
    } else {
      await handleJoin()
    }
  }

  const toggleMic = () => {
    const currentState = isMicOn
    setIsMicOn(prev => !prev)
    localTracks.audioTrack?.setMuted(currentState)
  }

  const toggleCam = () => {
    const currentState = isMicOn
    setIsVideoOn(prev => !prev)
    localTracks.videoTrack?.setMuted(currentState)
  }
  const mediaControls = () => {
    return (
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 rounded-full px-6 py-3 flex items-center space-x-4">
        <button
          onClick={toggleMic}
          className={`p-3 rounded-full ${
            isMicOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'
          } transition-colors`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMicOn ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            )}
          </svg>
        </button>
        <button
          onClick={toggleCam}
          className={`p-3 rounded-full ${
            isVideoOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'
          } transition-colors`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isVideoOn ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            )}
          </svg>
        </button>
        <button
          onClick={handleLeaveJoin}
          className={`p-3 rounded-full bg-blue-500 hover:bg-blue-600`}>
          {isJoined ? 'Leave' : 'Join'}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Video Call Session</h3>
      </div>
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
        {[...members, userId]?.map((participant, index) => {
          const isSelf = participant === userId
          const isAudio = isSelf ? localTracks.audioTrack : remoteUsers[participant]?.audioTrack
          const isVideo = isSelf ? localTracks.videoTrack : remoteUsers[participant]?.videoTrack
          console.log(isAudio, isVideo)
          return (
            <div key={participant} className="bg-gray-50 rounded-lg p-4">
              <div className="w-full h-auto bg-gray-200 rounded-lg mb-2">
                <Tracks  
                  audioTrack={null}
                  videoTrack={null}
                  width="100%"
                  height="240px"
                />
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
          )
        })}
      </div>
      {mediaControls()}
    </div>
  )
}

export default Meeting
