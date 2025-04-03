"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUp, FileDown, RefreshCw, ImageIcon, FileText, FileCode, FileAudio, FileVideo } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type FileCategory = "image" | "document" | "audio" | "video" | "code"

interface ConversionOption {
  from: string
  to: string[]
  category: FileCategory
}

export default function FileConverterPanel() {
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>("image")
  const [selectedFromFormat, setSelectedFromFormat] = useState<string>("")
  const [selectedToFormat, setSelectedToFormat] = useState<string>("")
  const [isConverting, setIsConverting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [conversionSettings, setConversionSettings] = useState<Record<string, any>>({
    quality: 80,
    resize: false,
    width: 800,
    height: 600,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const conversionOptions: ConversionOption[] = [
    { from: "jpg", to: ["png", "webp", "gif", "bmp"], category: "image" },
    { from: "png", to: ["jpg", "webp", "gif", "bmp"], category: "image" },
    { from: "webp", to: ["jpg", "png", "gif", "bmp"], category: "image" },
    { from: "gif", to: ["jpg", "png", "webp", "bmp"], category: "image" },
    { from: "bmp", to: ["jpg", "png", "webp", "gif"], category: "image" },

    { from: "doc", to: ["docx", "pdf", "txt", "html"], category: "document" },
    { from: "docx", to: ["doc", "pdf", "txt", "html"], category: "document" },
    { from: "pdf", to: ["docx", "txt", "html"], category: "document" },
    { from: "txt", to: ["pdf", "docx", "html"], category: "document" },
    { from: "html", to: ["pdf", "docx", "txt"], category: "document" },

    { from: "mp3", to: ["wav", "ogg", "flac", "m4a"], category: "audio" },
    { from: "wav", to: ["mp3", "ogg", "flac", "m4a"], category: "audio" },
    { from: "ogg", to: ["mp3", "wav", "flac", "m4a"], category: "audio" },
    { from: "flac", to: ["mp3", "wav", "ogg", "m4a"], category: "audio" },
    { from: "m4a", to: ["mp3", "wav", "ogg", "flac"], category: "audio" },

    { from: "mp4", to: ["avi", "mov", "webm", "mkv"], category: "video" },
    { from: "avi", to: ["mp4", "mov", "webm", "mkv"], category: "video" },
    { from: "mov", to: ["mp4", "avi", "webm", "mkv"], category: "video" },
    { from: "webm", to: ["mp4", "avi", "mov", "mkv"], category: "video" },
    { from: "mkv", to: ["mp4", "avi", "mov", "webm"], category: "video" },

    { from: "js", to: ["ts", "jsx", "json"], category: "code" },
    { from: "ts", to: ["js", "jsx", "json"], category: "code" },
    { from: "jsx", to: ["js", "ts", "tsx"], category: "code" },
    { from: "tsx", to: ["jsx", "ts", "js"], category: "code" },
    { from: "json", to: ["js", "ts", "yaml"], category: "code" },
    { from: "yaml", to: ["json", "xml"], category: "code" },
    { from: "xml", to: ["json", "yaml"], category: "code" },
  ]

  const filteredFromFormats = conversionOptions
    .filter((option) => option.category === selectedCategory)
    .map((option) => option.from)

  const filteredToFormats = selectedFromFormat
    ? conversionOptions.find((option) => option.from === selectedFromFormat && option.category === selectedCategory)
        ?.to || []
    : []

  const handleCategoryChange = (category: FileCategory) => {
    setSelectedCategory(category)
    setSelectedFromFormat("")
    setSelectedToFormat("")
    setSelectedFile(null)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    // Try to detect file format from extension
    const extension = file.name.split(".").pop()?.toLowerCase()
    if (extension && filteredFromFormats.includes(extension)) {
      setSelectedFromFormat(extension)
    }

    toast({
      title: "File Selected",
      description: `Selected ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
    })
  }

  const convertFile = () => {
    if (!selectedFile || !selectedFromFormat || !selectedToFormat) {
      toast({
        title: "Error",
        description: "Please select a file and conversion formats",
        variant: "destructive",
      })
      return
    }

    setIsConverting(true)

    // Simulate conversion process
    setTimeout(() => {
      setIsConverting(false)

      // Create a fake converted file for download
      const fileName = selectedFile.name.split(".")[0] + "." + selectedToFormat
      const blob = new Blob([selectedFile], { type: `application/${selectedToFormat}` })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Conversion Complete",
        description: `File converted to ${selectedToFormat} format`,
      })
    }, 2000)
  }

  const renderSettingsForCategory = () => {
    switch (selectedCategory) {
      case "image":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quality">Quality</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="quality"
                  type="number"
                  min="1"
                  max="100"
                  value={conversionSettings.quality}
                  onChange={(e) =>
                    setConversionSettings({
                      ...conversionSettings,
                      quality: Number.parseInt(e.target.value) || 80,
                    })
                  }
                />
                <span>%</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="resize"
                checked={conversionSettings.resize}
                onChange={(e) =>
                  setConversionSettings({
                    ...conversionSettings,
                    resize: e.target.checked,
                  })
                }
              />
              <Label htmlFor="resize">Resize Image</Label>
            </div>

            {conversionSettings.resize && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    min="1"
                    value={conversionSettings.width}
                    onChange={(e) =>
                      setConversionSettings({
                        ...conversionSettings,
                        width: Number.parseInt(e.target.value) || 800,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    type="number"
                    min="1"
                    value={conversionSettings.height}
                    onChange={(e) =>
                      setConversionSettings({
                        ...conversionSettings,
                        height: Number.parseInt(e.target.value) || 600,
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )

      case "document":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pageSize">Page Size</Label>
              <Select
                value={conversionSettings.pageSize || "a4"}
                onValueChange={(value) =>
                  setConversionSettings({
                    ...conversionSettings,
                    pageSize: value,
                  })
                }
              >
                <SelectTrigger id="pageSize">
                  <SelectValue placeholder="Select page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="margin">Margin (mm)</Label>
              <Input
                id="margin"
                type="number"
                min="0"
                value={conversionSettings.margin || 10}
                onChange={(e) =>
                  setConversionSettings({
                    ...conversionSettings,
                    margin: Number.parseInt(e.target.value) || 10,
                  })
                }
              />
            </div>
          </div>
        )

      case "audio":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bitrate">Bitrate (kbps)</Label>
              <Select
                value={conversionSettings.bitrate || "320"}
                onValueChange={(value) =>
                  setConversionSettings({
                    ...conversionSettings,
                    bitrate: value,
                  })
                }
              >
                <SelectTrigger id="bitrate">
                  <SelectValue placeholder="Select bitrate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="128">128 kbps</SelectItem>
                  <SelectItem value="192">192 kbps</SelectItem>
                  <SelectItem value="256">256 kbps</SelectItem>
                  <SelectItem value="320">320 kbps</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sampleRate">Sample Rate (Hz)</Label>
              <Select
                value={conversionSettings.sampleRate || "44100"}
                onValueChange={(value) =>
                  setConversionSettings({
                    ...conversionSettings,
                    sampleRate: value,
                  })
                }
              >
                <SelectTrigger id="sampleRate">
                  <SelectValue placeholder="Select sample rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="22050">22,050 Hz</SelectItem>
                  <SelectItem value="44100">44,100 Hz</SelectItem>
                  <SelectItem value="48000">48,000 Hz</SelectItem>
                  <SelectItem value="96000">96,000 Hz</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "video":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="videoQuality">Video Quality</Label>
              <Select
                value={conversionSettings.videoQuality || "high"}
                onValueChange={(value) =>
                  setConversionSettings({
                    ...conversionSettings,
                    videoQuality: value,
                  })
                }
              >
                <SelectTrigger id="videoQuality">
                  <SelectValue placeholder="Select video quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="ultra">Ultra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution</Label>
              <Select
                value={conversionSettings.resolution || "1080p"}
                onValueChange={(value) =>
                  setConversionSettings({
                    ...conversionSettings,
                    resolution: value,
                  })
                }
              >
                <SelectTrigger id="resolution">
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="480p">480p</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="4k">4K</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "code":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="indentation">Indentation</Label>
              <Select
                value={conversionSettings.indentation || "2spaces"}
                onValueChange={(value) =>
                  setConversionSettings({
                    ...conversionSettings,
                    indentation: value,
                  })
                }
              >
                <SelectTrigger id="indentation">
                  <SelectValue placeholder="Select indentation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2spaces">2 Spaces</SelectItem>
                  <SelectItem value="4spaces">4 Spaces</SelectItem>
                  <SelectItem value="tab">Tab</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="minify"
                checked={conversionSettings.minify || false}
                onChange={(e) =>
                  setConversionSettings({
                    ...conversionSettings,
                    minify: e.target.checked,
                  })
                }
              />
              <Label htmlFor="minify">Minify Output</Label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case "image":
        return <ImageIcon className="h-4 w-4 mr-2" />
      case "document":
        return <FileText className="h-4 w-4 mr-2" />
      case "audio":
        return <FileAudio className="h-4 w-4 mr-2" />
      case "video":
        return <FileVideo className="h-4 w-4 mr-2" />
      case "code":
        return <FileCode className="h-4 w-4 mr-2" />
    }
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="convert" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="convert">Convert</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="convert" className="flex-1 p-4 flex flex-col">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>File Category</Label>
              <div className="grid grid-cols-5 gap-2">
                {(["image", "document", "audio", "video", "code"] as FileCategory[]).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="flex flex-col items-center justify-center py-4"
                    onClick={() => handleCategoryChange(category)}
                  >
                    {getCategoryIcon(category)}
                    <span className="mt-1 text-xs capitalize">{category}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromFormat">From Format</Label>
                <Select
                  value={selectedFromFormat}
                  onValueChange={setSelectedFromFormat}
                  disabled={filteredFromFormats.length === 0}
                >
                  <SelectTrigger id="fromFormat">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredFromFormats.map((format) => (
                      <SelectItem key={format} value={format}>
                        {format.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toFormat">To Format</Label>
                <Select
                  value={selectedToFormat}
                  onValueChange={setSelectedToFormat}
                  disabled={!selectedFromFormat || filteredToFormats.length === 0}
                >
                  <SelectTrigger id="toFormat">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredToFormats.map((format) => (
                      <SelectItem key={format} value={format}>
                        {format.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Upload File</Label>
              <div
                className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                </p>
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                )}
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
              </div>
            </div>

            <Button
              className="w-full"
              onClick={convertFile}
              disabled={isConverting || !selectedFile || !selectedFromFormat || !selectedToFormat}
            >
              {isConverting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 mr-2" />
                  Convert File
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 p-4">
          <div className="space-y-6">
            <h3 className="font-medium">Conversion Settings</h3>

            {renderSettingsForCategory()}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

