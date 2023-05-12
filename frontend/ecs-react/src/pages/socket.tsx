import style from "../styles/common/socket.module.css"
import WebSocketCall from "../components/socket/webSocketCall"
import { io, Socket } from "socket.io-client"
import { useCallback, useRef, useEffect, useState } from "react"
import Webcam from "react-webcam"
import { useRecoilState, useRecoilValue } from "recoil"
import { settingState, userNo } from "../recoil/atoms/userState"

function SocketTest() {
  const [socketInstance, setSocketInstance] = useState<Socket>()
  const [loading, setLoading] = useState(true)
  const [buttonStatus, setButtonStatus] = useState(true)
  const webcamRef = useRef<Webcam>(null)
  const [isSetting, setIsSetting] = useRecoilState(settingState)
  const userNumber = useRecoilValue(userNo)

  // 캠 화면
  const videoConstraints = {
    width: 1024,
    height: 768,
    // facingMode: { exact: "environment" }
  }
  // 캠 화면 캡쳐하고 보냄
  const capture = useCallback(() => {
    if (!webcamRef.current) return
    console.log("보냄")
    const imageSrc = webcamRef.current.getScreenshot()
    socketInstance?.emit("imageConversionByClient", {
      image: true,
      buffer: imageSrc,
      userNo: userNumber,
    })
  }, [webcamRef, socketInstance])
  // 1초 마다 캡쳐화면 보내기
  useEffect(() => {
    console.log(isSetting)
    if (socketInstance) {
      setInterval(capture, 1000)
    }
  }, [socketInstance])
  // 소켓 연결

  useEffect(() => {
    if (isSetting === true) {
      const socket = io("https://k8d204.p.ssafy.io", {
        path: "/socket.io",
        transports: ["websocket"],
        // cors: {
        //   origin: "http://localhost:3000/",
        // },
      })

      setSocketInstance(socket)

      socket.on("connect", () => {
        console.log("connect")
      })

      setLoading(false)

      socket.on("disconnect", (data: any) => {
        console.log(data)
      })

      return function cleanup() {
        socket.disconnect()
      }
    }
  }, [isSetting])

  return (
    <>
      <Webcam
        muted={false}
        audio={false}
        mirrored={true}
        height={768}
        width={1024}
        ref={webcamRef}
        screenshotFormat='image/jpeg'
        videoConstraints={videoConstraints}
        className={style.cam}
      />

      {!loading && <WebSocketCall socket={socketInstance} />}
    </>
  )
}

export default SocketTest