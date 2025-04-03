"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Video, Mic, MicOff, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function CameraPanel() {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState("")
  const [selectedMicrophone, setSelectedMicrophone] = useState("")
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
  })
  const [voiceEffects, setVoiceEffects] = useState({
    pitch: 1,
    echo: 0,
    distortion: 0,
  })
  const [showControls, setShowControls] = useState(true)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordedChunks, setRecordedChunks] = useState<BlobPart[]>([])

  // Get available media devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        setDevices(devices)

        // Set default devices
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        const audioDevices = devices.filter((device) => device.kind === "audioinput")

        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId)
        }

        if (audioDevices.length > 0) {
          setSelectedMicrophone(audioDevices[0].deviceId)
        }
      } catch (error) {
        console.error("Error getting media devices:", error)
      }
    }

    getDevices()
  }, [])

  // Start camera stream
  const startStream = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
        audio: selectedMicrophone ? { deviceId: { exact: selectedMicrophone } } : true,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsStreaming(true)

        // Apply mute setting
        const audioTracks = stream.getAudioTracks()
        audioTracks.forEach((track) => {
          track.enabled = !isMuted
        })

        // Setup media recorder
        const recorder = new MediaRecorder(stream)
        setMediaRecorder(recorder)

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setRecordedChunks((prev) => [...prev, event.data])
          }
        }

        recorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: "video/webm" })
          const url = URL.createObjectURL(blob)

          const a = document.createElement("a")
          a.href = url
          a.download = "recording.webm"
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)

          URL.revokeObjectURL(url)
          setRecordedChunks([])

          toast({
            title: "Recording Saved",
            description: "Your recording has been downloaded",
          })
        }
      }

      toast({
        title: "Camera Started",
        description: "Your camera is now active",
      })
    } catch (error) {
      console.error("Error accessing media devices:", error)
      toast({
        title: "Error",
        description: "Could not access camera or microphone",
        variant: "destructive",
      })
    }
  }

  // Stop camera stream
  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()

      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)

      if (isRecording) {
        stopRecording()
      }

      toast({
        title: "Camera Stopped",
        description: "Your camera has been turned off",
      })
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const audioTracks = stream.getAudioTracks()

      audioTracks.forEach((track) => {
        track.enabled = isMuted
      })

      setIsMuted(!isMuted)

      toast({
        title: isMuted ? "Microphone Unmuted" : "Microphone Muted",
        description: isMuted ? "Your microphone is now active" : "Your microphone has been muted",
      })
    }
  }

  // Take a photo
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Apply filters
      const filterString = `
        brightness(${filters.brightness}%) 
        contrast(${filters.contrast}%) 
        saturate(${filters.saturation}%) 
        blur(${filters.blur}px) 
        grayscale(${filters.grayscale}%)
      `

      ctx.filter = filterString
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Reset filter
      ctx.filter = "none"

      // Download the image
      const dataUrl = canvas.toDataURL("image/png")
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = "photo.png"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast({
        title: "Photo Taken",
        description: "Your photo has been downloaded",
      })
    }
  }

  // Start recording
  const startRecording = () => {
    if (mediaRecorder) {
      setRecordedChunks([])
      mediaRecorder.start()
      setIsRecording(true)

      toast({
        title: "Recording Started",
        description: "Your video is now being recorded",
      })
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  // Apply CSS filters to video
  const videoFilters = `
    brightness(${filters.brightness}%) 
    contrast(${filters.contrast}%) 
    saturate(${filters.saturation}%) 
    blur(${filters.blur}px) 
    grayscale(${filters.grayscale}%)
  `

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="camera" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="camera">Camera</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="camera" className="flex-1 flex flex-col">
          <div className="relative flex-1 bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              className="max-h-full max-w-full"
              style={{ filter: videoFilters }}
              muted={true} // Mute to prevent feedback, actual audio still records
            />

            <canvas ref={canvasRef} className="hidden" />

            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button onClick={startStream}>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              </div>
            )}

            {showControls && isStreaming && (
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                  onClick={takePhoto}
                >
                  <Camera className="h-4 w-4" />
                </Button>

                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="icon"
                  className={isRecording ? "" : "bg-black/50 hover:bg-black/70 text-white border-white/20"}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  <Video className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                  onClick={stopStream}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="filters" className="p-4 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Brightness: {filters.brightness}%</Label>
                <Button variant="outline" size="sm" onClick={() => setFilters({ ...filters, brightness: 100 })}>
                  Reset
                </Button>
              </div>
              <Slider
                value={[filters.brightness]}
                min={0}
                max={200}
                step={1}
                onValueChange={(value) => setFilters({ ...filters, brightness: value[0] })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Contrast: {filters.contrast}%</Label>
                <Button variant="outline" size="sm" onClick={() => setFilters({ ...filters, contrast: 100 })}>
                  Reset
                </Button>
              </div>
              <Slider
                value={[filters.contrast]}
                min={0}
                max={200}
                step={1}
                onValueChange={(value) => setFilters({ ...filters, contrast: value[0] })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Saturation: {filters.saturation}%</Label>
                <Button variant="outline" size="sm" onClick={() => setFilters({ ...filters, saturation: 100 })}>
                  Reset
                </Button>
              </div>
              <Slider
                value={[filters.saturation]}
                min={0}
                max={200}
                step={1}
                onValueChange={(value) => setFilters({ ...filters, saturation: value[0] })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Blur: {filters.blur}px</Label>
                <Button variant="outline" size="sm" onClick={() => setFilters({ ...filters, blur: 0 })}>
                  Reset
                </Button>
              </div>
              <Slider
                value={[filters.blur]}
                min={0}
                max={10}
                step={0.1}
                onValueChange={(value) => setFilters({ ...filters, blur: value[0] })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Grayscale: {filters.grayscale}%</Label>
                <Button variant="outline" size="sm" onClick={() => setFilters({ ...filters, grayscale: 0 })}>
                  Reset
                </Button>
              </div>
              <Slider
                value={[filters.grayscale]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => setFilters({ ...filters, grayscale: value[0] })}
              />
            </div>

            <Button
              className="w-full"
              onClick={() =>
                setFilters({
                  brightness: 100,
                  contrast: 100,
                  saturation: 100,
                  blur: 0,
                  grayscale: 0,
                })
              }
            >
              Reset All Filters
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="audio" className="p-4 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Pitch: {voiceEffects.pitch.toFixed(1)}</Label>
                <Button variant="outline" size="sm" onClick={() => setVoiceEffects({ ...voiceEffects, pitch: 1 })}>
                  Reset
                </Button>
              </div>
              <Slider
                value={[voiceEffects.pitch]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={(value) => setVoiceEffects({ ...voiceEffects, pitch: value[0] })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Echo: {voiceEffects.echo.toFixed(1)}</Label>
                <Button variant="outline" size="sm" onClick={() => setVoiceEffects({ ...voiceEffects, echo: 0 })}>
                  Reset
                </Button>
              </div>
              <Slider
                value={[voiceEffects.echo]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(value) => setVoiceEffects({ ...voiceEffects, echo: value[0] })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Distortion: {voiceEffects.distortion.toFixed(1)}</Label>
                <Button variant="outline" size="sm" onClick={() => setVoiceEffects({ ...voiceEffects, distortion: 0 })}>
                  Reset
                </Button>
              </div>
              <Slider
                value={[voiceEffects.distortion]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(value) => setVoiceEffects({ ...voiceEffects, distortion: value[0] })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="mute">Mute Microphone</Label>
              <Switch
                id="mute"
                checked={isMuted}
                onCheckedChange={(checked) => {
                  setIsMuted(checked)
                  if (isStreaming) {
                    toggleMute()
                  }
                }}
              />
            </div>

            <Button
              className="w-full"
              onClick={() =>
                setVoiceEffects({
                  pitch: 1,
                  echo: 0,
                  distortion: 0,
                })
              }
            >
              Reset All Audio Effects
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="p-4 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Camera</Label>
              <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                <SelectTrigger>
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  {devices
                    .filter((device) => device.kind === "videoinput")
                    .map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Microphone</Label>
              <Select value={selectedMicrophone} onValueChange={setSelectedMicrophone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  {devices
                    .filter((device) => device.kind === "audioinput")
                    .map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="controls">Show Camera Controls</Label>
              <Switch id="controls" checked={showControls} onCheckedChange={setShowControls} />
            </div>

            <Button
              className="w-full"
              onClick={async () => {
                await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                const devices = await navigator.mediaDevices.enumerateDevices()
                setDevices(devices)
                toast({
                  title: "Devices Refreshed",
                  description: "Your camera and microphone list has been updated",
                })
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Devices
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

