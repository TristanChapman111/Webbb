"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Repeat,
  Shuffle,
  Music,
  Upload,
  ListMusic,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Song {
  id: string
  title: string
  artist: string
  duration: number
  url: string
}

export default function MusicPanel() {
  const { toast } = useToast()
  const [songs, setSongs] = useState<Song[]>([
    {
      id: "1",
      title: "Sample Song 1",
      artist: "Artist 1",
      duration: 180,
      url: "https://example.com/song1.mp3",
    },
    {
      id: "2",
      title: "Sample Song 2",
      artist: "Artist 2",
      duration: 240,
      url: "https://example.com/song2.mp3",
    },
    {
      id: "3",
      title: "Sample Song 3",
      artist: "Artist 3",
      duration: 210,
      url: "https://example.com/song3.mp3",
    },
  ])
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isShowPlaylist, setIsShowPlaylist] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio()

    // Set up event listeners
    if (audioRef.current) {
      audioRef.current.addEventListener("ended", handleSongEnd)
      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current) {
          audioRef.current.volume = volume / 100
        }
      })
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener("ended", handleSongEnd)
      }
    }
  }, [])

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  // Start/stop time update interval
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime)
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying])

  // Handle song ended
  const handleSongEnd = () => {
    if (isRepeat) {
      // If repeat is on, play the same song again
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
    } else {
      // Play the next song, or stop if it's the end of the playlist
      handleNextSong()
    }
  }

  // Play or pause the current song
  const togglePlayPause = () => {
    if (currentSongIndex === null) {
      // If no song is selected, do nothing or perhaps select the first song
      return
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Play a specific song by index
  const playSong = (index: number) => {
    if (index >= 0 && index < songs.length) {
      const song = songs[index]
      if (audioRef.current) {
        audioRef.current.src = song.url
        audioRef.current.onloadedmetadata = () => {
          setCurrentTime(0)
          audioRef.current!.volume = volume / 100
          audioRef.current!.play()
          setIsPlaying(true)
          setCurrentSongIndex(index)
        }
        audioRef.current.onerror = () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to load ${song.title}. Please check the URL.`,
          })
        }
      }
    }
  }

  // Handle playing the previous song
  const handlePrevSong = () => {
    if (currentSongIndex !== null) {
      const newIndex = currentSongIndex > 0 ? currentSongIndex - 1 : songs.length - 1
      playSong(newIndex)
    }
  }

  // Handle playing the next song
  const handleNextSong = () => {
    if (currentSongIndex !== null) {
      const newIndex = currentSongIndex < songs.length - 1 ? currentSongIndex + 1 : 0
      playSong(newIndex)
    }
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
  }

  // Handle time slider change
  const handleTimeChange = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  // Toggle repeat
  const toggleRepeat = () => {
    setIsRepeat(!isRepeat)
  }

  // Toggle shuffle
  const toggleShuffle = () => {
    setIsShuffle(!isShuffle)
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newSongs: Song[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const url = URL.createObjectURL(file)
        const song: Song = {
          id: Math.random().toString(36).substring(7),
          title: file.name,
          artist: "Unknown Artist",
          duration: 0,
          url: url,
        }
        newSongs.push(song)
      }
      setSongs([...songs, ...newSongs])
      toast({
        title: "Success",
        description: "Songs uploaded successfully!",
      })
    }
  }

  // Filter songs based on search query
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="bg-gray-100 p-4 rounded-md shadow-md w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
        <Music className="h-5 w-5" />
        <span>Music Player</span>
      </h2>

      {/* Search Input */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Current Song */}
      {currentSongIndex !== null && (
        <div className="mb-4">
          <p className="font-semibold">{songs[currentSongIndex].title}</p>
          <p className="text-gray-600">{songs[currentSongIndex].artist}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={handlePrevSong}>
          <SkipBack className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={togglePlayPause}>
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleNextSong}>
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Time Slider */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={audioRef.current ? audioRef.current.duration : 100}
          step={1}
          onValueChange={handleTimeChange}
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{audioRef.current ? formatTime(audioRef.current.duration) : "0:00"}</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={toggleMute}>
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : volume > 50 ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <Volume1 className="h-5 w-5" />
          )}
        </Button>
        <Slider value={[volume]} max={100} step={1} onValueChange={handleVolumeChange} className="w-3/4" />
      </div>

      {/* Other Controls */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={toggleRepeat} className={isRepeat ? "text-blue-500" : ""}>
          <Repeat className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleShuffle} className={isShuffle ? "text-blue-500" : ""}>
          <Shuffle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setIsShowPlaylist(!isShowPlaylist)}>
          <ListMusic className="h-5 w-5" />
        </Button>
      </div>

      {/* Upload Song */}
      <div className="mb-4">
        <label htmlFor="upload-song" className="flex items-center space-x-2 cursor-pointer">
          <Upload className="h-5 w-5" />
          <span className="text-sm">Upload Song</span>
        </label>
        <input type="file" id="upload-song" className="hidden" multiple onChange={handleFileUpload} accept="audio/*" />
      </div>

      {/* Playlist */}
      {isShowPlaylist && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Playlist</h3>
          <ul>
            {filteredSongs.map((song, index) => (
              <li
                key={song.id}
                className={`py-2 px-4 rounded-md cursor-pointer hover:bg-gray-200 ${currentSongIndex === index ? "bg-gray-200" : ""}`}
                onClick={() => playSong(index)}
              >
                {song.title} - {song.artist}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Helper function to format time in mm:ss
const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
}

