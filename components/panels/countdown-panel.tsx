"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RefreshCw, Plus, Trash, Bell, BellOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Timer {
  id: string
  name: string
  duration: number
  remaining: number
  isRunning: boolean
}

export default function CountdownPanel() {
  const { toast } = useToast()
  const [timers, setTimers] = useState<Timer[]>([])
  const [newTimerName, setNewTimerName] = useState("")
  const [newTimerHours, setNewTimerHours] = useState(0)
  const [newTimerMinutes, setNewTimerMinutes] = useState(5)
  const [newTimerSeconds, setNewTimerSeconds] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [presetType, setPresetType] = useState("custom")

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLHPM+N2TQwUHJFvI/fXDcCoFBgpKuPz/8dB3MQkFAjhpxf7//958HwsNAzFNq/f///zhfxwMDQMgNIjw/v//9KAWDhMDECJ4AAAAAAD7rhMSFgMJFWkAAAAAAPnBEBIbAwkOY/L5/P/++MwKEiEEBwpU5fb5//v42wYQKAQGCEjX9Pj//vfmBQ0vBQUFPsjy+P/++OoECjYFBQY0uPH4///47QMFPgYEBSqq8Pn///fvAwNFBwQFIZrv+f///PADAVIIBAQVJOD6///+9wMBYAoEBA4QHfX9///8+AICaQsEAwoLHPP9///7+QICcQwDAQYHG/L9///6+gIBdg4DAQMFG/H9///5+wEAexACAQIEGvD9///4/AEAfBECAQADGu/9///3/QEAfRMBAAAAGe79///2/gAAfxQBAAAAABnu/f//9f8AAH8VAAAAAAAY7f3///QAAAB/FgAAAAAAF+39///zAQAAfxcAAAAAABbs/f//8gIAAH4YAAAAAAAV7P3///EDAAB9GQAAAAAAFOv9///wBAAAfBoAAAAAABPr/f//7wUAAHsbAAAAAAAR6/3//+4GAABZHAAAAAAAEOr9///tBwAAQR0AAAAAABDq/f//7AgAACoeAAAAAAAP6f3//+sJAAAQHwAAAAAADun9///qCgAA+B8AAAAAABPp/f//6QsAAOAgAAAAAAAN6P3//+gMAADIIQAAAAAADej9///nDQAAsCIAAAAAAA3n/f//5g4AAJgjAAAAAAAM5/3//+UPAACBJAAAAAAADOb9///kEAAAbCUAAAAAAAvl/f//4xEAAFcmAAAAAAAL5f3//+ISAABDJwAAAAAACuT9///hEwAALygAAAAAAArl/f//4BQAABwpAAAAAAAJ5P3//98VAAAKKgAAAAAACeT9///eFgAA+CoAAAAAAAjj/f//3RcAAOcrAAAAAAAI4/3//9wYAADWLAAAAAAACOP9///bGQAAxS0AAAAAAAfi/f//2hoAALUuAAAAAAAH4v3//9kbAACmLwAAAAAAB+L9///YHAAAljAAAAAAAabi/f//1x0AAIcxAAAAAACW4v3//9YeAAB5MgAAAAAAgOL9///VHwAAazMAAAAAACLi/f//1CAAAFw0AAAAAAAA4f3//9MhAABONQAAAAAAAOH9///SIgAAPzYAAAAAAADh/f//0SMAADE3AAAAAAAA4P3//9AkAAAjOAAAAAAAAOD9///PJQAAFTkAAAAAAADg/f//ziYAAAc6AAAAAAAA3/3//80nAAD5OgAAAAAAAOD9///MKAAA7DsAAAAAAADf/f//yykAAOA8AAAAAAAA3/3//8oqAADTPQAAAAAAAOD9///JKwAAyD4AAAAAAADf/f//yC0AALw/AAAAAAAA3/3//8cuAACwQAAAAAAAAN/9///GMAAAZEEAAAAAAADP/f//xTEAAFhCAAAAAACY3/3//8QyAABMQwAAAAAASN/9///DNAAAQEQAAAAAABjf/f//wjUAADRFAAAAAAAo3/3//8E2AAAoRgAAAAAAON/9///ANwAAHEcAAAAAAEjf/f//vzkAABBIAAAAAABY3/3//75KAAAFSQAAAAAAaN/9//+9SwAA+UkAAAAAAHjf/f//vEwAAO5KAAAAAACo3/3//7tNAADjSwAAAAAAuN/9//+6TgAA2EwAAAAAAMjf/f//uU8AAM1NAAAAAAAA4P3//7hQAADCTgAAAAAAAOD9//+3UQAAt08AAAAAAADg/f//tlIAAKxQAAAAAAAA4P3//7VTAACiUQAAAAAAAOH9//+0VAAAl1IAAAAAAADh/f//s1UAAIxTAAAAAAAA4f3//7JWAACCVAAAAAAAAOz9//+xVwAA",
    )
  }, [])

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) =>
        prevTimers.map((timer) => {
          if (timer.isRunning && timer.remaining > 0) {
            const newRemaining = timer.remaining - 1

            // Play sound when timer reaches zero
            if (newRemaining === 0 && soundEnabled && audioRef.current) {
              audioRef.current.play()

              toast({
                title: `Timer Complete: ${timer.name}`,
                description: "Your countdown timer has finished",
              })
            }

            return { ...timer, remaining: newRemaining }
          }
          return timer
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [soundEnabled, toast])

  const addTimer = () => {
    if (!newTimerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a timer name",
        variant: "destructive",
      })
      return
    }

    const totalSeconds = newTimerHours * 3600 + newTimerMinutes * 60 + newTimerSeconds

    if (totalSeconds <= 0) {
      toast({
        title: "Error",
        description: "Please set a time greater than zero",
        variant: "destructive",
      })
      return
    }

    const newTimer: Timer = {
      id: Date.now().toString(),
      name: newTimerName,
      duration: totalSeconds,
      remaining: totalSeconds,
      isRunning: false,
    }

    setTimers([...timers, newTimer])

    // Reset form
    setNewTimerName("")

    toast({
      title: "Timer Added",
      description: `Added timer: ${newTimerName}`,
    })
  }

  const toggleTimer = (id: string) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) => (timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer)),
    )
  }

  const resetTimer = (id: string) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) => (timer.id === id ? { ...timer, remaining: timer.duration, isRunning: false } : timer)),
    )
  }

  const deleteTimer = (id: string) => {
    setTimers((prevTimers) => prevTimers.filter((timer) => timer.id !== id))
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const handlePresetChange = (value: string) => {
    setPresetType(value)

    switch (value) {
      case "pomodoro":
        setNewTimerName("Pomodoro")
        setNewTimerHours(0)
        setNewTimerMinutes(25)
        setNewTimerSeconds(0)
        break
      case "shortbreak":
        setNewTimerName("Short Break")
        setNewTimerHours(0)
        setNewTimerMinutes(5)
        setNewTimerSeconds(0)
        break
      case "longbreak":
        setNewTimerName("Long Break")
        setNewTimerHours(0)
        setNewTimerMinutes(15)
        setNewTimerSeconds(0)
        break
      case "custom":
        setNewTimerName("")
        setNewTimerHours(0)
        setNewTimerMinutes(5)
        setNewTimerSeconds(0)
        break
    }
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Countdown Timers</h3>
          <Button variant="outline" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-4 border rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Timer Type</Label>
              <Select value={presetType} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="pomodoro">Pomodoro (25min)</SelectItem>
                  <SelectItem value="shortbreak">Short Break (5min)</SelectItem>
                  <SelectItem value="longbreak">Long Break (15min)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timer-name">Timer Name</Label>
              <Input
                id="timer-name"
                value={newTimerName}
                onChange={(e) => setNewTimerName(e.target.value)}
                placeholder="Enter timer name"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label htmlFor="timer-hours">Hours</Label>
                <Input
                  id="timer-hours"
                  type="number"
                  min="0"
                  max="23"
                  value={newTimerHours}
                  onChange={(e) => setNewTimerHours(Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timer-minutes">Minutes</Label>
                <Input
                  id="timer-minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={newTimerMinutes}
                  onChange={(e) => setNewTimerMinutes(Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timer-seconds">Seconds</Label>
                <Input
                  id="timer-seconds"
                  type="number"
                  min="0"
                  max="59"
                  value={newTimerSeconds}
                  onChange={(e) => setNewTimerSeconds(Number.parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <Button onClick={addTimer} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Timer
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {timers.length > 0 ? (
          <div className="space-y-2">
            {timers.map((timer) => (
              <div
                key={timer.id}
                className={`
                  border rounded-lg p-4 flex flex-col
                  ${timer.isRunning ? "border-primary" : ""}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{timer.name}</h4>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteTimer(timer.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-3xl font-mono text-center my-2">{formatTime(timer.remaining)}</div>

                <div className="flex items-center justify-center space-x-2 mt-2">
                  <Button
                    variant={timer.isRunning ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleTimer(timer.id)}
                    disabled={timer.remaining === 0}
                  >
                    {timer.isRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                    {timer.isRunning ? "Pause" : "Start"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => resetTimer(timer.id)}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>

                <div className="w-full bg-muted h-1 mt-4 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-1000"
                    style={{ width: `${(timer.remaining / timer.duration) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="text-muted-foreground mb-2">No timers added yet</div>
            <p className="text-sm text-muted-foreground">Add a timer using the form above</p>
          </div>
        )}
      </div>
    </div>
  )
}

