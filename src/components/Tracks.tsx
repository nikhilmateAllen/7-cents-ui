import { ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteAudioTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng"
import { CSSProperties, useLayoutEffect, useRef } from "react"

type TLiveCLassVideoProps = {
  videoTrack: ICameraVideoTrack | IRemoteVideoTrack | undefined | null
  audioTrack: IMicrophoneAudioTrack | IRemoteAudioTrack | undefined | null
  width: string
  height: string
  styles?: CSSProperties
  speakerId?: string
}
const Tracks = (props: TLiveCLassVideoProps) => {
  const { videoTrack, audioTrack, width, height, styles, speakerId } = props
  const vidDiv = useRef(null)
  const isVideoPlaying = useRef(false)
  const isAudioPlaying = useRef(false)

  // play video
  useLayoutEffect(() => {
    if (vidDiv.current !== null && !isVideoPlaying.current && videoTrack) {
      isVideoPlaying.current = true
      videoTrack?.play(vidDiv.current, {
        mirror: false,
        fit: "contain",
      })
    }
    return () => {
      videoTrack?.stop()
      isVideoPlaying.current = false
    }
  }, [videoTrack])

  // play audio
  useLayoutEffect(() => {
    function setAudio() {
      if (audioTrack) {
        if (!isAudioPlaying.current) {
          isAudioPlaying.current = true
          audioTrack?.play() // Play the audio track
        }
      }
    }

    setAudio()

    // Cleanup - stop all audio tracks when component unmounts or audioTrack changes
    return () => {
      if (audioTrack) {
        audioTrack?.stop()
        isAudioPlaying.current = false
      }
    }
  }, [audioTrack])
  return (
    <div
      ref={vidDiv}
      className={`overflow-hidden bg-transparent`}
      style={{
        width,
        height,
        ...(styles ?? {}),
      }}
    ></div>
  )
}
export default Tracks
