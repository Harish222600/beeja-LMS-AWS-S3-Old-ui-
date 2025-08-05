import React, { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation } from "react-router-dom"
import { useNavigate, useParams } from "react-router-dom"

import "video-react/dist/video-react.css"
import { BigPlayButton, Player, ControlBar, VolumeMenuButton } from "video-react"

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import { setCourseViewSidebar } from "../../../slices/sidebarSlice"
import { apiConnector } from "../../../services/apiConnector"
import { endpoints } from "../../../services/apis"
import { getPlaybackUrl, isChunkedVideo, checkVideoAvailability } from "../../../utils/videoUtils"

import IconBtn from "../../common/IconBtn"

import { HiMenuAlt1 } from 'react-icons/hi'

const PlaybackSpeedControl = ({ playerRef, playbackRate, setPlaybackRate }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (speed) => {
    setPlaybackRate(speed)
    
    // Set playback rate on the actual HTML5 video element
    if (playerRef && playerRef.current) {
      try {
        // Get the video element from the player
        const videoElement = playerRef.current.video?.video
        if (videoElement) {
          videoElement.playbackRate = speed
        }
      } catch (error) {
        console.error("Error setting playback rate:", error)
      }
    }
    
    setIsOpen(false)
  }

  return (
    <div 
      className="playback-speed-control" 
      style={{ 
        display: "flex", 
        alignItems: "center", 
        marginLeft: "10px", 
        color: "white", 
        position: "relative"
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        style={{
          backgroundColor: "transparent",
          border: "none",
          color: "white",
          cursor: "pointer",
          padding: "5px 10px",
          fontSize: "0.9em"
        }}
      >
        {playbackRate}x
      </button>
      
      {isOpen && (
        <div 
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            borderRadius: "4px",
            padding: "5px",
            zIndex: 1000,
            minWidth: "80px",
            border: "1px solid rgba(255, 255, 255, 0.2)"
          }}
        >
          {[0.5, 0.75, 1, 1.5, 2].map((speed) => (
            <div
              key={speed}
              style={{
                padding: "5px 10px",
                cursor: "pointer",
                backgroundColor: playbackRate === speed ? "rgba(255, 255, 255, 0.2)" : "transparent",
                borderRadius: "3px",
                ":hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)"
                }
              }}
              onClick={() => handleChange(speed)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = playbackRate === speed ? "rgba(255, 255, 255, 0.2)" : "transparent"}
            >
              {speed}x
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const playerRef = useRef(null)
  const dispatch = useDispatch()

  const { token } = useSelector((state) => state.auth)
  const { courseSectionData, courseEntireData, completedLectures } = useSelector((state) => state.viewCourse)

  const [videoData, setVideoData] = useState(null)
  const [previewSource, setPreviewSource] = useState("")
  const [videoEnded, setVideoEnded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [watchTime, setWatchTime] = useState(0)
  const [videoAvailable, setVideoAvailable] = useState(true)
  const [checkingVideo, setCheckingVideo] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const watchTimeRef = useRef(0)
  const lastUpdateTime = useRef(Date.now())

  const updateWatchTime = useCallback(async () => {
    if (watchTimeRef.current > 0) {
      try {
        await apiConnector("POST", endpoints.UPDATE_WATCH_TIME_API, {
          courseId,
          subSectionId,
          watchTime: Math.floor(watchTimeRef.current)
        }, {
          Authorization: `Bearer ${token}`
        })
        watchTimeRef.current = 0
      } catch (error) {
        console.error("Error updating watch time:", error)
      }
    }
  }, [courseId, subSectionId, token])

  const handleTimeUpdate = useCallback(() => {
    if (!playerRef.current) return
    
    const currentTime = Date.now()
    const timeDiff = currentTime - lastUpdateTime.current
    
    if (timeDiff >= 1000) {
      const newWatchTime = watchTimeRef.current + (timeDiff / 1000)
      watchTimeRef.current = newWatchTime
      setWatchTime(newWatchTime)
      lastUpdateTime.current = currentTime
      
      if (newWatchTime >= 30) {
        updateWatchTime()
      }
    }
  }, [updateWatchTime])

  useEffect(() => {
    return () => {
      updateWatchTime()
    }
  }, [updateWatchTime])

  const currentVideoData = useMemo(() => {
    if (!courseSectionData?.length || !sectionId || !subSectionId) return null
    
    const currentSection = courseSectionData.find(course => course._id === sectionId)
    if (!currentSection) return null
    
    const currentSubSection = currentSection.subSection.find(data => data._id === subSectionId)
    return currentSubSection || null
  }, [courseSectionData, sectionId, subSectionId])

  useEffect(() => {
    if (!courseId && !sectionId && !subSectionId) {
      navigate(`/dashboard/enrolled-courses`)
      return
    }

    if (currentVideoData) {
      setVideoData(currentVideoData)
      if (courseEntireData?.thumbnail) {
        setPreviewSource(courseEntireData.thumbnail)
      }
      
      if (currentVideoData.videoUrl) {
        setCheckingVideo(true)
        checkVideoAvailability(currentVideoData.videoUrl, token, subSectionId)
          .then(available => {
            setVideoAvailable(available)
            setCheckingVideo(false)
          })
          .catch(error => {
            console.error('Error checking video availability:', error)
            setVideoAvailable(false)
            setCheckingVideo(false)
          })
      } else {
        setVideoAvailable(true)
        setCheckingVideo(false)
      }
    }
    setVideoEnded(false)
    setPlaybackSpeed(1) // Reset playback speed when video changes
  }, [currentVideoData, courseEntireData, courseId, sectionId, subSectionId, navigate, token])

  // Effect to apply playback speed when player is ready
  useEffect(() => {
    if (playerRef.current && playbackSpeed !== 1) {
      const timer = setTimeout(() => {
        try {
          const videoElement = playerRef.current.video?.video
          if (videoElement) {
            videoElement.playbackRate = playbackSpeed
          }
        } catch (error) {
          console.error("Error applying playback rate:", error)
        }
      }, 500) // Small delay to ensure video is loaded
      
      return () => clearTimeout(timer)
    }
  }, [playbackSpeed, videoData])

  const isFirstVideo = useMemo(() => {
    if (!courseSectionData?.length) return false
    
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)
    if (currentSectionIndx === -1) return false
    
    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex((data) => data._id === subSectionId)
    
    return currentSectionIndx === 0 && currentSubSectionIndx === 0
  }, [courseSectionData, sectionId, subSectionId])

  const goToNextVideo = useCallback(() => {
    if (!courseSectionData?.length) return
    
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)
    if (currentSectionIndx === -1) return

    const noOfSubsections = courseSectionData[currentSectionIndx].subSection.length
    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex((data) => data._id === subSectionId)

    if (currentSubSectionIndx !== noOfSubsections - 1) {
      const nextSubSectionId = courseSectionData[currentSectionIndx].subSection[currentSubSectionIndx + 1]._id
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`)
    } else if (currentSectionIndx < courseSectionData.length - 1) {
      const nextSectionId = courseSectionData[currentSectionIndx + 1]._id
      const nextSubSectionId = courseSectionData[currentSectionIndx + 1].subSection[0]._id
      navigate(`/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`)
    }
  }, [courseSectionData, sectionId, subSectionId, courseId, navigate])

  const isLastVideo = useMemo(() => {
    if (!courseSectionData?.length) return false
    
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)
    if (currentSectionIndx === -1) return false
    
    const noOfSubsections = courseSectionData[currentSectionIndx].subSection.length
    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex((data) => data._id === subSectionId)

    return currentSectionIndx === courseSectionData.length - 1 && currentSubSectionIndx === noOfSubsections - 1
  }, [courseSectionData, sectionId, subSectionId])

  const goToPrevVideo = useCallback(() => {
    if (!courseSectionData?.length) return
    
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)
    if (currentSectionIndx === -1) return

    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex((data) => data._id === subSectionId)

    if (currentSubSectionIndx !== 0) {
      const prevSubSectionId = courseSectionData[currentSectionIndx].subSection[currentSubSectionIndx - 1]._id
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`)
    } else if (currentSectionIndx > 0) {
      const prevSectionId = courseSectionData[currentSectionIndx - 1]._id
      const prevSubSectionLength = courseSectionData[currentSectionIndx - 1].subSection.length
      const prevSubSectionId = courseSectionData[currentSectionIndx - 1].subSection[prevSubSectionLength - 1]._id
      navigate(`/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`)
    }
  }, [courseSectionData, sectionId, subSectionId, courseId, navigate])

  const handleLectureCompletion = useCallback(async () => {
    setLoading(true)
    try {
      const res = await markLectureAsComplete(
        { courseId: courseId, subsectionId: subSectionId },
        token
      )
      if (res) {
        dispatch(updateCompletedLectures(subSectionId))
      }
    } catch (error) {
      console.error("Error marking lecture as complete:", error)
    } finally {
      setLoading(false)
    }
  }, [courseId, subSectionId, token, dispatch])

  const { courseViewSidebar } = useSelector(state => state.sidebar)

  if (courseViewSidebar && window.innerWidth <= 640) return null

  return (
    <div className="flex flex-col gap-5 text-white">
      <div className="sm:hidden text-white absolute left-7 top-3 cursor-pointer" onClick={() => dispatch(setCourseViewSidebar(!courseViewSidebar))}>
        {!courseViewSidebar && <HiMenuAlt1 size={33} />}
      </div>

      {!videoData ? (
        <div className="flex flex-col items-center justify-center h-[400px] bg-richblack-800 rounded-md">
          <div className="animate-pulse">
            <div className="h-4 w-48 bg-richblack-700 rounded mb-4"></div>
            <div className="h-2 w-32 bg-richblack-700 rounded"></div>
          </div>
        </div>
      ) : !videoData.videoUrl ? (
        <div className="flex flex-col items-center justify-center h-[400px] bg-richblack-800 rounded-md">
          <div className="text-center">
            <p className="text-richblack-200 text-lg mb-2">No video available for this lecture</p>
            <p className="text-richblack-400 text-sm">Please proceed to the next section or check back later.</p>
          </div>
        </div>
      ) : checkingVideo ? (
        <div className="flex flex-col items-center justify-center h-[400px] bg-richblack-800 rounded-md">
          <div className="animate-pulse text-center">
            <div className="h-4 w-48 bg-richblack-700 rounded mb-4 mx-auto"></div>
            <p className="text-richblack-200">Checking video availability...</p>
          </div>
        </div>
      ) : !videoAvailable ? (
        <div className="flex flex-col items-center justify-center h-[400px] bg-richblack-800 rounded-md">
          <div className="text-center">
            <p className="text-richblack-200 text-lg mb-2">Video is still processing</p>
            <p className="text-richblack-400 text-sm">This video is being processed. Please check back in a few minutes.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-yellow-50 text-richblack-900 rounded hover:bg-yellow-100 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      ) : (
        <>
          <Player
            ref={playerRef}
            aspectRatio="16:9"
            playsInline
            autoPlay
            playbackRate={playbackSpeed}
            onEnded={() => {
              setVideoEnded(true)
              updateWatchTime()
            }}
            onTimeUpdate={handleTimeUpdate}
            src={getPlaybackUrl(videoData.videoUrl, token, subSectionId)}
          >
            <BigPlayButton position="center" />
            <ControlBar>
              <VolumeMenuButton vertical />
              <PlaybackSpeedControl 
                playerRef={playerRef}
                playbackRate={playbackSpeed}
                setPlaybackRate={setPlaybackSpeed}
              />
            </ControlBar>
            
            {videoEnded && (
              <div
                style={{
                  backgroundImage:
                    "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1))",
                }}
                className="w-full absolute inset-0 z-[100] grid h-full place-content-center font-inter"
              >
                {!completedLectures.includes(subSectionId) && (
                  <IconBtn
                    disabled={loading}
                    onClick={() => handleLectureCompletion()}
                    text={!loading ? "Mark As Completed" : "Loading..."}
                    customClasses="text-xl max-w-max px-4 mx-auto"
                  />
                )}
                
                {completedLectures.includes(subSectionId) && videoData?.quiz && (
                  <IconBtn
                    disabled={loading}
                    onClick={() => navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${subSectionId}/quiz`)}
                    text="Take Quiz"
                    customClasses="text-xl max-w-max px-4 mx-auto bg-green-600 hover:bg-green-700"
                  />
                )}
                
                <IconBtn
                  disabled={loading}
                  onClick={() => {
                    if (playerRef?.current) {
                      playerRef.current.seek(0)
                      setVideoEnded(false)
                    }
                  }}
                  text="Rewatch"
                  customClasses="text-xl max-w-max px-4 mx-auto mt-2"
                />

                <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                  {!isFirstVideo && (
                    <button
                      disabled={loading}
                      onClick={goToPrevVideo}
                      className="blackButton"
                    >
                      Prev
                    </button>
                  )}
                  {!isLastVideo && (
                    <button
                      disabled={loading}
                      onClick={goToNextVideo}
                      className="blackButton"
                    >
                      Next
                    </button>
                  )}
                  {isLastVideo && (
                    <button
                      disabled={loading}
                      onClick={() => navigate('/dashboard/enrolled-courses')}
                      className="blackButton bg-green-600 hover:bg-green-700"
                    >
                      Go to Course
                    </button>
                  )}
                </div>
              </div>
            )}
          </Player>
        </>
      )}

      <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>
      <p className="pt-2 pb-6">{videoData?.description}</p>
    </div>
  )
}

export default VideoDetails
