"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Globe, Youtube, ShoppingCart, Image, FileText, RefreshCw } from "lucide-react"

export default function SearchPanel() {
  const [query, setQuery] = useState("")
  const [searchType, setSearchType] = useState("web")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    setIsSearching(true)
    setResults([])

    // Simulate search results
    setTimeout(() => {
      let mockResults: any[] = []

      switch (searchType) {
        case "web":
          mockResults = [
            {
              title: "Example Domain",
              url: "https://example.com",
              description:
                "Example Domain. This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.",
            },
            {
              title: "Sample Website - Learn About Web Development",
              url: "https://sample-website.com",
              description:
                "Learn about web development, programming, and design. Tutorials, articles, and resources for beginners and advanced developers.",
            },
            {
              title: "Web Search Results for " + query,
              url: "https://search-results.com/" + encodeURIComponent(query),
              description:
                "Find the best results for your search query. Explore websites, articles, and resources related to " +
                query +
                ".",
            },
          ]
          break

        case "images":
          mockResults = [
            {
              title: "Image 1",
              url: "https://example.com/image1.jpg",
              thumbnailUrl: "/placeholder.svg?height=100&width=150",
              width: 800,
              height: 600,
            },
            {
              title: "Image 2",
              url: "https://example.com/image2.jpg",
              thumbnailUrl: "/placeholder.svg?height=100&width=150",
              width: 1200,
              height: 800,
            },
            {
              title: "Image 3",
              url: "https://example.com/image3.jpg",
              thumbnailUrl: "/placeholder.svg?height=100&width=150",
              width: 600,
              height: 400,
            },
          ]
          break

        case "videos":
          mockResults = [
            {
              title: "Video Tutorial: " + query,
              url: "https://example.com/video1",
              thumbnailUrl: "/placeholder.svg?height=90&width=160",
              duration: "10:15",
              channel: "Tutorial Channel",
            },
            {
              title: "How to Learn " + query + " - Complete Guide",
              url: "https://example.com/video2",
              thumbnailUrl: "/placeholder.svg?height=90&width=160",
              duration: "25:42",
              channel: "Learning Hub",
            },
            {
              title: query + " Explained in 5 Minutes",
              url: "https://example.com/video3",
              thumbnailUrl: "/placeholder.svg?height=90&width=160",
              duration: "5:03",
              channel: "Quick Explainers",
            },
          ]
          break

        case "shopping":
          mockResults = [
            {
              title: query + " - Premium Edition",
              url: "https://example.com/product1",
              thumbnailUrl: "/placeholder.svg?height=100&width=100",
              price: "$49.99",
              rating: 4.5,
            },
            {
              title: "Budget " + query,
              url: "https://example.com/product2",
              thumbnailUrl: "/placeholder.svg?height=100&width=100",
              price: "$19.99",
              rating: 3.8,
            },
            {
              title: "Professional " + query + " Kit",
              url: "https://example.com/product3",
              thumbnailUrl: "/placeholder.svg?height=100&width=100",
              price: "$99.99",
              rating: 4.9,
            },
          ]
          break

        case "news":
          mockResults = [
            {
              title: "Breaking: New Developments in " + query,
              url: "https://example.com/news1",
              source: "News Daily",
              time: "2 hours ago",
              description:
                "Recent developments have shown significant progress in the field of " +
                query +
                ". Experts are optimistic about future implications.",
            },
            {
              title: query + " Industry Sees Major Changes",
              url: "https://example.com/news2",
              source: "Tech Insider",
              time: "1 day ago",
              description:
                "The " +
                query +
                " industry is experiencing unprecedented changes due to recent technological advancements and market shifts.",
            },
            {
              title: "Opinion: The Future of " + query,
              url: "https://example.com/news3",
              source: "Future Trends",
              time: "3 days ago",
              description:
                "Our analysts predict significant growth in the " +
                query +
                " sector over the next five years. Here's what you need to know.",
            },
          ]
          break
      }

      setResults(mockResults)
      setIsSearching(false)
    }, 1500)
  }

  const renderResults = () => {
    if (isSearching) {
      return (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (results.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Enter a search query and click search to find results</p>
        </div>
      )
    }

    switch (searchType) {
      case "web":
        return (
          <div className="space-y-4 p-4">
            {results.map((result, index) => (
              <div key={index} className="space-y-1">
                <div className="text-xs text-muted-foreground">{result.url}</div>
                <h3 className="text-blue-600 hover:underline font-medium">
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    {result.title}
                  </a>
                </h3>
                <p className="text-sm">{result.description}</p>
              </div>
            ))}
          </div>
        )

      case "images":
        return (
          <div className="grid grid-cols-3 gap-4 p-4">
            {results.map((result, index) => (
              <div key={index} className="space-y-1">
                <a href={result.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={result.thumbnailUrl || "/placeholder.svg"}
                    alt={result.title}
                    className="w-full h-auto object-cover rounded"
                  />
                </a>
                <div className="text-xs truncate">{result.title}</div>
                <div className="text-xs text-muted-foreground">
                  {result.width} × {result.height}
                </div>
              </div>
            ))}
          </div>
        )

      case "videos":
        return (
          <div className="space-y-4 p-4">
            {results.map((result, index) => (
              <div key={index} className="flex space-x-3">
                <a href={result.url} target="_blank" rel="noopener noreferrer">
                  <div className="relative">
                    <img
                      src={result.thumbnailUrl || "/placeholder.svg"}
                      alt={result.title}
                      className="w-40 h-auto object-cover rounded"
                    />
                    <div className="absolute bottom-1 right-1 bg-black text-white text-xs px-1 rounded">
                      {result.duration}
                    </div>
                  </div>
                </a>
                <div className="space-y-1">
                  <h3 className="font-medium hover:underline">
                    <a href={result.url} target="_blank" rel="noopener noreferrer">
                      {result.title}
                    </a>
                  </h3>
                  <div className="text-xs text-muted-foreground">{result.channel}</div>
                </div>
              </div>
            ))}
          </div>
        )

      case "shopping":
        return (
          <div className="grid grid-cols-3 gap-4 p-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded p-3 space-y-2">
                <div className="flex justify-center">
                  <img
                    src={result.thumbnailUrl || "/placeholder.svg"}
                    alt={result.title}
                    className="h-24 w-auto object-contain"
                  />
                </div>
                <h3 className="font-medium text-sm hover:underline">
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    {result.title}
                  </a>
                </h3>
                <div className="text-lg font-bold">{result.price}</div>
                <div className="text-xs text-amber-500">
                  {"★".repeat(Math.floor(result.rating))}
                  {"☆".repeat(5 - Math.floor(result.rating))}
                  <span className="text-muted-foreground ml-1">{result.rating}</span>
                </div>
              </div>
            ))}
          </div>
        )

      case "news":
        return (
          <div className="space-y-4 p-4">
            {results.map((result, index) => (
              <div key={index} className="space-y-1">
                <h3 className="font-medium hover:underline">
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    {result.title}
                  </a>
                </h3>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{result.source}</span>
                  <span className="mx-1">•</span>
                  <span>{result.time}</span>
                </div>
                <p className="text-sm">{result.description}</p>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <form onSubmit={handleSearch} className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the web..."
              className="pl-8"
            />
          </div>
          <Button type="submit" disabled={isSearching || !query.trim()}>
            {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </form>
      </div>

      <Tabs value={searchType} onValueChange={setSearchType} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="web" className="flex items-center">
            <Globe className="h-4 w-4 mr-1" />
            Web
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center">
            <Image className="h-4 w-4 mr-1" />
            Images
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center">
            <Youtube className="h-4 w-4 mr-1" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="shopping" className="flex items-center">
            <ShoppingCart className="h-4 w-4 mr-1" />
            Shopping
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            News
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="web" className="h-full">
            {renderResults()}
          </TabsContent>
          <TabsContent value="images" className="h-full">
            {renderResults()}
          </TabsContent>
          <TabsContent value="videos" className="h-full">
            {renderResults()}
          </TabsContent>
          <TabsContent value="shopping" className="h-full">
            {renderResults()}
          </TabsContent>
          <TabsContent value="news" className="h-full">
            {renderResults()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

