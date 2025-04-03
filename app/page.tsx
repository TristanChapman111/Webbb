"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { DndContext, useSensor, useSensors, PointerSensor } from "@dnd-kit/core"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Settings,
  Code,
  Terminal,
  FileText,
  Camera,
  Globe,
  Pencil,
  Brain,
  Clock,
  Music,
  Search,
  Keyboard,
  X,
  Menu,
  FileCode,
  Workflow,
  Plus,
  LayoutGrid,
  FileUp,
  ClipboardIcon,
  Wand2,
  Palette,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import PanelContainer from "@/components/panel-container"
import SettingsPanel from "@/components/panels/settings-panel"
import CodePanel from "@/components/panels/code-panel"
import BrowserPanel from "@/components/panels/browser-panel"
import NotesPanel from "@/components/panels/notes-panel"
import TerminalPanel from "@/components/panels/terminal-panel"
import WhiteboardPanel from "@/components/panels/whiteboard-panel"
import CameraPanel from "@/components/panels/camera-panel"
import AIPanel from "@/components/panels/ai-panel"
import CountdownPanel from "@/components/panels/countdown-panel"
import MusicPanel from "@/components/panels/music-panel"
import SearchPanel from "@/components/panels/search-panel"
import KeyboardShortcutsPanel from "@/components/panels/keyboard-shortcuts-panel"
import AITextDetectionPanel from "@/components/panels/ai-text-detection-panel"
import AutomationPanel from "@/components/panels/automation-panel"
import FileDropZone from "@/components/file-drop-zone"
import { ThemeProvider } from "@/components/theme-provider"
import { useHotkeys } from "react-hotkeys-hook"
import { v4 as uuidv4 } from "uuid"
import TaskManagerPanel from "@/components/panels/task-manager-panel"
import ClipboardPanel from "@/components/panels/clipboard-panel"
import FileConverterPanel from "@/components/panels/file-converter-panel"
import AIPanelCreatorAdvanced from "@/components/panels/ai-panel-creator-advanced"
import LoadingPanel from "@/components/loading-panel"
import AIEnhancedPanel from "@/components/panels/ai-enhanced-panel"
import UIDesignerPanel from "@/components/panels/ui-designer-panel"
import { detectPanelFromText, generateAIResponse } from "@/lib/ai-service"

