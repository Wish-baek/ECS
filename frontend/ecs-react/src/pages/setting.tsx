import style from "../styles/common/setting.module.css"
import { useState, useEffect, useRef } from "react"
import Webcam from "react-webcam"
import { Cookies } from "react-cookie"
import axios, { AxiosResponse } from "axios"
import { useRecoilValue } from "recoil"
import { useRecoilState } from "recoil"
import { settingState, userNo } from "../recoil/atoms/userState"
import { useNavigate } from "react-router"
import eye1 from "../assets/image/eye1.png"
import eye2 from "../assets/image/eye2.png"
import eye3 from "../assets/image/eye3.png"
import eye4 from "../assets/image/eye4.png"

export default function Setting() {
  const [count, setCount] = useState<number>(5)
  const webcamRef = useRef<Webcam>(null)
  const [currentCircle, setCurrentCircle] = useState(0)
  const cookies = new Cookies()
  const userNumber = useRecoilValue(userNo)
  const navigate = useNavigate()
  const [isEnd, setIsEnd] = useState(false)
  const eyes = [eye1, eye2, eye3, eye4]
  const [isSetting, setIsSetting] = useRecoilState(settingState)

  // 동그라미 위치 (좌상/우상/좌하/우하)
  const circles = [
    { top: "0", left: "0" },
    { top: "0", left: "calc(100% - 100px)" },
    { top: "calc(100% - 100px)", left: "0" },
    { top: "calc(100% - 100px)", left: "calc(100% - 100px)" },
  ]
  // 캠 화면, 나중에 안보이게 수정
  const videoConstraints = {
    width: 420,
    height: 420,
  }

  // 캡쳐화면 imgSrc에 저장
  const capture = async () => {
    if (!webcamRef.current) return
    //캡쳐된 이미지
    const imageSrc: string | null = webcamRef.current.getScreenshot()
    if (!imageSrc) return
    const token = cookies.get("accessToken")
    const response: AxiosResponse = await axios.post(
      // api 주소 적기
      `https://k8d204.p.ssafy.io/flask/setting`,
      // `http://192.168.100.88:5000/setting`,
      { userNo: userNumber, imgSrc: imageSrc, index: currentCircle + 1 }
    )

    if (response.data[0] === 200) {
      setCurrentCircle((c) => c + 1)
    }
    if (response.data === 400) {
      console.log("error")
    }
    setCount(5)
  }

  // 캡쳐보내기
  const sendImage = async () => {}

  /* circles 인덱스번호*6초 후에 각 위치의 동그라미 나타나고 5초부터 0초까지 카운트다운, 카운트가 다 끝나기 전에 화면 캡쳐*/
  useEffect(() => {
    if (count === -1) return
    const id = setInterval(() => {
      setCount((c) => c - 1)
    }, 300)

    if (count === 0) {
      clearInterval(id)
      capture()
      sendImage()
    }
    if (currentCircle === 4) {
      clearInterval(id)
      return
    }
    return () => clearInterval(id)
  }, [count, currentCircle])

  // 모든 원 초점 맞추면 2초 뒤 페이지 넘어감
  useEffect(() => {
    if (currentCircle === 4) {
      setIsEnd(true)
      setTimeout(() => {
        navigate("/selectMain")
      }, 2000)
      setIsSetting(true)
      setCount(-1)
    }
  }, [currentCircle])

  return (
    <div className={style.container}>
      {count !== -1 ? (
        <div className={style.circle} style={circles[currentCircle]}>
          {count}
        </div>
      ) : null}

      <Webcam
        className={style.cam}
        muted={false}
        audio={false}
        mirrored={true}
        height={400}
        width={400}
        ref={webcamRef}
        screenshotFormat='image/jpeg'
        videoConstraints={videoConstraints}
      />
      {isEnd ? (
        <div className={`${style.content} ${style.finish}`}>
          설정이 완료되었습니다.
        </div>
      ) : (
        <div className={style.content}>
          <img
            src={eyes[currentCircle]}
            alt=''
            width={300}
            style={{ margin: "auto", display: "block" }}
          ></img>
          <div className={style.text}>빨간 원을 쳐다봐주세요</div>
        </div>
      )}
    </div>
  )
}