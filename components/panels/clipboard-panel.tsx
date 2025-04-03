"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardIcon, Copy, Trash, Pin, Search, Clock, Star, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ClipboardItem {
  id: string
  content: string
  timestamp: number
  isPinned: boolean
  isFavorite: boolean
}

export default function ClipboardPanel() {
  const { toast } = useToast()
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [newClipboardItem, setNewClipboardItem] = useState("")

  // Load clipboard items from localStorage on initial render
  useEffect(() => {
    const savedItems = localStorage.getItem("clipboard-items")
    if (savedItems) {
      try {
        setClipboardItems(JSON.parse(savedItems))
      } catch (e) {
        console.error("Failed to parse saved clipboard items", e)
      }
    }
  }, [])

  // Save clipboard items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("clipboard-items", JSON.stringify(clipboardItems))
  }, [clipboardItems])

  // Listen for copy events (this is a simulation, as browsers don't allow direct clipboard monitoring)
  useEffect(() => {
    const simulateClipboardMonitoring = () => {
      // In a real implementation, this would use the Clipboard API
      // For now, we'll just add some sample items if none exist
      if (clipboardItems.length === 0) {
        setClipboardItems([
          {
            id: "1",
            content: "Sample clipboard text 1",
            timestamp: Date.now() - 3600000,
            isPinned: false,
            isFavorite: false,
          },
          {
            id: "2",
            content: "https://example.com",
            timestamp: Date.now() - 7200000,
            isPinned: true,
            isFavorite: false,
          },
          {
            id: "3",
            content: "Important note to remember",
            timestamp: Date.now() - 86400000,
            isPinned: false,
            isFavorite: true,
          },
        ])
      }
    }

    simulateClipboardMonitoring()
  }, [clipboardItems.length])

  const addClipboardItem = (content: string) => {
    // Check if content already exists
    if (clipboardItems.some((item) => item.content === content)) {
      toast({
        title: "Duplicate Item",
        description: "This item already exists in your clipboard history",
        variant: "destructive",
      })
      return
    }

    const newItem: ClipboardItem = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
      isPinned: false,
      isFavorite: false,
    }

    setClipboardItems([newItem, ...clipboardItems])
    setNewClipboardItem("")

    toast({
      title: "Item Added",
      description: "New item added to clipboard history",
    })
  }

  const removeClipboardItem = (id: string) => {
    setClipboardItems(clipboardItems.filter((item) => item.id !== id))

    toast({
      title: "Item Removed",
      description: "Item removed from clipboard history",
    })
  }

  const togglePinned = (id: string) => {
    setClipboardItems(clipboardItems.map((item) => (item.id === id ? { ...item, isPinned: !item.isPinned } : item)))
  }

  const toggleFavorite = (id: string) => {
    setClipboardItems(clipboardItems.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item)))
  }

  const copyToClipboard = (content: string) => {
    // Only execute in browser environment
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(content)

      toast({
        title: "Copied",
        description: "Content copied to clipboard",
      })
    }
  }

  const clearClipboard = () => {
    if (confirm("Are you sure you want to clear all unpinned clipboard items?")) {
      setClipboardItems(clipboardItems.filter((item) => item.isPinned))

      toast({
        title: "Clipboard Cleared",
        description: "All unpinned items have been cleared",
      })
    }
  }

  const filteredItems = clipboardItems.filter((item) => item.content.toLowerCase().includes(searchQuery.toLowerCase()))

  const pinnedItems = filteredItems.filter((item) => item.isPinned)
  const favoriteItems = filteredItems.filter((item) => item.isFavorite && !item.isPinned)
  const regularItems = filteredItems.filter((item) => !item.isPinned && !item.isFavorite)

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) {
      return "Just now"
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} min ago`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} hr ago`
    } else {
      return new Date(timestamp).toLocaleDateString()
    }
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pinned">Pinned</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <div className="p-4 border-b flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clipboard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" onClick={clearClipboard}>
            <Trash className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>

        <div className="p-4 border-b flex space-x-2">
          <Input
            placeholder="Add new clipboard item..."
            value={newClipboardItem}
            onChange={(e) => setNewClipboardItem(e.target.value)}
          />
          <Button onClick={() => addClipboardItem(newClipboardItem)} disabled={!newClipboardItem.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <TabsContent value="all" className="flex-1 overflow-auto p-4">
          {filteredItems.length > 0 ? (
            <div className="space-y-4">
              {pinnedItems.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2 flex items-center">
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </h3>
                  <div className="space-y-2">
                    {pinnedItems.map((item) => (
                      <div key={item.id} className="border rounded p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimestamp(item.timestamp)}
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleFavorite(item.id)}
                            >
                              <Star className={`h-3 w-3 ${item.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => togglePinned(item.id)}
                            >
                              <Pin className="h-3 w-3 fill-blue-500 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(item.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeClipboardItem(item.id)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="break-all">{item.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {favoriteItems.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2 flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    Favorites
                  </h3>
                  <div className="space-y-2">
                    {favoriteItems.map((item) => (
                      <div key={item.id} className="border rounded p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimestamp(item.timestamp)}
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleFavorite(item.id)}
                            >
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => togglePinned(item.id)}
                            >
                              <Pin className={`h-3 w-3 ${item.isPinned ? "fill-blue-500 text-blue-500" : ""}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(item.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeClipboardItem(item.id)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="break-all">{item.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {regularItems.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2 flex items-center">
                    <ClipboardIcon className="h-3 w-3 mr-1" />
                    Recent
                  </h3>
                  <div className="space-y-2">
                    {regularItems.map((item) => (
                      <div key={item.id} className="border rounded p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimestamp(item.timestamp)}
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleFavorite(item.id)}
                            >
                              <Star className={`h-3 w-3 ${item.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => togglePinned(item.id)}
                            >
                              <Pin className={`h-3 w-3 ${item.isPinned ? "fill-blue-500 text-blue-500" : ""}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(item.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeClipboardItem(item.id)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="break-all">{item.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ClipboardIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {clipboardItems.length === 0 ? "Your clipboard history is empty" : "No items match your search"}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pinned" className="flex-1 overflow-auto p-4">
          {pinnedItems.length > 0 ? (
            <div className="space-y-2">
              {pinnedItems.map((item) => (
                <div key={item.id} className="border rounded p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimestamp(item.timestamp)}
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleFavorite(item.id)}>
                        <Star className={`h-3 w-3 ${item.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePinned(item.id)}>
                        <Pin className="h-3 w-3 fill-blue-500 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(item.content)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeClipboardItem(item.id)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="break-all">{item.content}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Pin className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You don't have any pinned items</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="flex-1 overflow-auto p-4">
          {filteredItems.filter((item) => item.isFavorite).length > 0 ? (
            <div className="space-y-2">
              {filteredItems
                .filter((item) => item.isFavorite)
                .map((item) => (
                  <div key={item.id} className="border rounded p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimestamp(item.timestamp)}
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleFavorite(item.id)}>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePinned(item.id)}>
                          <Pin className={`h-3 w-3 ${item.isPinned ? "fill-blue-500 text-blue-500" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(item.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeClipboardItem(item.id)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="break-all">{item.content}</div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Star className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You don't have any favorite items</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