export default function Home() {
  const { toast } = useToast()
  const [panels, setPanels] = useState<any[]>([])
  const [deviceType, setDeviceType] = useState<"desktop" | "mobile">("desktop")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [privacyMode, setPrivacyMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [isAutoCreating, setIsAutoCreating] = useState(false)
  const [autoCreateQuery, setAutoCreateQuery] = useState("")
  const [temporaryPanels, setTemporaryPanels] = useState<string[]>([])
  const [nextZIndex, setNextZIndex] = useState(10)
  const [panelZIndices, setPanelZIndices] = useState<Record<string, number>>({})
  const loadingPanelRef = useRef<string | null>(null)
  const [connectionLines, setConnectionLines] = useState<{ from: string; to: string }[]>([])
  const [newPanelId, setNewPanelId] = useState<string | null>(null)

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  // Load panels from localStorage on initial render
  useEffect(() => {
    const savedPanels = localStorage.getItem("panels")
    if (savedPanels) {
      try {
        setPanels(JSON.parse(savedPanels))
      } catch (e) {
        console.error("Failed to parse saved panels", e)
      }
    }

    // Detect device type
    const isMobile = window.innerWidth <= 768
    setDeviceType(isMobile ? "mobile" : "desktop")

    // Add resize listener
    const handleResize = () => {
      setDeviceType(window.innerWidth <= 768 ? "mobile" : "desktop")
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Save panels to localStorage whenever they change
  useEffect(() => {
    // Only save non-temporary panels
    const permanentPanels = panels.filter((panel) => !temporaryPanels.includes(panel.id))
    localStorage.setItem("panels", JSON.stringify(permanentPanels))
  }, [panels, temporaryPanels])

  // Update connection lines whenever panels change
  useEffect(() => {
    if (panels.length > 1) {
      const lines: { from: string; to: string }[] = []

      // Create connections between all panels
      for (let i = 0; i < panels.length; i++) {
        for (let j = i + 1; j < panels.length; j++) {
          lines.push({
            from: panels[i].id,
            to: panels[j].id,
          })
        }
      }

      setConnectionLines(lines)
    } else {
      setConnectionLines([])
    }
  }, [panels])

  // Clear newPanelId after a delay
  useEffect(() => {
    if (newPanelId) {
      const timer = setTimeout(() => {
        setNewPanelId(null)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [newPanelId])

  // Bring panel to front when clicked
  const bringToFront = (id: string) => {
    const newZIndex = nextZIndex + 1
    setPanelZIndices({
      ...panelZIndices,
      [id]: newZIndex,
    })
    setNextZIndex(newZIndex)
  }

  // Keyboard shortcuts
  useHotkeys("ctrl+alt+s, cmd+alt+s", () => addPanel("settings"), {
    enableOnFormTags: true,
    preventDefault: true,
  })
  useHotkeys("ctrl+alt+c, cmd+alt+c", () => addPanel("code"), {
    enableOnFormTags: true,
    preventDefault: true,
  })
  useHotkeys("ctrl+alt+b, cmd+alt+b", () => addPanel("browser"), {
    enableOnFormTags: true,
    preventDefault: true,
  })
  useHotkeys("ctrl+alt+n, cmd+alt+n", () => addPanel("notes"), {
    enableOnFormTags: true,
    preventDefault: true,
  })
  useHotkeys("ctrl+alt+t, cmd+alt+t", () => addPanel("terminal"), {
    enableOnFormTags: true,
    preventDefault: true,
  })
  useHotkeys("ctrl+alt+w, cmd+alt+w", () => addPanel("whiteboard"), {
    enableOnFormTags: true,
    preventDefault: true,
  })
  useHotkeys("ctrl+alt+a, cmd+alt+a", () => addPanel("ai"), {
    enableOnFormTags: true,
    preventDefault: true,
  })
  useHotkeys(
    "ctrl+alt+r, cmd+alt+r",
    () => {
      window.location.reload()
      toast({
        title: "Page Reloaded",
        description: "The application has been refreshed",
      })
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
  )
  useHotkeys(
    "ctrl+alt+]",
    () => {
      setPrivacyMode(true)
      toast({
        title: "Privacy Mode Enabled",
        description: "Your content is now hidden",
      })
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
  )
  useHotkeys("ctrl+alt+k, cmd+alt+k", () => addPanel("keyboard"), {
    enableOnFormTags: true,
    preventDefault: true,
  })
  useHotkeys("ctrl+alt+d, cmd+alt+d", () => addPanel("ai-text-detection"), {
    enableOnFormTags: true,
    preventDefault: true,
  })
  useHotkeys("ctrl+alt+m, cmd+alt+m", () => addPanel("automation"), {
    enableOnFormTags: true,
    preventDefault: true,
  })
  useHotkeys(
    "ctrl+alt+x, cmd+alt+x",
    () => {
      if (panels.length > 0) {
        const lastPanel = panels[panels.length - 1]
        removePanel(lastPanel.id)
      }
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
  )
  useHotkeys(
    "ctrl+alt+z, cmd+alt+z",
    () => {
      // Undo last panel removal (not implemented yet)
      toast({
        title: "Undo",
        description: "Undo functionality coming soon",
      })
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
  )
  // Add the task manager keyboard shortcut
  useHotkeys("ctrl+alt+p, cmd+alt+p", () => addPanel("task-manager"), {
    enableOnFormTags: true,
    preventDefault: true,
  })
  // Add the clipboard keyboard shortcut
  useHotkeys("ctrl+alt+v, cmd+alt+v", () => addPanel("clipboard"), {
    enableOnFormTags: true,
    preventDefault: true,
  })
  // Add the file converter keyboard shortcut
  useHotkeys("ctrl+alt+f, cmd+alt+f", () => addPanel("file-converter"), {
    enableOnFormTags: true,
    preventDefault: true,
  })
  // Add the AI Panel Creator keyboard shortcut
  useHotkeys("ctrl+alt+g, cmd+alt+g", () => addPanel("ai-panel-creator-advanced"), {
    enableOnFormTags: true,
    preventDefault: true,
  })
  // Add the UI Designer keyboard shortcut
  useHotkeys("ctrl+alt+u, cmd+alt+u", () => addPanel("ui-designer"), {
    enableOnFormTags: true,
    preventDefault: true,
  })

  const addPanel = (type: string, isTemporary = false, additionalProps = {}) => {
    const id = uuidv4()
    const newPanel = {
      id,
      type,
      position: { x: 50 + ((panels.length * 20) % 200), y: 50 + ((panels.length * 20) % 200) },
      size: getPanelDefaultSize(type),
      ...additionalProps,
    }

    setPanels([...panels, newPanel])

    // If this is a temporary panel, add it to the temporary panels list
    if (isTemporary) {
      setTemporaryPanels([...temporaryPanels, id])
    }

    // Set the z-index for the new panel to bring it to front
    bringToFront(id)

    // Mark this as a new panel for animation
    setNewPanelId(id)

    toast({
      title: "Panel Added",
      description: `Added a new ${type} panel`,
    })

    return id
  }

  const removePanel = (id: string) => {
    setPanels(panels.filter((panel) => panel.id !== id))

    // Remove from temporary panels list if it's there
    if (temporaryPanels.includes(id)) {
      setTemporaryPanels(temporaryPanels.filter((panelId) => panelId !== id))
    }

    // Remove from z-index mapping
    const newPanelZIndices = { ...panelZIndices }
    delete newPanelZIndices[id]
    setPanelZIndices(newPanelZIndices)

    toast({
      title: "Panel Removed",
      description: "Panel has been removed",
    })
    setTimeout(() => {
      toast.dismiss()
    }, 2000)
  }

  const updatePanelPosition = (id: string, position: { x: number; y: number }) => {
    setPanels(panels.map((panel) => (panel.id === id ? { ...panel, position } : panel)))
  }

  const updatePanelSize = (id: string, size: { width: number; height: number }) => {
    setPanels(panels.map((panel) => (panel.id === id ? { ...panel, size } : panel)))
  }

  const getPanelDefaultSize = (type: string) => {
    switch (type) {
      case "settings":
        return { width: 400, height: 500 }
      case "code":
        return { width: 600, height: 400 }
      case "browser":
        return { width: 800, height: 600 }
      case "notes":
        return { width: 400, height: 400 }
      case "terminal":
        return { width: 600, height: 300 }
      case "whiteboard":
        return { width: 600, height: 400 }
      case "camera":
        return { width: 400, height: 300 }
      case "ai":
        return { width: 500, height: 400 }
      case "countdown":
        return { width: 300, height: 200 }
      case "music":
        return { width: 400, height: 300 }
      case "search":
        return { width: 500, height: 300 }
      case "keyboard":
        return { width: 600, height: 400 }
      case "ai-text-detection":
        return { width: 600, height: 500 }
      case "automation":
        return { width: 700, height: 500 }
      case "task-manager":
        return { width: 500, height: 400 }
      case "clipboard":
        return { width: 500, height: 500 }
      case "file-converter":
        return { width: 600, height: 600 }
      case "ai-panel-creator-advanced":
        return { width: 800, height: 600 }
      case "loading-panel":
        return { width: 400, height: 300 }
      case "ai-enhanced-panel":
        return { width: 600, height: 500 }
      case "ui-designer":
        return { width: 800, height: 600 }
      default:
        return { width: 400, height: 300 }
    }
  }

  // Function to handle custom panel creation from AI-generated code
  const handleCreateCustomPanel = async (query: string, panelType: string) => {
    try {
      // Create a loading panel first
      const loadingId = addPanel("loading-panel", true, {
        query: query,
        message: "Creating AI Panel",
      })
      loadingPanelRef.current = loadingId

      // Generate panel description and content using AI
      const descriptionPrompt = `Generate a brief description for a panel about: ${query}`
      const descriptionResponse = await generateAIResponse(descriptionPrompt)

      // Create the actual panel
      const panelId = addPanel("ai-enhanced-panel", true, {
        title: formatPanelName(query),
        description: descriptionResponse.text || `AI-generated panel for: ${query}`,
        panelType: panelType || "custom",
        query: query,
      })

      // Remove the loading panel
      if (loadingPanelRef.current) {
        removePanel(loadingPanelRef.current)
        loadingPanelRef.current = null
      }

      setIsAutoCreating(false)
      setAutoCreateQuery("")

      return panelId
    } catch (error) {
      console.error("Error creating custom panel:", error)
      toast({
        title: "Error",
        description: "Failed to create custom panel",
        variant: "destructive",
      })

      // Remove the loading panel if it exists
      if (loadingPanelRef.current) {
        removePanel(loadingPanelRef.current)
        loadingPanelRef.current = null
      }

      setIsAutoCreating(false)
      setAutoCreateQuery("")
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

  const renderPanelContent = (panel: any) => {
    // Special case for loading panel
    if (panel.type === "loading-panel") {
      return <LoadingPanel message={panel.message || "Loading..."} query={panel.query} />
    }

    // Special case for AI-enhanced panels
    if (panel.type === "ai-enhanced-panel") {
      return (
        <AIEnhancedPanel
          title={panel.title || "AI Panel"}
          description={panel.description}
          initialContent={panel.initialContent || ""}
          panelType={panel.panelType || "custom"}
          isTemporary={temporaryPanels.includes(panel.id)}
          query={panel.query || ""}
        />
      )
    }

    switch (panel.type) {
      case "settings":
        return <SettingsPanel deviceType={deviceType} setDeviceType={setDeviceType} />
      case "code":
        return <CodePanel />
      case "browser":
        return <BrowserPanel />
      case "notes":
        return <NotesPanel />
      case "terminal":
        return <TerminalPanel />
      case "whiteboard":
        return <WhiteboardPanel />
      case "camera":
        return <CameraPanel />
      case "ai":
        return <AIPanel />
      case "countdown":
        return <CountdownPanel />
      case "music":
        return <MusicPanel />
      case "search":
        return <SearchPanel />
      case "keyboard":
        return <KeyboardShortcutsPanel />
      case "ai-text-detection":
        return <AITextDetectionPanel />
      case "automation":
        return <AutomationPanel />
      case "task-manager":
        return (
          <TaskManagerPanel
            panels={panels}
            onRemovePanel={removePanel}
            onMaximizePanel={(id) => {
              const panel = panels.find((p) => p.id === id)
              if (panel) {
                updatePanelSize(id, { width: window.innerWidth, height: window.innerHeight - 100 })
                updatePanelPosition(id, { x: 0, y: 0 })
              }
            }}
            onMinimizePanel={(id) => {
              const panel = panels.find((p) => p.id === id)
              if (panel) {
                const size = getPanelDefaultSize(panel.type)
                updatePanelSize(id, { width: size.width, height: 40 })
              }
            }}
            onArrangePanels={(arrangement) => {
              if (panels.length === 0) return

              const spacing = 20
              const headerHeight = 100
              const availableWidth = window.innerWidth - spacing * 2
              const availableHeight = window.innerHeight - headerHeight - spacing * 2

              if (arrangement === "grid") {
                const cols = Math.ceil(Math.sqrt(panels.length))
                const rows = Math.ceil(panels.length / cols)

                const panelWidth = (availableWidth - (cols - 1) * spacing) / cols
                const panelHeight = (availableHeight - (rows - 1) * spacing) / rows

                panels.forEach((panel, index) => {
                  const col = index % cols
                  const row = Math.floor(index / cols)

                  updatePanelPosition(panel.id, {
                    x: spacing + col * (panelWidth + spacing),
                    y: headerHeight + spacing + row * (panelHeight + spacing),
                  })

                  updatePanelSize(panel.id, {
                    width: panelWidth,
                    height: panelHeight,
                  })
                })
              } else if (arrangement === "horizontal") {
                const panelWidth = (availableWidth - (panels.length - 1) * spacing) / panels.length

                panels.forEach((panel, index) => {
                  updatePanelPosition(panel.id, {
                    x: spacing + index * (panelWidth + spacing),
                    y: headerHeight + spacing,
                  })

                  updatePanelSize(panel.id, {
                    width: panelWidth,
                    height: availableHeight,
                  })
                })
              } else if (arrangement === "vertical") {
                const panelHeight = (availableHeight - (panels.length - 1) * spacing) / panels.length

                panels.forEach((panel, index) => {
                  updatePanelPosition(panel.id, {
                    x: spacing,
                    y: headerHeight + spacing + index * (panelHeight + spacing),
                  })

                  updatePanelSize(panel.id, {
                    width: availableWidth,
                    height: panelHeight,
                  })
                })
              }

              toast({
                title: "Panels Arranged",
                description: `Panels arranged in ${arrangement} layout`,
              })
            }}
          />
        )
      case "clipboard":
        return <ClipboardPanel />
      case "file-converter":
        return <FileConverterPanel />
      case "ai-panel-creator-advanced":
        return (
          <AIPanelCreatorAdvanced
            onCreatePanel={(code, name) => handleCreateCustomPanel(name, "custom")}
            onAddExistingPanel={addPanel}
            existingPanelTypes={Object.keys(getPanelDefaultSize)}
            initialSearchQuery={panel.initialSearchQuery || ""}
            autoCreateMode={panel.autoCreateMode || false}
          />
        )
      case "ui-designer":
        return (
          <UIDesignerPanel
            onApplyChanges={(css) => {
              // CSS is applied directly in the UIDesignerPanel component
            }}
          />
        )
      default:
        return <div>Unknown panel type</div>
    }
  }

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
    "ui-designer": { name: "UI Designer", description: "Modify the application's UI with AI" },
  }

  // Function to auto-create a panel based on search query
  const autoCreatePanel = async (query: string) => {
    if (!query.trim()) return

    setIsAutoCreating(true)
    setAutoCreateQuery(query)
    setSearchQuery("")
    setSearchResults([])
    setShowSearchDropdown(false)

    try {
      // First, check if we have an existing panel type that matches
      const matchingPanels = Object.entries(panelTypeMapping)
        .filter(([type, info]) => {
          return (
            type.includes(query.toLowerCase()) ||
            info.name.toLowerCase().includes(query.toLowerCase()) ||
            info.name.toLowerCase().includes(query.toLowerCase()) ||
            info.description.toLowerCase().includes(query.toLowerCase())
          )
        })
        .map(([type, info]) => ({
          type,
          name: info.name,
          description: info.description,
        }))

      if (matchingPanels.length > 0) {
        // If we have a matching panel, add it
        addPanel(matchingPanels[0].type)
        setIsAutoCreating(false)
        setAutoCreateQuery("")
      } else {
        // If no existing panels match, ask AI to detect what kind of panel this might be
        const response = await detectPanelFromText(query)

        if (response.text && panelTypeMapping[response.text.toLowerCase().trim()]) {
          const detectedType = response.text.toLowerCase().trim()
          addPanel(detectedType)
          setIsAutoCreating(false)
          setAutoCreateQuery("")
        } else {
          // If AI couldn't detect a matching panel, create a custom one
          await handleCreateCustomPanel(query, "custom")
        }
      }
    } catch (error) {
      console.error("Error auto-creating panel:", error)
      toast({
        title: "Error",
        description: "Failed to auto-create panel",
        variant: "destructive",
      })
      setIsAutoCreating(false)
      setAutoCreateQuery("")
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const results = []

    if (query.trim() !== "") {
      const searchTerms = [
        { term: "settings", name: "Settings", action: () => addPanel("settings") },
        { term: "code", name: "Code Editor", action: () => addPanel("code") },
        { term: "browser", name: "Web Browser", action: () => addPanel("browser") },
        { term: "notes", name: "Notes", action: () => addPanel("notes") },
        { term: "terminal", name: "Terminal", action: () => addPanel("terminal") },
        { term: "whiteboard", name: "Whiteboard", action: () => addPanel("whiteboard") },
        { term: "camera", name: "Camera", action: () => addPanel("camera") },
        { term: "ai", name: "AI Assistant", action: () => addPanel("ai") },
        { term: "countdown", name: "Countdown Timer", action: () => addPanel("countdown") },
        { term: "music", name: "Music Player", action: () => addPanel("music") },
        { term: "search", name: "Web Search", action: () => addPanel("search") },
        { term: "keyboard", name: "Keyboard Shortcuts", action: () => addPanel("keyboard") },
        { term: "ai text detection", name: "AI Text Detection", action: () => addPanel("ai-text-detection") },
        { term: "ocr", name: "OCR Text Extraction", action: () => addPanel("ai-text-detection") },
        { term: "automation", name: "Automation", action: () => addPanel("automation") },
        { term: "macros", name: "Macro Recorder", action: () => addPanel("automation") },
        { term: "task manager", name: "Task Manager", action: () => addPanel("task-manager") },
        { term: "panel manager", name: "Panel Manager", action: () => addPanel("task-manager") },
        { term: "clipboard", name: "Clipboard Manager", action: () => addPanel("clipboard") },
        { term: "copy paste", name: "Clipboard Manager", action: () => addPanel("clipboard") },
        { term: "file converter", name: "File Converter", action: () => addPanel("file-converter") },
        { term: "convert", name: "File Converter", action: () => addPanel("file-converter") },
        { term: "ai panel creator", name: "AI Panel Creator", action: () => addPanel("ai-panel-creator-advanced") },
        { term: "create panel", name: "Create Custom Panel", action: () => addPanel("ai-panel-creator-advanced") },
        { term: "panel generator", name: "Panel Generator", action: () => addPanel("ai-panel-creator-advanced") },
        { term: "game", name: "Game Panel", action: () => addPanel("game") },
        { term: "ui designer", name: "UI Designer", action: () => addPanel("ui-designer") },
        { term: "theme", name: "UI Designer", action: () => addPanel("ui-designer") },
        { term: "customize ui", name: "UI Designer", action: () => addPanel("ui-designer") },
      ]

      for (const item of searchTerms) {
        if (item.term.includes(query.toLowerCase()) || item.name.toLowerCase().includes(query.toLowerCase())) {
          results.push({ name: item.name, action: item.action })
        }
      }
    }

    setSearchResults(results)
    setShowSearchDropdown(results.length > 0)

    // If no results found and query is not empty, suggest creating a custom panel
    if (results.length === 0 && query.trim() !== "") {
      results.push({
        name: "Auto-Create Panel",
        action: () => autoCreatePanel(query),
      })

      setSearchResults(results)
      setShowSearchDropdown(true)
    }
  }

  const handleSearchResultClick = (action: () => void) => {
    action()
    setSearchQuery("")
    setSearchResults([])
    setShowSearchDropdown(false)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()

      // If there are search results, use the first one
      if (searchResults.length > 0) {
        handleSearchResultClick(searchResults[0].action)
      } else if (searchQuery.trim() !== "") {
        // If no results but we have a query, auto-create a panel
        autoCreatePanel(searchQuery)
      }
    }
  }

  const togglePrivacyMode = () => {
    setPrivacyMode(!privacyMode)
    toast({
      title: privacyMode ? "Privacy Mode Disabled" : "Privacy Mode Enabled",
      description: privacyMode ? "Your content is now visible" : "Your content is now hidden",
    })
  }

  const handleFileDetected = (fileType: string, fileContent: string | ArrayBuffer | null, fileName: string) => {
    // Determine which panel to open based on file type
    let panelType = ""

    switch (fileType) {
      case "image":
        panelType = "camera"
        break
      case "code":
        panelType = "code"
        break
      case "audio":
        panelType = "music"
        break
      case "video":
        panelType = "browser"
        break
      case "pdf":
        panelType = "browser"
        break
      default:
        panelType = "notes"
    }

    // Add the appropriate panel
    const newPanel = {
      id: uuidv4(),
      type: panelType,
      position: { x: 50 + ((panels.length * 20) % 200), y: 50 + ((panels.length * 20) % 200) },
      size: getPanelDefaultSize(panelType),
      fileContent,
      fileName,
    }

    setPanels([...panels, newPanel])
    bringToFront(newPanel.id)
    setNewPanelId(newPanel.id)

    toast({
      title: "File Processed",
      description: `Opened ${fileName} in ${panelType} panel`,
    })
  }

  // Calculate connection line positions
  const getConnectionLineStyle = (fromId: string, toId: string) => {
    const fromPanel = panels.find((p) => p.id === fromId)
    const toPanel = panels.find((p) => p.id === toId)

    if (!fromPanel || !toPanel) return {}

    const fromX = fromPanel.position.x + fromPanel.size.width / 2
    const fromY = fromPanel.position.y + fromPanel.size.height / 2
    const toX = toPanel.position.x + toPanel.size.width / 2
    const toY = toPanel.position.y + toPanel.size.height / 2

    const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2))
    const angle = Math.atan2(toY - fromY, toX - fromX)

    return {
      width: distance,
      height: 1,
      transformOrigin: "0 0",
      transform: `rotate(${angle}rad)`,
      left: fromX,
      top: fromY,
    }
  }

  return (
    <ThemeProvider>
      <main className={`min-h-screen p-4 ${privacyMode ? "bg-black" : "bg-background"}`}>
        {!privacyMode && (
          <>
            <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b p-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold">Multi-Panel Workspace</h1>
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">{deviceType}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search features or drag files here..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => setShowSearchDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSearchDropdown(false), 100)}
                    className="pr-10"
                  />
                  {searchQuery && showSearchDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
                      {searchResults.length > 0 ? (
                        searchResults.map((result, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-muted cursor-pointer"
                            onMouseDown={() => handleSearchResultClick(result.action)}
                          >
                            {result.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-muted-foreground">No results found</div>
                      )}
                    </div>
                  )}
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      onClick={() => {
                        setSearchQuery("")
                        setSearchResults([])
                        setShowSearchDropdown(false)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="hidden md:flex space-x-1">
                  <Button variant="outline" size="sm" onClick={() => addPanel("settings")}>
                    <Settings className="h-4 w-4 mr-1" /> Settings
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addPanel("code")}>
                    <Code className="h-4 w-4 mr-1" /> Code
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addPanel("browser")}>
                    <Globe className="h-4 w-4 mr-1" /> Browser
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addPanel("notes")}>
                    <FileText className="h-4 w-4 mr-1" /> Notes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addPanel("terminal")}>
                    <Terminal className="h-4 w-4 mr-1" /> Terminal
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addPanel("ai")}>
                    <Brain className="h-4 w-4 mr-1" /> AI
                  </Button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Add Panel</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => addPanel("whiteboard")}>
                        <Pencil className="h-4 w-4 mr-2" /> Whiteboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addPanel("camera")}>
                        <Camera className="h-4 w-4 mr-2" /> Camera
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addPanel("ai")}>
                        <Brain className="h-4 w-4 mr-2" /> AI Assistant
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addPanel("countdown")}>
                        <Clock className="h-4 w-4 mr-2" /> Countdown
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addPanel("music")}>
                        <Music className="h-4 w-4 mr-2" /> Music
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addPanel("search")}>
                        <Search className="h-4 w-4 mr-2" /> Search
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addPanel("keyboard")}>
                        <Keyboard className="h-4 w-4 mr-2" /> Keyboard Shortcuts
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => addPanel("ai-text-detection")}>
                        <FileCode className="h-4 w-4 mr-2" /> AI Text Detection
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addPanel("automation")}>
                        <Workflow className="h-4 w-4 mr-2" /> Automation
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => addPanel("task-manager")}>
                      <LayoutGrid className="h-4 w-4 mr-2" /> Task Manager
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addPanel("clipboard")}>
                      <ClipboardIcon className="h-4 w-4 mr-2" /> Clipboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addPanel("file-converter")}>
                      <FileUp className="h-4 w-4 mr-2" /> File Converter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addPanel("ai-panel-creator-advanced")}>
                      <Wand2 className="h-4 w-4 mr-2" /> AI Panel Creator
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addPanel("ui-designer")}>
                      <Palette className="h-4 w-4 mr-2" /> UI Designer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={togglePrivacyMode}>Privacy Mode</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeviceType(deviceType === "desktop" ? "mobile" : "desktop")}>
                      Switch to {deviceType === "desktop" ? "Mobile" : "Desktop"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.reload()}>Reload Page</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-16">
              <DndContext sensors={sensors}>
                {/* Connection lines between panels */}
                {connectionLines.map(({ from, to }) => (
                  <div
                    key={`${from}-${to}`}
                    className="absolute bg-black/20 pointer-events-none z-5"
                    style={getConnectionLineStyle(from, to)}
                  />
                ))}

                {panels.map((panel) => (
                  <PanelContainer
                    key={panel.id}
                    id={panel.id}
                    position={panel.position}
                    size={panel.size}
                    onRemove={() => removePanel(panel.id)}
                    onPositionChange={(position) => updatePanelPosition(panel.id, position)}
                    onSizeChange={(size) => updatePanelSize(panel.id, size)}
                    title={
                      panel.type === "ai-enhanced-panel"
                        ? panel.title || "AI Panel"
                        : panel.type === "loading-panel"
                          ? "Creating Panel..."
                          : panel.type
                              .split("-")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")
                    }
                    zIndex={panelZIndices[panel.id] || 10}
                    isNew={panel.id === newPanelId}
                  >
                    {renderPanelContent(panel)}
                  </PanelContainer>
                ))}
              </DndContext>
            </div>

            <FileDropZone onFileDetected={handleFileDetected} />
          </>
        )}
        <Toaster />
      </main>
    </ThemeProvider>
  )
}

