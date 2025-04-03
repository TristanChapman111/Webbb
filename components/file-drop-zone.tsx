"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { type File, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { detectPanelFromFile } from "@/lib/ai-service"

interface FileDropZoneProps {
  onFileDetected: (
    fileType: string,
    fileContent: string | ArrayBuffer | null,
    fileName: string,
    panelType: string,
  ) => void
}

export default function FileDropZone({ onFileDetected }: FileDropZoneProps) {
  const { toast } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsDragging(false)

      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setIsProcessing(true)

      toast({
        title: "Processing File",
        description: `Analyzing ${file.name}...`,
      })

      const reader = new FileReader()

      reader.onload = async (event) => {
        const fileContent = event.target?.result

        // Detect file type
        let fileType = "generic"
        if (file.type.startsWith("image/")) {
          fileType = "image"
        } else if (file.type === "application/pdf") {
          fileType = "pdf"
        } else if (
          file.type === "text/plain" ||
          file.type === "text/markdown" ||
          file.type === "application/json" ||
          file.type === "text/html" ||
          file.type === "text/css" ||
          file.type === "application/javascript"
        ) {
          fileType = "code"
        } else if (file.type.startsWith("audio/")) {
          fileType = "audio"
        } else if (file.type.startsWith("video/")) {
          fileType = "video"
        }

        // Use AI to detect appropriate panel
        try {
          const aiResponse = await detectPanelFromFile(file.name, fileType)
          let panelType = aiResponse.text.trim().toLowerCase()

          // Fallback if AI doesn't provide a valid panel
          if (!panelType || panelType.includes("error")) {
            // Default mappings
            if (fileType === "image") panelType = "image-editor"
            else if (fileType === "pdf") panelType = "pdf-viewer"
            else if (fileType === "code") panelType = "code"
            else if (fileType === "audio") panelType = "music"
            else if (fileType === "video") panelType = "browser"
            else panelType = "notes"
          }

          onFileDetected(fileType, fileContent, file.name, panelType)

          toast({
            title: "File Processed",
            description: `Opening ${file.name} in ${panelType} panel`,
          })
        } catch (error) {
          console.error("Error detecting panel:", error)
          // Fallback to basic detection
          let panelType = "notes"
          if (fileType === "image") panelType = "image-editor"
          else if (fileType === "pdf") panelType = "pdf-viewer"
          else if (fileType === "code") panelType = "code"
          else if (fileType === "audio") panelType = "music"
          else if (fileType === "video") panelType = "browser"

          onFileDetected(fileType, fileContent, file.name, panelType)

          toast({
            title: "File Processed",
            description: `Opening ${file.name} in ${panelType} panel`,
          })
        }

        setIsProcessing(false)
      }

      if (file.type.startsWith("image/") || file.type.startsWith("audio/") || file.type.startsWith("video/")) {
        reader.readAsDataURL(file)
      } else {
        reader.readAsText(file)
      }
    },
    [onFileDetected, toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  })

  // Update isDragging state based on isDragActive
  useEffect(() => {
    setIsDragging(isDragActive)
  }, [isDragActive])

  return (
    <div {...getRootProps()} className={`fixed inset-0 z-50 pointer-events-none ${isDragging ? "bg-primary/20" : ""}`}>
      <input {...getInputProps()} />
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 border-2 border-dashed border-primary rounded-lg pointer-events-none">
          <div className="text-center p-8 rounded-lg">
            <Upload className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">Drop File to Analyze</h3>
            <p className="text-muted-foreground">
              AI will automatically detect the file type and open the appropriate panel
            </p>
          </div>
        </div>
      )}
      {isProcessing && (
        <div className="fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <p>Processing file with AI...</p>
          </div>
        </div>
      )}
    </div>
  )
}

