"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  FileText,
  Upload,
  Download,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Printer,
  Trash,
  ChevronLeft,
  ChevronRight,
  Highlighter,
  Pencil,
  Text,
  Eraser,
  Save,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function PDFViewerPanel() {
  const { toast } = useToast()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfName, setPdfName] = useState<string>("")
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [searchText, setSearchText] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0)
  const [recentFiles, setRecentFiles] = useState<{ name: string; url: string; lastOpened: number }[]>([])
  const [annotationMode, setAnnotationMode] = useState<"none" | "highlight" | "draw" | "text" | "erase">("none")
  const [annotations, setAnnotations] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"single" | "double" | "continuous">("single")
  const [settings, setSettings] = useState({
    darkMode: false,
    highQuality: true,
    smoothScroll: true,
    showAnnotations: true,
    autoSave: true,
    pageTransitions: true,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load recent files from localStorage on initial render
  useEffect(() => {
    const savedRecentFiles = localStorage.getItem("pdf-recent-files")
    if (savedRecentFiles) {
      try {
        setRecentFiles(JSON.parse(savedRecentFiles))
      } catch (e) {
        console.error("Failed to parse saved recent files", e)
      }
    }

    // Load settings
    const savedSettings = localStorage.getItem("pdf-settings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error("Failed to parse saved settings", e)
      }
    }
  }, [])

  // Save recent files to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("pdf-recent-files", JSON.stringify(recentFiles))
  }, [recentFiles])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("pdf-settings", JSON.stringify(settings))
  }, [settings])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      toast({
        title: "Error",
        description: "Please upload a PDF file",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer
      const uint8Array = new Uint8Array(arrayBuffer)

      setPdfData(uint8Array)

      // Create a blob URL for the PDF
      const blob = new Blob([uint8Array], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)

      setPdfUrl(url)
      setPdfName(file.name)
      setCurrentPage(1)
      setZoom(100)
      setRotation(0)

      // Add to recent files
      const newRecentFile = {
        name: file.name,
        url: url,
        lastOpened: Date.now(),
      }

      setRecentFiles((prevFiles) => {
        // Remove duplicates
        const filteredFiles = prevFiles.filter((f) => f.name !== file.name)
        // Add new file at the beginning
        return [newRecentFile, ...filteredFiles].slice(0, 10) // Keep only 10 most recent
      })

      toast({
        title: "PDF Loaded",
        description: `Loaded ${file.name}`,
      })

      // Simulate getting total pages
      setTimeout(() => {
        setTotalPages(Math.floor(Math.random() * 20) + 5) // Random number between 5 and 24
      }, 500)
    }
    reader.readAsArrayBuffer(file)
  }

  const openRecentFile = (url: string, name: string) => {
    setPdfUrl(url)
    setPdfName(name)
    setCurrentPage(1)
    setZoom(100)
    setRotation(0)

    // Update last opened timestamp
    setRecentFiles((prevFiles) => prevFiles.map((f) => (f.url === url ? { ...f, lastOpened: Date.now() } : f)))

    // Simulate getting total pages
    setTimeout(() => {
      setTotalPages(Math.floor(Math.random() * 20) + 5) // Random number between 5 and 24
    }, 500)
  }

  const removeRecentFile = (url: string) => {
    setRecentFiles((prevFiles) => prevFiles.filter((f) => f.url !== url))

    // If the current PDF is being removed, clear it
    if (pdfUrl === url) {
      setPdfUrl(null)
      setPdfName("")
      setPdfData(null)
    }
  }

  const goToPage = (page: number) => {
    if (page < 1) page = 1
    if (page > totalPages) page = totalPages
    setCurrentPage(page)
  }

  const zoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 10, 200))
  }

  const zoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 10, 50))
  }

  const rotate = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360)
  }

  const search = () => {
    if (!searchText.trim()) return

    setIsSearching(true)

    // Simulate search
    setTimeout(() => {
      // Generate random search results
      const results = []
      const count = Math.floor(Math.random() * 5) + 1 // 1-5 results

      for (let i = 0; i < count; i++) {
        results.push({
          page: Math.floor(Math.random() * totalPages) + 1,
          text: searchText,
          context: `...text before ${searchText} text after...`,
        })
      }

      setSearchResults(results)
      setCurrentSearchIndex(0)
      setIsSearching(false)

      if (results.length > 0) {
        setCurrentPage(results[0].page)
        toast({
          title: "Search Results",
          description: `Found ${results.length} matches for "${searchText}"`,
        })
      } else {
        toast({
          title: "No Results",
          description: `No matches found for "${searchText}"`,
        })
      }
    }, 1000)
  }

  const goToNextSearchResult = () => {
    if (searchResults.length === 0) return

    const nextIndex = (currentSearchIndex + 1) % searchResults.length
    setCurrentSearchIndex(nextIndex)
    setCurrentPage(searchResults[nextIndex].page)
  }

  const goToPrevSearchResult = () => {
    if (searchResults.length === 0) return

    const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length
    setCurrentSearchIndex(prevIndex)
    setCurrentPage(searchResults[prevIndex].page)
  }

  const print = () => {
    if (!pdfUrl) return

    const printWindow = window.open(pdfUrl, "_blank")
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  const downloadPdf = () => {
    if (!pdfUrl || !pdfName) return

    const a = document.createElement("a")
    a.href = pdfUrl
    a.download = pdfName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const saveAnnotations = () => {
    if (!pdfName) return

    localStorage.setItem(`pdf-annotations-${pdfName}`, JSON.stringify(annotations))

    toast({
      title: "Annotations Saved",
      description: "Your annotations have been saved",
    })
  }

  const formatLastOpened = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="viewer" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="viewer">PDF Viewer</TabsTrigger>
          <TabsTrigger value="recent">Recent Files</TabsTrigger>
          <TabsTrigger value="annotations">Annotations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="viewer" className="flex-1 flex flex-col">
          {pdfUrl ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between p-2 border-b">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center">
                    <Input
                      type="number"
                      value={currentPage}
                      onChange={(e) => goToPage(Number.parseInt(e.target.value) || 1)}
                      className="w-16 text-center"
                      min={1}
                      max={totalPages}
                    />
                    <span className="mx-1">of {totalPages}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={zoomOut} disabled={zoom <= 50}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>

                  <span className="text-sm">{zoom}%</span>

                  <Button variant="outline" size="icon" onClick={zoomIn} disabled={zoom >= 200}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" size="icon" onClick={rotate}>
                    <RotateCw className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" size="icon" onClick={print}>
                    <Printer className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" size="icon" onClick={downloadPdf}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search..."
                    className="w-40"
                    onKeyDown={(e) => e.key === "Enter" && search()}
                  />

                  <Button variant="outline" size="icon" onClick={search} disabled={isSearching || !searchText.trim()}>
                    <Search className="h-4 w-4" />
                  </Button>

                  {searchResults.length > 0 && (
                    <>
                      <Button variant="outline" size="icon" onClick={goToPrevSearchResult}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <span className="text-xs">
                        {currentSearchIndex + 1}/{searchResults.length}
                      </span>

                      <Button variant="outline" size="icon" onClick={goToNextSearchResult}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center p-2 border-b">
                <div className="flex space-x-2">
                  <Button
                    variant={annotationMode === "highlight" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAnnotationMode(annotationMode === "highlight" ? "none" : "highlight")}
                  >
                    <Highlighter className="h-4 w-4 mr-1" />
                    Highlight
                  </Button>

                  <Button
                    variant={annotationMode === "draw" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAnnotationMode(annotationMode === "draw" ? "none" : "draw")}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Draw
                  </Button>

                  <Button
                    variant={annotationMode === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAnnotationMode(annotationMode === "text" ? "none" : "text")}
                  >
                    <Text className="h-4 w-4 mr-1" />
                    Text
                  </Button>

                  <Button
                    variant={annotationMode === "erase" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAnnotationMode(annotationMode === "erase" ? "none" : "erase")}
                  >
                    <Eraser className="h-4 w-4 mr-1" />
                    Erase
                  </Button>

                  <Button variant="outline" size="sm" onClick={saveAnnotations}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 flex justify-center" ref={containerRef}>
                <div
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                    transition: settings.pageTransitions ? "transform 0.3s ease" : "none",
                  }}
                  className="bg-white shadow-lg"
                >
                  {/* PDF Viewer */}
                  <iframe
                    src={`${pdfUrl}#page=${currentPage}`}
                    className="w-[800px] h-[1100px]"
                    title={pdfName}
                  ></iframe>

                  {/* Canvas for annotations */}
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 pointer-events-none"
                    width={800}
                    height={1100}
                  ></canvas>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No PDF file loaded</p>
              <p className="text-sm text-muted-foreground mb-4">Upload a PDF file to view it</p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-1" />
                Upload PDF
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="flex-1 p-4">
          <h3 className="font-medium mb-4">Recent Files</h3>

          {recentFiles.length > 0 ? (
            <div className="space-y-2">
              {recentFiles.map((file) => (
                <div
                  key={file.url}
                  className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatLastOpened(file.lastOpened)}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openRecentFile(file.url, file.name)}>
                      Open
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => removeRecentFile(file.url)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No recent files</p>
            </div>
          )}

          <div className="mt-4">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-1" />
              Upload New PDF
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="annotations" className="flex-1 p-4">
          <h3 className="font-medium mb-4">Annotations</h3>

          {pdfName ? (
            <div className="space-y-4">
              <p>Annotations for: {pdfName}</p>

              {annotations.length > 0 ? (
                <div className="space-y-2">
                  {annotations.map((annotation, index) => (
                    <div key={index} className="p-3 border rounded hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {annotation.type.charAt(0).toUpperCase() + annotation.type.slice(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">Page {annotation.page}</span>
                      </div>

                      {annotation.text && <p className="text-sm mt-1">{annotation.text}</p>}

                      <div className="flex justify-end mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAnnotations(annotations.filter((_, i) => i !== index))
                          }}
                        >
                          <Trash className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <p className="text-muted-foreground">No annotations yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use the annotation tools in the viewer to add annotations
                  </p>
                </div>
              )}

              <Button onClick={saveAnnotations}>
                <Save className="h-4 w-4 mr-1" />
                Save Annotations
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No PDF file loaded</p>
              <p className="text-xs text-muted-foreground mt-1">Load a PDF file to add annotations</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="flex-1 p-4">
          <div className="space-y-6">
            <h3 className="font-medium">PDF Viewer Settings</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">Use dark theme for the PDF viewer</p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-quality">High Quality Rendering</Label>
                  <p className="text-xs text-muted-foreground">Render PDFs in high quality (uses more resources)</p>
                </div>
                <Switch
                  id="high-quality"
                  checked={settings.highQuality}
                  onCheckedChange={(checked) => setSettings({ ...settings, highQuality: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smooth-scroll">Smooth Scrolling</Label>
                  <p className="text-xs text-muted-foreground">Enable smooth scrolling between pages</p>
                </div>
                <Switch
                  id="smooth-scroll"
                  checked={settings.smoothScroll}
                  onCheckedChange={(checked) => setSettings({ ...settings, smoothScroll: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-annotations">Show Annotations</Label>
                  <p className="text-xs text-muted-foreground">Display annotations on the PDF</p>
                </div>
                <Switch
                  id="show-annotations"
                  checked={settings.showAnnotations}
                  onCheckedChange={(checked) => setSettings({ ...settings, showAnnotations: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Auto-Save Annotations</Label>
                  <p className="text-xs text-muted-foreground">Automatically save annotations when made</p>
                </div>
                <Switch
                  id="auto-save"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="page-transitions">Page Transitions</Label>
                  <p className="text-xs text-muted-foreground">Enable smooth transitions between pages</p>
                </div>
                <Switch
                  id="page-transitions"
                  checked={settings.pageTransitions}
                  onCheckedChange={(checked) => setSettings({ ...settings, pageTransitions: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="view-mode">View Mode</Label>
                <Select
                  value={viewMode}
                  onValueChange={(value: "single" | "double" | "continuous") => setViewMode(value)}
                >
                  <SelectTrigger id="view-mode">
                    <SelectValue placeholder="Select view mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Page</SelectItem>
                    <SelectItem value="double">Double Page</SelectItem>
                    <SelectItem value="continuous">Continuous</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Zoom Level: {zoom}%</Label>
                <Slider value={[zoom]} min={50} max={200} step={10} onValueChange={(value) => setZoom(value[0])} />
              </div>

              <Button
                onClick={() => {
                  localStorage.setItem("pdf-settings", JSON.stringify(settings))
                  toast({
                    title: "Settings Saved",
                    description: "Your PDF viewer settings have been saved",
                  })
                }}
              >
                <Save className="h-4 w-4 mr-1" />
                Save Settings
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

