"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Keyboard, Monitor, Plus, Edit, Save, Trash } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface Shortcut {
  id: string
  name: string
  keys: {
    mac: string[]
    windows: string[]
  }
  action: string
  category: string
}

export default function KeyboardShortcutsPanel() {
  const { toast } = useToast()
  const [platform, setPlatform] = useState<"mac" | "windows">("mac")
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null)
  const [newShortcutName, setNewShortcutName] = useState("")
  const [newShortcutAction, setNewShortcutAction] = useState("")
  const [newShortcutCategory, setNewShortcutCategory] = useState("general")
  const [newShortcutMacKeys, setNewShortcutMacKeys] = useState("")
  const [newShortcutWindowsKeys, setNewShortcutWindowsKeys] = useState("")

  const [shortcuts, setShortcuts] = useState<Shortcut[]>([
    {
      id: "1",
      name: "Settings Panel",
      keys: {
        mac: ["Cmd", "Alt", "S"],
        windows: ["Ctrl", "Alt", "S"],
      },
      action: "Open the settings panel",
      category: "panels",
    },
    {
      id: "2",
      name: "Code Panel",
      keys: {
        mac: ["Cmd", "Alt", "C"],
        windows: ["Ctrl", "Alt", "C"],
      },
      action: "Open the code panel",
      category: "panels",
    },
    {
      id: "3",
      name: "Browser Panel",
      keys: {
        mac: ["Cmd", "Alt", "B"],
        windows: ["Ctrl", "Alt", "B"],
      },
      action: "Open the browser panel",
      category: "panels",
    },
    {
      id: "4",
      name: "Notes Panel",
      keys: {
        mac: ["Cmd", "Alt", "N"],
        windows: ["Ctrl", "Alt", "N"],
      },
      action: "Open the notes panel",
      category: "panels",
    },
    {
      id: "5",
      name: "Terminal Panel",
      keys: {
        mac: ["Cmd", "Alt", "T"],
        windows: ["Ctrl", "Alt", "T"],
      },
      action: "Open the terminal panel",
      category: "panels",
    },
    {
      id: "6",
      name: "Whiteboard Panel",
      keys: {
        mac: ["Cmd", "Alt", "W"],
        windows: ["Ctrl", "Alt", "W"],
      },
      action: "Open the whiteboard panel",
      category: "panels",
    },
    {
      id: "7",
      name: "AI Panel",
      keys: {
        mac: ["Cmd", "Alt", "A"],
        windows: ["Ctrl", "Alt", "A"],
      },
      action: "Open the AI panel",
      category: "panels",
    },
    {
      id: "8",
      name: "Reload Page",
      keys: {
        mac: ["Cmd", "Alt", "R"],
        windows: ["Ctrl", "Alt", "R"],
      },
      action: "Reload the application",
      category: "general",
    },
    {
      id: "9",
      name: "Privacy Mode",
      keys: {
        mac: ["Cmd", "Alt", "P"],
        windows: ["Ctrl", "Alt", "P"],
      },
      action: "Toggle privacy mode",
      category: "general",
    },
    {
      id: "10",
      name: "Keyboard Shortcuts",
      keys: {
        mac: ["Cmd", "Alt", "K"],
        windows: ["Ctrl", "Alt", "K"],
      },
      action: "Open keyboard shortcuts panel",
      category: "panels",
    },
  ])

  const filteredShortcuts = shortcuts.filter(
    (shortcut) =>
      shortcut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)))

  const startAddShortcut = () => {
    setIsEditing(true)
    setEditingShortcut(null)
    setNewShortcutName("")
    setNewShortcutAction("")
    setNewShortcutCategory("general")
    setNewShortcutMacKeys("")
    setNewShortcutWindowsKeys("")
  }

  const startEditShortcut = (shortcut: Shortcut) => {
    setIsEditing(true)
    setEditingShortcut(shortcut)
    setNewShortcutName(shortcut.name)
    setNewShortcutAction(shortcut.action)
    setNewShortcutCategory(shortcut.category)
    setNewShortcutMacKeys(shortcut.keys.mac.join(" + "))
    setNewShortcutWindowsKeys(shortcut.keys.windows.join(" + "))
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditingShortcut(null)
  }

  const saveShortcut = () => {
    if (
      !newShortcutName.trim() ||
      !newShortcutAction.trim() ||
      !newShortcutMacKeys.trim() ||
      !newShortcutWindowsKeys.trim()
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const macKeys = newShortcutMacKeys.split("+").map((k) => k.trim())
    const windowsKeys = newShortcutWindowsKeys.split("+").map((k) => k.trim())

    if (editingShortcut) {
      // Update existing shortcut
      setShortcuts(
        shortcuts.map((s) =>
          s.id === editingShortcut.id
            ? {
                ...s,
                name: newShortcutName,
                action: newShortcutAction,
                category: newShortcutCategory,
                keys: {
                  mac: macKeys,
                  windows: windowsKeys,
                },
              }
            : s,
        ),
      )

      toast({
        title: "Shortcut Updated",
        description: `Updated shortcut: ${newShortcutName}`,
      })
    } else {
      // Add new shortcut
      const newShortcut: Shortcut = {
        id: Date.now().toString(),
        name: newShortcutName,
        action: newShortcutAction,
        category: newShortcutCategory,
        keys: {
          mac: macKeys,
          windows: windowsKeys,
        },
      }

      setShortcuts([...shortcuts, newShortcut])

      toast({
        title: "Shortcut Added",
        description: `Added new shortcut: ${newShortcutName}`,
      })
    }

    setIsEditing(false)
    setEditingShortcut(null)
  }

  const deleteShortcut = (id: string) => {
    if (confirm("Are you sure you want to delete this shortcut?")) {
      setShortcuts(shortcuts.filter((s) => s.id !== id))

      toast({
        title: "Shortcut Deleted",
        description: "The keyboard shortcut has been removed",
      })
    }
  }

  const formatKeys = (keys: string[]) => {
    return keys
      .map((key) => {
        switch (key.toLowerCase()) {
          case "cmd":
          case "command":
            return "⌘"
          case "alt":
          case "option":
            return "⌥"
          case "shift":
            return "⇧"
          case "ctrl":
          case "control":
            return platform === "mac" ? "⌃" : "Ctrl"
          default:
            return key
        }
      })
      .join(" + ")
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Keyboard className="h-4 w-4 mr-2" />
          <h3 className="font-medium">Keyboard Shortcuts</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant={platform === "mac" ? "default" : "outline"} size="sm" onClick={() => setPlatform("mac")}>
            <Monitor className="h-4 w-4 mr-1" />
            Mac
          </Button>
          <Button
            variant={platform === "windows" ? "default" : "outline"}
            size="sm"
            onClick={() => setPlatform("windows")}
          >
            <Monitor className="h-4 w-4 mr-1" />
            Windows
          </Button>
        </div>
      </div>

      <div className="p-4 border-b">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts..."
              className="pl-8"
            />
          </div>
          <Button onClick={startAddShortcut}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="p-4 space-y-4">
          <h3 className="font-medium">{editingShortcut ? "Edit Shortcut" : "Add New Shortcut"}</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shortcut-name">Name</Label>
              <Input
                id="shortcut-name"
                value={newShortcutName}
                onChange={(e) => setNewShortcutName(e.target.value)}
                placeholder="Shortcut name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortcut-action">Action</Label>
              <Input
                id="shortcut-action"
                value={newShortcutAction}
                onChange={(e) => setNewShortcutAction(e.target.value)}
                placeholder="What the shortcut does"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortcut-category">Category</Label>
              <Select value={newShortcutCategory} onValueChange={setNewShortcutCategory}>
                <SelectTrigger id="shortcut-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">New Category...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortcut-mac">Mac Keys</Label>
              <Input
                id="shortcut-mac"
                value={newShortcutMacKeys}
                onChange={(e) => setNewShortcutMacKeys(e.target.value)}
                placeholder="e.g. Cmd + Alt + S"
              />
              <p className="text-xs text-muted-foreground">Separate keys with + (e.g. Cmd + Alt + S)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortcut-windows">Windows Keys</Label>
              <Input
                id="shortcut-windows"
                value={newShortcutWindowsKeys}
                onChange={(e) => setNewShortcutWindowsKeys(e.target.value)}
                placeholder="e.g. Ctrl + Alt + S"
              />
              <p className="text-xs text-muted-foreground">Separate keys with + (e.g. Ctrl + Alt + S)</p>
            </div>

            <div className="flex space-x-2">
              <Button onClick={saveShortcut} className="flex-1">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" onClick={cancelEdit} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-auto p-4">
            <TabsContent value="all" className="mt-0">
              <div className="space-y-2">
                {filteredShortcuts.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                  >
                    <div>
                      <div className="font-medium">{shortcut.name}</div>
                      <div className="text-xs text-muted-foreground">{shortcut.action}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">
                        {formatKeys(shortcut.keys[platform])}
                      </kbd>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => startEditShortcut(shortcut)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => deleteShortcut(shortcut.id)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredShortcuts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Keyboard className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No shortcuts found. Try a different search or add a new shortcut.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={startAddShortcut}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Shortcut
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="space-y-2">
                  {filteredShortcuts
                    .filter((s) => s.category === category)
                    .map((shortcut) => (
                      <div
                        key={shortcut.id}
                        className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                      >
                        <div>
                          <div className="font-medium">{shortcut.name}</div>
                          <div className="text-xs text-muted-foreground">{shortcut.action}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">
                            {formatKeys(shortcut.keys[platform])}
                          </kbd>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => startEditShortcut(shortcut)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => deleteShortcut(shortcut.id)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {filteredShortcuts.filter((s) => s.category === category).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Keyboard className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No shortcuts found in this category.</p>
                      <Button variant="outline" className="mt-4" onClick={startAddShortcut}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Shortcut
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      )}
    </div>
  )
}

