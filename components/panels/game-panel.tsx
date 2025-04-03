"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Gamepad2, Plus, Trash, Play, Pause, Save, Download, Upload, Maximize2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Game {
  id: string
  name: string
  url: string
  thumbnail?: string
  category: string
  favorite: boolean
  lastPlayed?: number
}

interface GameSettings {
  fullscreen: boolean
  muted: boolean
  highPerformance: boolean
  saveProgress: boolean
  allowGamepads: boolean
  allowKeyboard: boolean
  allowMouse: boolean
  customCSS: string
}

export default function GamePanel() {
  const { toast } = useToast()
  const [games, setGames] = useState<Game[]>([])
  const [activeGameId, setActiveGameId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [newGameName, setNewGameName] = useState("")
  const [newGameUrl, setNewGameUrl] = useState("")
  const [newGameCategory, setNewGameCategory] = useState("arcade")
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    fullscreen: false,
    muted: false,
    highPerformance: true,
    saveProgress: true,
    allowGamepads: true,
    allowKeyboard: true,
    allowMouse: true,
    customCSS: "",
  })
  const [customGameCode, setCustomGameCode] = useState("")
  const [isAddingCustomGame, setIsAddingCustomGame] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Load games from localStorage on initial render
  useEffect(() => {
    const savedGames = localStorage.getItem("games")
    if (savedGames) {
      try {
        setGames(JSON.parse(savedGames))
      } catch (e) {
        console.error("Failed to parse saved games", e)
      }
    } else {
      // Add some default games
      const defaultGames: Game[] = [
        {
          id: "1",
          name: "2048",
          url: "https://play2048.co/",
          category: "puzzle",
          favorite: false,
        },
        {
          id: "2",
          name: "Flappy Bird",
          url: "https://flappybird.io/",
          category: "arcade",
          favorite: false,
        },
        {
          id: "3",
          name: "Tetris",
          url: "https://tetris.com/play-tetris",
          category: "puzzle",
          favorite: true,
        },
        {
          id: "4",
          name: "Pacman",
          url: "https://www.google.com/logos/2010/pacman10-i.html",
          category: "arcade",
          favorite: true,
        },
      ]
      setGames(defaultGames)
      localStorage.setItem("games", JSON.stringify(defaultGames))
    }

    // Load settings
    const savedSettings = localStorage.getItem("game-settings")
    if (savedSettings) {
      try {
        setGameSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error("Failed to parse saved game settings", e)
      }
    }
  }, [])

  // Save games to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("games", JSON.stringify(games))
  }, [games])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("game-settings", JSON.stringify(gameSettings))
  }, [gameSettings])

  // Update last played timestamp when a game is played
  useEffect(() => {
    if (isPlaying && activeGameId) {
      setGames(games.map((game) => (game.id === activeGameId ? { ...game, lastPlayed: Date.now() } : game)))
    }
  }, [isPlaying, activeGameId, games])

  const addGame = () => {
    if (!newGameName.trim() || !newGameUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name and URL for the game",
        variant: "destructive",
      })
      return
    }

    // Validate URL
    try {
      new URL(newGameUrl)
    } catch (e) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
      return
    }

    const newGame: Game = {
      id: Date.now().toString(),
      name: newGameName,
      url: newGameUrl,
      category: newGameCategory,
      favorite: false,
    }

    setGames([...games, newGame])
    setNewGameName("")
    setNewGameUrl("")

    toast({
      title: "Game Added",
      description: `${newGameName} has been added to your library`,
    })
  }

  const addCustomGame = () => {
    if (!customGameCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter custom game code",
        variant: "destructive",
      })
      return
    }

    // Create a blob URL for the custom game
    const blob = new Blob([customGameCode], { type: "text/html" })
    const url = URL.createObjectURL(blob)

    const newGame: Game = {
      id: Date.now().toString(),
      name: "Custom Game " + new Date().toLocaleString(),
      url: url,
      category: "custom",
      favorite: false,
    }

    setGames([...games, newGame])
    setCustomGameCode("")
    setIsAddingCustomGame(false)

    toast({
      title: "Custom Game Added",
      description: "Your custom game has been added to your library",
    })
  }

  const removeGame = (id: string) => {
    // If the game is a blob URL, revoke it
    const game = games.find((g) => g.id === id)
    if (game && game.url.startsWith("blob:")) {
      URL.revokeObjectURL(game.url)
    }

    setGames(games.filter((game) => game.id !== id))

    if (activeGameId === id) {
      setActiveGameId(null)
      setIsPlaying(false)
    }

    toast({
      title: "Game Removed",
      description: "The game has been removed from your library",
    })
  }

  const toggleFavorite = (id: string) => {
    setGames(games.map((game) => (game.id === id ? { ...game, favorite: !game.favorite } : game)))
  }

  const playGame = (id: string) => {
    setActiveGameId(id)
    setIsPlaying(true)
  }

  const stopGame = () => {
    setIsPlaying(false)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setGameSettings({ ...gameSettings, fullscreen: !isFullscreen })
  }

  const exportGames = () => {
    const exportData = {
      games: games.filter((game) => !game.url.startsWith("blob:")), // Don't export blob URLs
      settings: gameSettings,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "game-library.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Library Exported",
      description: "Your game library has been exported",
    })
  }

  const importGames = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        if (data.games && Array.isArray(data.games)) {
          setGames((prevGames) => {
            // Merge with existing games, avoiding duplicates
            const existingUrls = new Set(prevGames.map((g) => g.url))
            const newGames = data.games.filter((g: Game) => !existingUrls.has(g.url))
            return [...prevGames, ...newGames]
          })
        }

        if (data.settings) {
          setGameSettings({ ...gameSettings, ...data.settings })
        }

        toast({
          title: "Library Imported",
          description: "Your game library has been imported",
        })
      } catch (error) {
        console.error("Error importing games:", error)
        toast({
          title: "Import Error",
          description: "Failed to import game library",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const filteredGames = games.filter(
    (game) =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeGame = activeGameId ? games.find((game) => game.id === activeGameId) : null

  const formatLastPlayed = (timestamp?: number) => {
    if (!timestamp) return "Never played"

    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="library" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="library">Game Library</TabsTrigger>
          <TabsTrigger value="play">Play Game</TabsTrigger>
          <TabsTrigger value="add">Add Game</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="flex-1 flex flex-col p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery("")}
                >
                  <Trash className="h-3 w-3" />
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={exportGames}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>

              <Button variant="outline" size="sm" onClick={() => document.getElementById("import-games")?.click()}>
                <Upload className="h-4 w-4 mr-1" />
                Import
              </Button>
              <input id="import-games" type="file" accept=".json" className="hidden" onChange={importGames} />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {filteredGames.map((game) => (
                  <div key={game.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{game.name}</h3>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleFavorite(game.id)}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={game.favorite ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`h-4 w-4 ${game.favorite ? "text-yellow-400" : ""}`}
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeGame(game.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-1 bg-muted rounded-full">
                        {game.category.charAt(0).toUpperCase() + game.category.slice(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatLastPlayed(game.lastPlayed)}</span>
                    </div>

                    <Button variant="default" size="sm" className="w-full" onClick={() => playGame(game.id)}>
                      <Play className="h-4 w-4 mr-1" />
                      Play
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Gamepad2 className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  {games.length === 0 ? "No games in your library" : "No games match your search"}
                </p>
                {games.length === 0 && (
                  <Button variant="outline" onClick={() => document.getElementById("add-tab")?.click()}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Game
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="play" className="flex-1 flex flex-col">
          {isPlaying && activeGame ? (
            <div className="relative flex-1 flex flex-col">
              <div className="flex items-center justify-between p-2 border-b">
                <h3 className="font-medium">{activeGame.name}</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={stopGame}>
                    <Pause className="h-4 w-4 mr-1" />
                    Stop
                  </Button>
                  <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                    <Maximize2 className="h-4 w-4 mr-1" />
                    {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  </Button>
                </div>
              </div>

              <div className={`flex-1 ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
                <iframe
                  ref={iframeRef}
                  src={activeGame.url}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  title={activeGame.name}
                  allowFullScreen={gameSettings.fullscreen}
                ></iframe>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Gamepad2 className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No game is currently playing</p>
              <p className="text-sm text-muted-foreground mb-4">Select a game from your library to start playing</p>
              <Button variant="outline" onClick={() => document.getElementById("library-tab")?.click()}>
                <Play className="h-4 w-4 mr-1" />
                Select Game
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="flex-1 p-4">
          <Tabs defaultValue={isAddingCustomGame ? "custom" : "url"}>
            <TabsList className="mb-4">
              <TabsTrigger value="url" onClick={() => setIsAddingCustomGame(false)}>
                Add by URL
              </TabsTrigger>
              <TabsTrigger value="custom" onClick={() => setIsAddingCustomGame(true)}>
                Custom Game
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="game-name">Game Name</Label>
                <Input
                  id="game-name"
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                  placeholder="Enter game name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="game-url">Game URL</Label>
                <Input
                  id="game-url"
                  value={newGameUrl}
                  onChange={(e) => setNewGameUrl(e.target.value)}
                  placeholder="https://example.com/game"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="game-category">Category</Label>
                <Select value={newGameCategory} onValueChange={setNewGameCategory}>
                  <SelectTrigger id="game-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arcade">Arcade</SelectItem>
                    <SelectItem value="puzzle">Puzzle</SelectItem>
                    <SelectItem value="strategy">Strategy</SelectItem>
                    <SelectItem value="action">Action</SelectItem>
                    <SelectItem value="rpg">RPG</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="racing">Racing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={addGame} disabled={!newGameName.trim() || !newGameUrl.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Add Game
              </Button>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-game-code">Custom Game HTML</Label>
                <Textarea
                  id="custom-game-code"
                  value={customGameCode}
                  onChange={(e) => setCustomGameCode(e.target.value)}
                  placeholder="Paste your HTML game code here..."
                  className="min-h-[300px] font-mono"
                />
              </div>

              <Button onClick={addCustomGame} disabled={!customGameCode.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Add Custom Game
              </Button>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 p-4">
          <div className="space-y-6">
            <h3 className="font-medium">Game Settings</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="fullscreen">Fullscreen Mode</Label>
                  <p className="text-xs text-muted-foreground">Allow games to run in fullscreen mode</p>
                </div>
                <Switch
                  id="fullscreen"
                  checked={gameSettings.fullscreen}
                  onCheckedChange={(checked) => setGameSettings({ ...gameSettings, fullscreen: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="muted">Mute Games</Label>
                  <p className="text-xs text-muted-foreground">Mute all game audio</p>
                </div>
                <Switch
                  id="muted"
                  checked={gameSettings.muted}
                  onCheckedChange={(checked) => setGameSettings({ ...gameSettings, muted: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-performance">High Performance Mode</Label>
                  <p className="text-xs text-muted-foreground">Optimize for performance (may use more resources)</p>
                </div>
                <Switch
                  id="high-performance"
                  checked={gameSettings.highPerformance}
                  onCheckedChange={(checked) => setGameSettings({ ...gameSettings, highPerformance: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="save-progress">Save Game Progress</Label>
                  <p className="text-xs text-muted-foreground">Allow games to save progress in local storage</p>
                </div>
                <Switch
                  id="save-progress"
                  checked={gameSettings.saveProgress}
                  onCheckedChange={(checked) => setGameSettings({ ...gameSettings, saveProgress: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-gamepads">Allow Gamepads</Label>
                  <p className="text-xs text-muted-foreground">Enable gamepad support for compatible games</p>
                </div>
                <Switch
                  id="allow-gamepads"
                  checked={gameSettings.allowGamepads}
                  onCheckedChange={(checked) => setGameSettings({ ...gameSettings, allowGamepads: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-keyboard">Allow Keyboard</Label>
                  <p className="text-xs text-muted-foreground">Enable keyboard input for games</p>
                </div>
                <Switch
                  id="allow-keyboard"
                  checked={gameSettings.allowKeyboard}
                  onCheckedChange={(checked) => setGameSettings({ ...gameSettings, allowKeyboard: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-mouse">Allow Mouse</Label>
                  <p className="text-xs text-muted-foreground">Enable mouse input for games</p>
                </div>
                <Switch
                  id="allow-mouse"
                  checked={gameSettings.allowMouse}
                  onCheckedChange={(checked) => setGameSettings({ ...gameSettings, allowMouse: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-css">Custom CSS</Label>
                <Textarea
                  id="custom-css"
                  value={gameSettings.customCSS}
                  onChange={(e) => setGameSettings({ ...gameSettings, customCSS: e.target.value })}
                  placeholder="Add custom CSS for games..."
                  className="min-h-[100px] font-mono"
                />
              </div>

              <Button
                onClick={() => {
                  localStorage.setItem("game-settings", JSON.stringify(gameSettings))
                  toast({
                    title: "Settings Saved",
                    description: "Your game settings have been saved",
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

