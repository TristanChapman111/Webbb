"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"
import { Rnd } from "react-rnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Minimize, Maximize } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PanelContainerProps {
  id: string
  title: string
  children: ReactNode
  position: { x: number; y: number }
  size: { width: number; height: number }
  onRemove: () => void
  onPositionChange: (position: { x: number; y: number }) => void
  onSizeChange: (size: { width: number; height: number }) => void
  zIndex?: number
  isNew?: boolean
}

export default function PanelContainer({
  id,
  title,
  children,
  position,
  size,
  onRemove,
  onPositionChange,
  onSizeChange,
  zIndex = 10,
  isNew = false,
}: PanelContainerProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [prevSize, setPrevSize] = useState(size)
  const [prevPosition, setPrevPosition] = useState(position)
  const [isDragging, setIsDragging] = useState(false)
  const [hasBeenPlaced, setHasBeenPlaced] = useState(false)
  const [showNodAnimation, setShowNodAnimation] = useState(false)
  const rndRef = useRef<Rnd>(null)

  // Trigger nod animation when panel is placed
  useEffect(() => {
    if (isDragging === false && hasBeenPlaced) {
      setShowNodAnimation(true)
      const timer = setTimeout(() => {
        setShowNodAnimation(false)
      }, 500) // Animation duration
      return () => clearTimeout(timer)
    }
  }, [isDragging, hasBeenPlaced])

  // Entrance animation for new panels
  useEffect(() => {
    if (isNew) {
      // Trigger nod animation after a short delay for new panels
      const timer = setTimeout(() => {
        setShowNodAnimation(true)
        setTimeout(() => setShowNodAnimation(false), 500)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isNew])

  const toggleMinimize = () => {
    if (isFullscreen) {
      toggleFullscreen()
    }
    setIsMinimized(!isMinimized)
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setPrevSize(size)
      setPrevPosition(position)
      setIsFullscreen(true)
    } else {
      onSizeChange(prevSize)
      onPositionChange(prevPosition)
      setIsFullscreen(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={isNew ? { scale: 0.8, opacity: 0 } : false}
        animate={{
          scale: showNodAnimation ? [1, 1.02, 0.98, 1] : 1,
          opacity: 1,
          x: position.x,
          y: position.y,
          width: isFullscreen ? window.innerWidth : isMinimized ? size.width : size.width,
          height: isFullscreen ? window.innerHeight - 100 : isMinimized ? 40 : size.height,
          zIndex,
        }}
        transition={{
          scale: { duration: 0.5, ease: "easeInOut" },
          opacity: { duration: 0.3 },
          x: { type: "spring", stiffness: 300, damping: 30 },
          y: { type: "spring", stiffness: 300, damping: 30 },
        }}
        style={{
          position: "absolute",
        }}
      >
        <Rnd
          ref={rndRef}
          position={isFullscreen ? { x: 0, y: 0 } : { x: 0, y: 0 }} // Local position is always 0,0 as we use the motion.div for positioning
          size={
            isFullscreen
              ? { width: window.innerWidth, height: window.innerHeight - 100 }
              : isMinimized
                ? { width: size.width, height: 40 }
                : size
          }
          onDragStart={() => {
            setIsDragging(true)
          }}
          onDragStop={(e, d) => {
            setIsDragging(false)
            setHasBeenPlaced(true)
            if (!isFullscreen) {
              const newPosition = { x: position.x + d.x, y: position.y + d.y }
              onPositionChange(newPosition)

              // Reset Rnd position to 0,0 since we're using the motion.div for actual positioning
              if (rndRef.current) {
                rndRef.current.updatePosition({ x: 0, y: 0 })
              }
            }
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            if (!isFullscreen && !isMinimized) {
              onSizeChange({
                width: Number.parseInt(ref.style.width),
                height: Number.parseInt(ref.style.height),
              })

              // When resizing, we need to update the position as well
              const newPosition = {
                x: position.x + position.x,
                y: position.y + position.y,
              }
              onPositionChange(newPosition)

              // Reset Rnd position to 0,0
              if (rndRef.current) {
                rndRef.current.updatePosition({ x: 0, y: 0 })
              }
            }
          }}
          dragHandleClassName="drag-handle"
          bounds={null} // Disable bounds to allow free movement
          minWidth={200}
          minHeight={isMinimized ? 40 : 200}
          disableDragging={isFullscreen}
          enableResizing={!isFullscreen && !isMinimized}
          className="absolute"
        >
          <Card className="w-full h-full overflow-hidden shadow-lg border">
            <CardHeader className="p-2 drag-handle cursor-move flex flex-row items-center justify-between">
              <CardTitle className="text-sm truncate">{title}</CardTitle>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleMinimize}>
                  <Minimize className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            {!isMinimized && (
              <CardContent className="p-0 overflow-auto" style={{ height: "calc(100% - 40px)" }}>
                {children}
              </CardContent>
            )}
          </Card>
        </Rnd>
      </motion.div>
    </AnimatePresence>
  )
}

