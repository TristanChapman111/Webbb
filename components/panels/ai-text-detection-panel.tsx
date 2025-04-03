"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Copy, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { checkEssayForAI } from "@/lib/ai-service"

export default function AITextDetectionPanel() {
  const { toast } = useToast()
  const [text, setText] = useState("")
  const [result, setResult] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTextAnalysis = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to analyze",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const response = await checkEssayForAI(text)

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
      } else {
        setResult(response.text)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze text",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Simulate OCR processing
    setIsProcessing(true)
    setTimeout(() => {
      setExtractedText(
        "Sample extracted text from image. In a real implementation, this would use OCR technology to extract text from the uploaded image.",
      )
      setIsProcessing(false)

      toast({
        title: "Text Extracted",
        description: "Text has been extracted from the image",
      })
    }, 2000)
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    })
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="detector" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="detector">AI Text Detector</TabsTrigger>
          <TabsTrigger value="ocr">OCR Text Extraction</TabsTrigger>
        </TabsList>

        <TabsContent value="detector" className="flex-1 p-4 flex flex-col">
          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">Enter Text to Analyze</Label>
              <Textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste text here to check if it was written by AI..."
                className="min-h-[200px]"
              />
            </div>

            <Button onClick={handleTextAnalysis} disabled={isProcessing || !text.trim()} className="w-full">
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Analyze Text
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Analysis Results</h3>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(result)}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>

              <div className="flex-1 border rounded p-4 overflow-auto whitespace-pre-wrap">{result}</div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ocr" className="flex-1 p-4 flex flex-col">
          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <Label>Upload Image for Text Extraction</Label>
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Drag & drop an image or click to browse</p>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                  Select Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isProcessing}
                />
              </div>
            </div>

            {imagePreview && (
              <div className="space-y-2">
                <Label>Image Preview</Label>
                <div className="border rounded-md p-2 flex justify-center">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="max-h-[200px] object-contain"
                  />
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center p-4">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Processing image...</span>
              </div>
            )}

            {extractedText && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Extracted Text</Label>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(extractedText)}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

