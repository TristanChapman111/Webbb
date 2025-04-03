"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { generateAIResponse } from "./ai-service"

// Define types for our panels
export type PanelType = {
  id: string
  type: string
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  content?: any
  settings?: any
  connections?: string[]
}

// Define types for our settings
export type SettingsType = {
  theme: "light" | "dark" | "system"
  fontSize: number
  fontFamily: string
  showNotifications: boolean
  notificationDuration: number
  saveHistory: boolean
  privacyMode: boolean
  deviceType: "desktop" | "mobile"
  aiProvider: "gemini" | "openai" | "anthropic"
  aiApiKey?: string
  proxyUrl?: string
  enabledPanels: Record<string, boolean>
  keyboardShortcuts: Record<string, string>
  panelDefaults: Record<string, any>
}

// Define types for our notifications
export type NotificationType = {
  id: string
  message: string
  type: "info" | "success" | "warning" | "error"
  duration: number
  timestamp: number
}

// Define types for our user
export type UserType = {
  id?: string
  email?: string
  name?: string
  isLoggedIn: boolean
}

// Define the context type
type AppContextType = {
  panels: PanelType[]
  addPanel: (
    type: string,
    title: string,
    content?: any,
    position?: { x: number; y: number },
    size?: { width: number; height: number },
  ) => string
  removePanel: (id: string) => void
  updatePanelPosition: (id: string, position: { x: number; y: number }) => void
  updatePanelSize: (id: string, size: { width: number; height: number }) => void
  updatePanelZIndex: (id: string, zIndex: number) => void
  updatePanelContent: (id: string, content: any) => void
  updatePanelSettings: (id: string, settings: any) => void
  getPanelById: (id: string) => PanelType | undefined
  connectPanels: (sourceId: string, targetId: string) => void
  disconnectPanels: (sourceId: string, targetId: string) => void
  settings: SettingsType
  updateSettings: (newSettings: Partial<SettingsType>) => void
  notifications: NotificationType[]
  addNotification: (message: string, type?: "info" | "success" | "warning" | "error", duration?: number) => void
  removeNotification: (id: string) => void
  user: UserType
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<boolean>
  isPrivacyModeEnabled: boolean
  togglePrivacyMode: () => void
  analyzeFile: (file: File) => Promise<string>
  analyzeText: (text: string) => Promise<string>
  createCustomPanel: (description: string) => Promise<string>
  getMaxZIndex: () => number
  saveState: () => void
  loadState: () => void
  resetState: () => void
}

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined)

