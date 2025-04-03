"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wand2, Code, RefreshCw, Copy, Download, Play, Sparkles, Search, Plus, FileCode, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { generatePanelCode, detectPanelFromText } from "@/lib/ai-service"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface AIPanelCreatorAdvancedProps {
  onCreatePanel: (code: string, name: string) => void
  onAddExistingPanel: (type: string) => void
  existingPanelTypes: string[]
  initialSearchQuery?: string
  autoCreateMode?: boolean
}

export default function AIPanelCreatorAdvanced({
  onCreatePanel,
  onAddExistingPanel,
  existingPanelTypes,
  initialSearchQuery = "",
  autoCreateMode = false,
}: AIPanelCreatorAdvancedProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<{ type: string; name: string; description: string }[]>([])
  const [panelDescription, setPanelDescription] = useState(initialSearchQuery)
  const [generatedCode, setGeneratedCode] = useState("")
  const [panelName, setPanelName] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [advancedSettings, setAdvancedSettings] = useState({
    includeSettings: true,
    includeKeyboardShortcuts: true,
    includeAIIntegration: true,
    includeThemeSupport: true,
    includeAccessibility: true,
    includeResponsiveness: true,
    includeLocalStorage: false, // Set to false for temporary panels
    includeErrorHandling: true,
  })
  const [codeStyle, setCodeStyle] = useState("modern")
  const [complexity, setComplexity] = useState("medium")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const createTabRef = useRef<HTMLDivElement>(null)

  // Panel type mapping for search
  const panelTypeMapping = {
    settings: { name: "Settings Panel", description: "Customize application settings and preferences" },
    code: { name: "Code Editor", description: "Write and edit code with syntax highlighting" },
    browser: { name: "Web Browser", description: "Browse websites within the application" },
    notes: { name: "Notes", description: "Take and save notes with formatting options" },
    terminal: { name: "Terminal", description: "Command-line interface for executing commands" },
    whiteboard: { name: "Whiteboard", description: "Draw and collaborate on a digital canvas" },
    camera: { name: "Camera", description: "Access and control your camera with filters" },
    ai: { name: "AI Assistant", description: "Get help from an AI assistant" },
    countdown: { name: "Countdown Timer", description: "Set and manage countdown timers" },
    music: { name: "Music Player", description: "Play and manage music files" },
    search: { name: "Search", description: "Search the web or local content" },
    keyboard: { name: "Keyboard Shortcuts", description: "View and customize keyboard shortcuts" },
    "ai-text-detection": { name: "AI Text Detection", description: "Detect AI-generated text" },
    automation: { name: "Automation", description: "Create and run automated tasks" },
    "task-manager": { name: "Task Manager", description: "Manage and organize tasks" },
    clipboard: { name: "Clipboard Manager", description: "Manage clipboard history" },
    "file-converter": { name: "File Converter", description: "Convert files between formats" },
    game: { name: "Game Panel", description: "Play and manage games" },
    "pdf-viewer": { name: "PDF Viewer", description: "View and annotate PDF files" },
    calculator: { name: "Calculator", description: "Perform calculations" },
    weather: { name: "Weather", description: "Check weather forecasts" },
    translator: { name: "Translator", description: "Translate text between languages" },
    "password-manager": { name: "Password Manager", description: "Securely store and manage passwords" },
    "color-picker": { name: "Color Picker", description: "Pick and manage colors" },
    "qr-code": { name: "QR Code Generator", description: "Generate and scan QR codes" },
    "voice-recorder": { name: "Voice Recorder", description: "Record and manage voice notes" },
    "image-editor": { name: "Image Editor", description: "Edit and manipulate images" },
    "math-solver": { name: "Math Solver", description: "Solve mathematical equations" },
    "flash-cards": { name: "Flash Cards", description: "Create and study flash cards" },
    "regex-tester": { name: "Regex Tester", description: "Test and debug regular expressions" },
    "habit-tracker": { name: "Habit Tracker", description: "Track and manage habits" },
    "meal-planner": { name: "Meal Planner", description: "Plan and organize meals" },
    "workout-generator": { name: "Workout Generator", description: "Generate workout routines" },
    "sleep-tracker": { name: "Sleep Tracker", description: "Track and analyze sleep patterns" },
    "music-finder": { name: "Music Finder", description: "Find music based on preferences" },
    "meme-creator": { name: "Meme Creator", description: "Create and share memes" },
    "shopping-assistant": { name: "Shopping Assistant", description: "Get help with shopping" },
    "multi-search": { name: "Multi-Search", description: "Search multiple sources at once" },
    "weather-dashboard": { name: "Weather Dashboard", description: "Comprehensive weather information" },
    "decision-maker": { name: "Decision Maker", description: "Get help making decisions" },
    "noise-generator": { name: "Noise Generator", description: "Generate background noise" },
    analytics: { name: "Analytics", description: "Analyze data and generate insights" },
    "quick-access": { name: "Quick Access", description: "Quickly access frequently used features" },
    "reverse-image-search": { name: "Reverse Image Search", description: "Search for images by image" },
    "window-resizer": { name: "Window Resizer", description: "Resize and arrange windows" },
    "podcast-generator": { name: "Podcast Generator", description: "Generate podcast content" },
  }

  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }

    // If in auto-create mode and we have an initial search query, start the auto-creation process
    if (autoCreateMode && initialSearchQuery) {
      handleSearch(true)
    }
  }, [autoCreateMode, initialSearchQuery])

  const handleSearch = async (autoCreate = false) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchResults([])

    try {
      // First, check if we have an existing panel type that matches
      const matchingPanels = Object.entries(panelTypeMapping)
        .filter(([type, info]) => {
          return (
            type.includes(searchQuery.toLowerCase()) ||
            info.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            info.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
        })
        .map(([type, info]) => ({
          type,
          name: info.name,
          description: info.description,
        }))

      if (matchingPanels.length > 0) {
        setSearchResults(matchingPanels)

        // If in auto-create mode, automatically add the first matching panel
        if (autoCreate) {
          onAddExistingPanel(matchingPanels[0].type)
          return
        }
      } else {
        // If no existing panels match, ask AI to detect what kind of panel this might be
        const response = await detectPanelFromText(searchQuery)

        if (response.text && panelTypeMapping[response.text.toLowerCase().trim()]) {
          const detectedType = response.text.toLowerCase().trim()
          setSearchResults([
            {
              type: detectedType,
              name: panelTypeMapping[detectedType].name,
              description: panelTypeMapping[detectedType].description,
            },
          ])

          // If in auto-create mode, automatically add the detected panel
          if (autoCreate) {
            onAddExistingPanel(detectedType)
            return
          }
        } else {
          // If AI couldn't detect a matching panel, suggest creating a custom one
          setPanelDescription(searchQuery)
          setPanelName(formatPanelName(searchQuery))

          // If in auto-create mode, automatically generate a custom panel
          if (autoCreate) {
            // Switch to create tab
            if (createTabRef.current) {
              createTabRef.current.click()
            }

            // Auto-generate the panel
            await autoGeneratePanel(searchQuery)
            return
          }

          toast({
            title: "No matching panel found",
            description: "Would you like to create a custom panel based on your search?",
          })
        }
      }
    } catch (error) {
      console.error("Error searching for panel:", error)
      toast({
        title: "Search Error",
        description: "Failed to search for matching panels",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const formatPanelName = (query: string) => {
    // Format the query into a proper panel name
    return (
      query
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ") + " Panel"
    )
  }

  const autoGeneratePanel = async (query: string) => {
    setIsGenerating(true)

    try {
      // Enhance the prompt with advanced settings
      let enhancedDescription = query

      if (advancedSettings.includeSettings) {
        enhancedDescription += " Include comprehensive settings and customization options."
      }

      if (advancedSettings.includeKeyboardShortcuts) {
        enhancedDescription += " Support keyboard shortcuts for all major actions."
      }

      if (advancedSettings.includeAIIntegration) {
        enhancedDescription += " Integrate with AI services for enhanced functionality."
      }

      if (advancedSettings.includeThemeSupport) {
        enhancedDescription += " Support light and dark themes."
      }

      if (advancedSettings.includeAccessibility) {
        enhancedDescription += " Ensure accessibility compliance."
      }

      if (advancedSettings.includeResponsiveness) {
        enhancedDescription += " Make the UI fully responsive."
      }

      if (advancedSettings.includeLocalStorage) {
        enhancedDescription += " Persist state in localStorage."
      }

      if (advancedSettings.includeErrorHandling) {
        enhancedDescription += " Include comprehensive error handling."
      }

      enhancedDescription += ` Use a ${codeStyle} coding style with ${complexity} complexity.`

      const response = await generatePanelCode(enhancedDescription)

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
      } else {
        setGeneratedCode(response.text)

        // If in auto-create mode, automatically create the panel
        if (autoCreateMode) {
          onCreatePanel(response.text, formatPanelName(query))
        }

        toast({
          title: "Code Generated",
          description: "Panel code has been generated successfully",
        })
      }
    } catch (error) {
      console.error("Error generating panel code:", error)
      toast({
        title: "Error",
        description: "Failed to generate panel code",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generatePanel = async () => {
    if (!panelDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a panel description",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Enhance the prompt with advanced settings
      let enhancedDescription = panelDescription

      if (advancedSettings.includeSettings) {
        enhancedDescription += " Include comprehensive settings and customization options."
      }

      if (advancedSettings.includeKeyboardShortcuts) {
        enhancedDescription += " Support keyboard shortcuts for all major actions."
      }

      if (advancedSettings.includeAIIntegration) {
        enhancedDescription += " Integrate with AI services for enhanced functionality."
      }

      if (advancedSettings.includeThemeSupport) {
        enhancedDescription += " Support light and dark themes."
      }

      if (advancedSettings.includeAccessibility) {
        enhancedDescription += " Ensure accessibility compliance."
      }

      if (advancedSettings.includeResponsiveness) {
        enhancedDescription += " Make the UI fully responsive."
      }

      if (advancedSettings.includeLocalStorage) {
        enhancedDescription += " Persist state in localStorage."
      }

      if (advancedSettings.includeErrorHandling) {
        enhancedDescription += " Include comprehensive error handling."
      }

      enhancedDescription += ` Use a ${codeStyle} coding style with ${complexity} complexity.`

      const response = await generatePanelCode(enhancedDescription)

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
      } else {
        setGeneratedCode(response.text)

        // Extract panel name from description if not set
        if (!panelName) {
          const nameMatch = panelDescription.match(
            /(?:create|build|make|develop)\s+(?:a|an)\s+([a-zA-Z\s]+?)(?:\s+panel|\s+component|$)/i,
          )
          if (nameMatch && nameMatch[1]) {
            const extractedName = nameMatch[1].trim()
            setPanelName(extractedName.charAt(0).toUpperCase() + extractedName.slice(1) + " Panel")
          } else {
            setPanelName("Custom Panel")
          }
        }

        toast({
          title: "Code Generated",
          description: "Panel code has been generated successfully",
        })
      }
    } catch (error) {
      console.error("Error generating panel code:", error)
      toast({
        title: "Error",
        description: "Failed to generate panel code",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreatePanel = () => {
    if (!generatedCode) {
      toast({
        title: "Error",
        description: "Please generate code first",
        variant: "destructive",
      })
      return
    }

    if (!panelName) {
      toast({
        title: "Error",
        description: "Please enter a panel name",
        variant: "destructive",
      })
      return
    }

    onCreatePanel(generatedCode, panelName)

    toast({
      title: "Panel Created",
      description: `${panelName} has been created and added to your workspace`,
    })

    // Reset form
    setSearchQuery("")
    setPanelDescription("")
    setGeneratedCode("")
    setPanelName("")
    setSearchResults([])
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    toast({
      title: "Copied",
      description: "Code copied to clipboard",
    })
  }

  const downloadCode = () => {
    const fileName = panelName.toLowerCase().replace(/\s+/g, "-") + ".tsx"
    const blob = new Blob([generatedCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded",
      description: `Code saved as ${fileName}`,
    })
  }

  // If in auto-create mode, show a loading state
  if (autoCreateMode && isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <h3 className="text-lg font-medium">Creating Custom Panel</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            AI is generating a custom panel based on your search query: "{initialSearchQuery}"
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="search" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="search">Search Panels</TabsTrigger>
          <TabsTrigger value="create" ref={createTabRef}>
            Create Panel
          </TabsTrigger>
          <TabsTrigger value="code">Generated Code</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="flex-1 p-4 flex flex-col">
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a panel or describe what you need..."
                  className="pl-8"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={() => handleSearch()} disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {searchResults.map((result, index) => (
                  <Card key={index} className="hover:bg-muted/50 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{result.name}</CardTitle>
                      <CardDescription>{result.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button onClick={() => onAddExistingPanel(result.type)} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Panel
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : searchQuery && !isSearching ? (
              <div className="flex flex-col items-center justify-center mt-8 text-center">
                <FileCode className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No matching panels found</h3>
                <p className="text-muted-foreground mb-4">
                  Would you like to create a custom panel based on your search?
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => {
                      setPanelDescription(searchQuery)
                      setPanelName(formatPanelName(searchQuery))
                      if (createTabRef.current) {
                        createTabRef.current.click()
                      }
                    }}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Create Custom Panel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      setPanelDescription(searchQuery)
                      setPanelName(formatPanelName(searchQuery))
                      if (createTabRef.current) {
                        createTabRef.current.click()
                      }
                      await autoGeneratePanel(searchQuery)
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Auto-Create Panel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <Search className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Search for a panel</h3>
                <p className="text-muted-foreground">
                  Enter a search term or describe what you need, and we'll find or create the perfect panel for you.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="flex-1 p-4 flex flex-col" id="create-tab">
          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="panel-name">Panel Name</Label>
              <Input
                id="panel-name"
                value={panelName}
                onChange={(e) => setPanelName(e.target.value)}
                placeholder="Enter a name for your panel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="panel-description">Panel Description</Label>
              <Textarea
                id="panel-description"
                value={panelDescription}
                onChange={(e) => setPanelDescription(e.target.value)}
                placeholder="Describe the panel you want to create in detail..."
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Example: "Create a weather panel that shows current weather, forecast, and allows searching for
                different locations. Include temperature, humidity, wind speed, and precipitation."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code-style">Code Style</Label>
                <Select value={codeStyle} onValueChange={setCodeStyle}>
                  <SelectTrigger id="code-style">
                    <SelectValue placeholder="Select code style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern React</SelectItem>
                    <SelectItem value="functional">Functional</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complexity">Complexity</Label>
                <Select value={complexity} onValueChange={setComplexity}>
                  <SelectTrigger id="complexity">
                    <SelectValue placeholder="Select complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="complex">Complex</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={generatePanel} disabled={isGenerating || !panelDescription.trim()} className="flex-1">
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Panel
                  </>
                )}
              </Button>

              <Button onClick={handleCreatePanel} disabled={!generatedCode || !panelName} variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                Create Panel
              </Button>
            </div>
          </div>

          <div className="flex-1 border rounded-lg p-4 overflow-auto">
            <h3 className="font-medium mb-2">AI Panel Creator</h3>
            <p className="text-sm text-muted-foreground">
              This tool uses AI to generate custom panels based on your description. Simply describe what you want, and
              the AI will create the code for you. You can then add the panel to your workspace.
            </p>
            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-sm">Tips for good descriptions:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                <li>Be specific about what the panel should do</li>
                <li>Mention any data sources or APIs it should use</li>
                <li>Describe the UI elements and layout</li>
                <li>Specify any special features or functionality</li>
                <li>Mention if it should integrate with other panels</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="flex-1 p-4 flex flex-col">
          {generatedCode ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Generated Code</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={copyCode}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadCode}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCreatePanel}>
                    <Play className="h-4 w-4 mr-1" />
                    Create Panel
                  </Button>
                </div>
              </div>

              <div className="flex-1 border rounded bg-muted font-mono text-sm p-4 overflow-auto whitespace-pre">
                {generatedCode}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Code className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No code generated yet</p>
              <p className="text-sm text-muted-foreground">Go to the "Create Panel" tab to generate code</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="flex-1 p-4">
          <div className="space-y-6">
            <h3 className="font-medium">Advanced Settings</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-settings">Include Settings</Label>
                  <p className="text-xs text-muted-foreground">Add comprehensive settings and customization options</p>
                </div>
                <Switch
                  id="include-settings"
                  checked={advancedSettings.includeSettings}
                  onCheckedChange={(checked) => setAdvancedSettings({ ...advancedSettings, includeSettings: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-keyboard-shortcuts">Keyboard Shortcuts</Label>
                  <p className="text-xs text-muted-foreground">Support keyboard shortcuts for all major actions</p>
                </div>
                <Switch
                  id="include-keyboard-shortcuts"
                  checked={advancedSettings.includeKeyboardShortcuts}
                  onCheckedChange={(checked) =>
                    setAdvancedSettings({ ...advancedSettings, includeKeyboardShortcuts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-ai-integration">AI Integration</Label>
                  <p className="text-xs text-muted-foreground">Integrate with AI services for enhanced functionality</p>
                </div>
                <Switch
                  id="include-ai-integration"
                  checked={advancedSettings.includeAIIntegration}
                  onCheckedChange={(checked) =>
                    setAdvancedSettings({ ...advancedSettings, includeAIIntegration: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-theme-support">Theme Support</Label>
                  <p className="text-xs text-muted-foreground">Support light and dark themes</p>
                </div>
                <Switch
                  id="include-theme-support"
                  checked={advancedSettings.includeThemeSupport}
                  onCheckedChange={(checked) =>
                    setAdvancedSettings({ ...advancedSettings, includeThemeSupport: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-accessibility">Accessibility</Label>
                  <p className="text-xs text-muted-foreground">Ensure accessibility compliance</p>
                </div>
                <Switch
                  id="include-accessibility"
                  checked={advancedSettings.includeAccessibility}
                  onCheckedChange={(checked) =>
                    setAdvancedSettings({ ...advancedSettings, includeAccessibility: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-responsiveness">Responsiveness</Label>
                  <p className="text-xs text-muted-foreground">Make the UI fully responsive</p>
                </div>
                <Switch
                  id="include-responsiveness"
                  checked={advancedSettings.includeResponsiveness}
                  onCheckedChange={(checked) =>
                    setAdvancedSettings({ ...advancedSettings, includeResponsiveness: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-local-storage">Local Storage</Label>
                  <p className="text-xs text-muted-foreground">Persist state in localStorage</p>
                </div>
                <Switch
                  id="include-local-storage"
                  checked={advancedSettings.includeLocalStorage}
                  onCheckedChange={(checked) =>
                    setAdvancedSettings({ ...advancedSettings, includeLocalStorage: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-error-handling">Error Handling</Label>
                  <p className="text-xs text-muted-foreground">Include comprehensive error handling</p>
                </div>
                <Switch
                  id="include-error-handling"
                  checked={advancedSettings.includeErrorHandling}
                  onCheckedChange={(checked) =>
                    setAdvancedSettings({ ...advancedSettings, includeErrorHandling: checked })
                  }
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

