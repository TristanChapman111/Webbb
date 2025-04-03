"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Pencil, Eraser, Square, Circle, Type, Download, Trash, Undo, Redo, ImageIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function WhiteboardPanel() {
  const { toast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<"pencil" | "eraser" | "rectangle" | "circle" | "text">("pencil")
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [isDrawing, setIsDrawing] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [textInput, setTextInput] = useState("")
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 })
  const [showTextInput, setShowTextInput] = useState(false)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (!container) return

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight

      // Fill with white background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Save initial state
      saveToHistory()
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  const saveToHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // If we're not at the end of the history, remove everything after current index
    if (historyIndex !== history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1))
    }

    // Add current state to history
    const newHistory = [...history.slice(0, historyIndex + 1), canvas.toDataURL()]
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex <= 0) return

    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.src = history[newIndex]
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
    }
  }

  const redo = () => {
    if (historyIndex >= history.length - 1) return

    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.src = history[newIndex]
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)

    if (tool === "pencil") {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.strokeStyle = color
      ctx.lineWidth = brushSize
    } else if (tool === "eraser") {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = brushSize
    } else if (tool === "rectangle" || tool === "circle") {
      setStartPos({ x, y })
    } else if (tool === "text") {
      setTextPosition({ x, y })
      setShowTextInput(true)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === "pencil" || tool === "eraser") {
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (tool === "rectangle" || tool === "circle") {
      // Create a copy of the canvas before the shape
      const tempCanvas = document.createElement("canvas")
      tempCanvas.width = canvas.width
      tempCanvas.height = canvas.height
      const tempCtx = tempCanvas.getContext("2d")
      if (!tempCtx) return

      // Draw the previous state
      if (historyIndex >= 0) {
        const img = new Image()
        img.src = history[historyIndex]
        tempCtx.drawImage(img, 0, 0)
      }

      // Draw the shape
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(tempCanvas, 0, 0)

      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = brushSize

      if (tool === "rectangle") {
        ctx.rect(startPos.x, startPos.y, x - startPos.x, y - startPos.y)
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2))
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI)
      }

      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    if (tool !== "text") {
      saveToHistory()
    }
  }

  const addText = () => {
    if (!textInput.trim()) {
      setShowTextInput(false)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.font = `${brushSize * 2}px sans-serif`
    ctx.fillStyle = color
    ctx.fillText(textInput, textPosition.x, textPosition.y)

    setTextInput("")
    setShowTextInput(false)
    saveToHistory()
  }

  const clearCanvas = () => {
    if (confirm("Are you sure you want to clear the whiteboard?")) {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      saveToHistory()

      toast({
        title: "Whiteboard Cleared",
        description: "Your whiteboard has been cleared",
      })
    }
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = "whiteboard.png"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    toast({
      title: "Downloaded",
      description: "Whiteboard saved as whiteboard.png",
    })
  }

  const uploadImage = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = canvasRef.current
          if (!canvas) return

          const ctx = canvas.getContext("2d")
          if (!ctx) return

          // Calculate dimensions to fit the image
          const maxWidth = canvas.width * 0.8
          const maxHeight = canvas.height * 0.8

          let width = img.width
          let height = img.height

          if (width > maxWidth) {
            height = (maxWidth / width) * height
            width = maxWidth
          }

          if (height > maxHeight) {
            width = (maxHeight / height) * width
            height = maxHeight
          }

          // Center the image
          const x = (canvas.width - width) / 2
          const y = (canvas.height - height) / 2

          ctx.drawImage(img, x, y, width, height)
          saveToHistory()

          toast({
            title: "Image Uploaded",
            description: "Image has been added to the whiteboard",
          })
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }

    input.click()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center space-x-2">
          <Button variant={tool === "pencil" ? "default" : "outline"} size="icon" onClick={() => setTool("pencil")}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant={tool === "eraser" ? "default" : "outline"} size="icon" onClick={() => setTool("eraser")}>
            <Eraser className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === "rectangle" ? "default" : "outline"}
            size="icon"
            onClick={() => setTool("rectangle")}
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button variant={tool === "circle" ? "default" : "outline"} size="icon" onClick={() => setTool("circle")}>
            <Circle className="h-4 w-4" />
          </Button>
          <Button variant={tool === "text" ? "default" : "outline"} size="icon" onClick={() => setTool("text")}>
            <Type className="h-4 w-4" />
          </Button>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
          />
          <div className="w-24">
            <Slider value={[brushSize]} min={1} max={20} step={1} onValueChange={(value) => setBrushSize(value[0])} />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={undo} disabled={historyIndex <= 0}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={uploadImage}>
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={downloadCanvas}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={clearCanvas}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative bg-white">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />

        {showTextInput && (
          <div
            className="absolute p-2 bg-white border rounded shadow-lg"
            style={{ left: textPosition.x, top: textPosition.y }}
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addText()}
              className="border p-1 text-sm w-40"
              autoFocus
            />
            <div className="flex justify-end mt-1 space-x-1">
              <Button size="sm" variant="outline" onClick={() => setShowTextInput(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={addText}>
                Add
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