// Default settings
const defaultSettings: SettingsType = {
  theme: "system",
  fontSize: 16,
  fontFamily: "Inter, sans-serif",
  showNotifications: true,
  notificationDuration: 5000,
  saveHistory: true,
  privacyMode: false,
  deviceType: "desktop",
  aiProvider: "gemini",
  enabledPanels: {},
  keyboardShortcuts: {
    "toggle-privacy": "Alt+P",
    "add-panel": "Alt+N",
    "close-panel": "Alt+W",
    "reset-layout": "Alt+R",
    "save-state": "Alt+S",
    "load-state": "Alt+L",
    "toggle-theme": "Alt+T",
    screenshot: "Alt+Shift+S",
    "close-all-panels": "Alt+Shift+W",
    "reload-page": "Alt+Shift+R",
  },
  panelDefaults: {},
}

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [panels, setPanels] = useState<PanelType[]>([])
  const [settings, setSettings] = useState<SettingsType>(defaultSettings)
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [user, setUser] = useState<UserType>({ isLoggedIn: false })
  const [isPrivacyModeEnabled, setIsPrivacyModeEnabled] = useState(false)

  // Load state from localStorage on component mount
  useEffect(() => {
    loadState()
  }, [])

  // Save state to localStorage whenever panels or settings change
  useEffect(() => {
    if (panels.length > 0 || Object.keys(settings).length > defaultSettings) {
      saveState()
    }
  }, [panels, settings])

  // Get the maximum z-index of all panels
  const getMaxZIndex = useCallback(() => {
    if (panels.length === 0) return 0
    return Math.max(...panels.map((panel) => panel.zIndex))
  }, [panels])

  // Add a new panel
  const addPanel = useCallback(
    (
      type: string,
      title: string,
      content?: any,
      position?: { x: number; y: number },
      size?: { width: number; height: number },
    ): string => {
      const id = uuidv4()
      const newPanel: PanelType = {
        id,
        type,
        title,
        position: position || { x: Math.random() * 100, y: Math.random() * 100 },
        size: size || { width: 400, height: 300 },
        zIndex: getMaxZIndex() + 1,
        content: content || {},
        settings: {},
        connections: [],
      }
      setPanels((prevPanels) => [...prevPanels, newPanel])
      addNotification(`Added new ${type} panel`, "success")
      return id
    },
    [getMaxZIndex],
  )

  // Remove a panel
  const removePanel = useCallback((id: string) => {
    setPanels((prevPanels) => prevPanels.filter((panel) => panel.id !== id))
    addNotification("Panel removed", "info")
  }, [])

  // Update panel position
  const updatePanelPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setPanels((prevPanels) => prevPanels.map((panel) => (panel.id === id ? { ...panel, position } : panel)))
  }, [])

  // Update panel size
  const updatePanelSize = useCallback((id: string, size: { width: number; height: number }) => {
    setPanels((prevPanels) => prevPanels.map((panel) => (panel.id === id ? { ...panel, size } : panel)))
  }, [])

  // Update panel z-index
  const updatePanelZIndex = useCallback((id: string, zIndex: number) => {
    setPanels((prevPanels) => prevPanels.map((panel) => (panel.id === id ? { ...panel, zIndex } : panel)))
  }, [])

  // Update panel content
  const updatePanelContent = useCallback((id: string, content: any) => {
    setPanels((prevPanels) =>
      prevPanels.map((panel) => (panel.id === id ? { ...panel, content: { ...panel.content, ...content } } : panel)),
    )
  }, [])

  // Update panel settings
  const updatePanelSettings = useCallback((id: string, settings: any) => {
    setPanels((prevPanels) =>
      prevPanels.map((panel) => (panel.id === id ? { ...panel, settings: { ...panel.settings, ...settings } } : panel)),
    )
  }, [])

  // Get panel by ID
  const getPanelById = useCallback(
    (id: string) => {
      return panels.find((panel) => panel.id === id)
    },
    [panels],
  )

  // Connect panels
  const connectPanels = useCallback((sourceId: string, targetId: string) => {
    setPanels((prevPanels) =>
      prevPanels.map((panel) => {
        if (panel.id === sourceId) {
          const connections = panel.connections || []
          if (!connections.includes(targetId)) {
            return { ...panel, connections: [...connections, targetId] }
          }
        }
        return panel
      }),
    )
    addNotification("Panels connected", "success")
  }, [])

  // Disconnect panels
  const disconnectPanels = useCallback((sourceId: string, targetId: string) => {
    setPanels((prevPanels) =>
      prevPanels.map((panel) => {
        if (panel.id === sourceId) {
          const connections = panel.connections || []
          return { ...panel, connections: connections.filter((id) => id !== targetId) }
        }
        return panel
      }),
    )
    addNotification("Panels disconnected", "info")
  }, [])

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<SettingsType>) => {
    setSettings((prevSettings) => ({ ...prevSettings, ...newSettings }))
    addNotification("Settings updated", "success")
  }, [])

  // Add notification
  const addNotification = useCallback(
    (message: string, type: "info" | "success" | "warning" | "error" = "info", duration?: number) => {
      if (!settings.showNotifications) return

      const id = uuidv4()
      const newNotification: NotificationType = {
        id,
        message,
        type,
        duration: duration || settings.notificationDuration,
        timestamp: Date.now(),
      }

      setNotifications((prevNotifications) => [...prevNotifications, newNotification])

      // Auto-remove notification after duration
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    },
    [settings.showNotifications, settings.notificationDuration],
  )

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id))
  }, [])

  // Login
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // Mock login - in a real app, this would call an API
      setUser({
        id: uuidv4(),
        email,
        name: email.split("@")[0],
        isLoggedIn: true,
      })
      addNotification("Logged in successfully", "success")
      return true
    } catch (error) {
      addNotification("Login failed", "error")
      return false
    }
  }, [])

  // Logout
  const logout = useCallback(() => {
    setUser({ isLoggedIn: false })
    addNotification("Logged out successfully", "info")
  }, [])

  // Register
  const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Mock registration - in a real app, this would call an API
      setUser({
        id: uuidv4(),
        email,
        name,
        isLoggedIn: true,
      })
      addNotification("Registered successfully", "success")
      return true
    } catch (error) {
      addNotification("Registration failed", "error")
      return false
    }
  }, [])

  // Toggle privacy mode
  const togglePrivacyMode = useCallback(() => {
    setIsPrivacyModeEnabled((prev) => !prev)
    addNotification(`Privacy mode ${isPrivacyModeEnabled ? "disabled" : "enabled"}`, "info")
  }, [isPrivacyModeEnabled])

  // Analyze file with AI
  const analyzeFile = useCallback(async (file: File): Promise<string> => {
    try {
      // In a real app, this would upload the file and process it
      addNotification("Analyzing file...", "info")

      // Mock response based on file type
      const fileType = file.type.split("/")[0]
      let response = ""

      switch (fileType) {
        case "image":
          response = "image-panel"
          break
        case "audio":
          response = "audio-recorder-panel"
          break
        case "video":
          response = "video-player-panel"
          break
        case "application":
          if (file.name.endsWith(".pdf")) {
            response = "pdf-viewer-panel"
          } else if (file.name.endsWith(".json")) {
            response = "json-validator-panel"
          } else {
            response = "file-converter-panel"
          }
          break
        case "text":
          response = "notes-panel"
          break
        default:
          response = "file-converter-panel"
      }

      addNotification("File analysis complete", "success")
      return response
    } catch (error) {
      addNotification("File analysis failed", "error")
      return "error"
    }
  }, [])

  // Analyze text with AI
  const analyzeText = useCallback(async (text: string): Promise<string> => {
    try {
      addNotification("Analyzing text...", "info")

      // Use the AI service to analyze the text
      const response = await generateAIResponse("Determine the most appropriate panel type for this text: " + text)

      addNotification("Text analysis complete", "success")
      return response.toLowerCase().includes("panel") ? response : "ai-panel"
    } catch (error) {
      addNotification("Text analysis failed", "error")
      return "ai-panel"
    }
  }, [])

  // Create custom panel with AI
  const createCustomPanel = useCallback(
    async (description: string): Promise<string> => {
      try {
        addNotification("Creating custom panel...", "info")

        // In a real app, this would generate code and create a new panel type
        // For now, we'll just create an AI panel with the description
        const id = addPanel("ai-panel-creator", "Custom Panel", { description })

        addNotification("Custom panel created", "success")
        return id
      } catch (error) {
        addNotification("Failed to create custom panel", "error")
        return ""
      }
    },
    [addPanel],
  )

  // Save state to localStorage
  const saveState = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const state = {
          panels,
          settings,
          user: { ...user, isLoggedIn: false }, // Don't persist login state
        }
        localStorage.setItem("appState", JSON.stringify(state))
        addNotification("State saved", "success")
      } catch (error) {
        addNotification("Failed to save state", "error")
      }
    }
  }, [panels, settings, user])

  // Load state from localStorage
  const loadState = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const savedState = localStorage.getItem("appState")
        if (savedState) {
          const state = JSON.parse(savedState)
          setPanels(state.panels || [])
          setSettings((prev) => ({ ...prev, ...state.settings }))
          // Don't restore login state
          addNotification("State loaded", "success")
        }
      } catch (error) {
        addNotification("Failed to load state", "error")
      }
    }
  }, [])

  // Reset state
  const resetState = useCallback(() => {
    setPanels([])
    setSettings(defaultSettings)
    setNotifications([])
    addNotification("State reset", "info")
  }, [])

  // Create the context value
  const contextValue: AppContextType = {
    panels,
    addPanel,
    removePanel,
    updatePanelPosition,
    updatePanelSize,
    updatePanelZIndex,
    updatePanelContent,
    updatePanelSettings,
    getPanelById,
    connectPanels,
    disconnectPanels,
    settings,
    updateSettings,
    notifications,
    addNotification,
    removeNotification,
    user,
    login,
    logout,
    register,
    isPrivacyModeEnabled,
    togglePrivacyMode,
    analyzeFile,
    analyzeText,
    createCustomPanel,
    getMaxZIndex,
    saveState,
    loadState,
    resetState,
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

