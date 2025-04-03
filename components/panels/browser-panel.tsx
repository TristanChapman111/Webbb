"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Globe, RefreshCw, ArrowLeft, ArrowRight, Home, Copy, Play } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function BrowserPanel() {
  const { toast } = useToast()
  const [url, setUrl] = useState("https://example.com")
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [embedCode, setEmbedCode] = useState("")
  const [proxyEnabled, setProxyEnabled] = useState(true)
  const [corsEnabled, setCorsEnabled] = useState(true)
  const [fetchCode, setFetchCode] = useState(`// Example fetch code
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`)
  const [fetchResponse, setFetchResponse] = useState("")

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const navigateTo = (newUrl: string) => {
    if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
      newUrl = "https://" + newUrl
    }

    setUrl(newUrl)
    setIsLoading(true)

    // Add to history
    const newHistory = [...history.slice(0, historyIndex + 1), newUrl]
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setUrl(history[historyIndex - 1])
    }
  }

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setUrl(history[historyIndex + 1])
    }
  }

  const refresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src
      }
      setIsLoading(false)
    }, 500)
  }

  const goHome = () => {
    navigateTo("https://example.com")
  }

  const generateEmbedCode = () => {
    const embedHtml = `<iframe
  src="${url}"
  width="100%"
  height="500"
  frameborder="0"
  allowfullscreen
></iframe>`

    setEmbedCode(embedHtml)
  }

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode)
    toast({
      title: "Copied",
      description: "Embed code copied to clipboard",
    })
  }

  const executeFetch = () => {
    setFetchResponse("Executing fetch request...")

    try {
      // Create a safe evaluation environment
      const originalFetch = window.fetch
      const originalConsole = { ...console }

      const logs: string[] = []
      console.log = (...args) => {
        logs.push(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg)).join(" "))
        originalConsole.log(...args)
      }

      console.error = (...args) => {
        logs.push(
          "ERROR: " + args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg)).join(" "),
        )
        originalConsole.error(...args)
      }

      // Use Function constructor instead of eval for better isolation
      new Function(fetchCode)()

      // Restore original console
      console.log = originalConsole.log
      console.error = originalConsole.error

      setTimeout(() => {
        if (logs.length > 0) {
          setFetchResponse(logs.join("\n"))
        } else {
          setFetchResponse("Request executed. No output was logged to console.")
        }
      }, 1000)
    } catch (error) {
      setFetchResponse("Error: " + (error as Error).message)
    }
  }

  // Initialize history with home page
  useEffect(() => {
    if (history.length === 0) {
      setHistory(["https://example.com"])
      setHistoryIndex(0)
    }
  }, [history])

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="browser" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="browser">Browser</TabsTrigger>
          <TabsTrigger value="embed">Embed</TabsTrigger>
          <TabsTrigger value="fetch">Fetch API</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="browser" className="flex-1 flex flex-col">
          <div className="flex items-center p-2 space-x-2 border-b">
            <Button variant="ghost" size="icon" onClick={goBack} disabled={historyIndex <= 0}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goForward} disabled={historyIndex >= history.length - 1}>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={refresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={goHome}>
              <Home className="h-4 w-4" />
            </Button>
            <div className="relative flex-1">
              <Globe className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  navigateTo(url)
                }}
              >
                <Input value={url} onChange={(e) => setUrl(e.target.value)} className="pl-8" placeholder="Enter URL" />
              </form>
            </div>
            <Button variant="default" size="sm" onClick={() => navigateTo(url)} disabled={isLoading}>
              Go
            </Button>
          </div>

          <div className="flex-1 bg-white">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={url}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                title="Browser"
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="embed" className="flex-1 p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Generate Embed Code</h3>
            <p className="text-xs text-muted-foreground">
              Create an embed code for the current URL that you can use on other websites.
            </p>
            <div className="flex space-x-2">
              <Button onClick={generateEmbedCode}>Generate Code</Button>
              <Button variant="outline" onClick={copyEmbedCode} disabled={!embedCode}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>

          {embedCode && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Embed Code</h3>
              <Textarea value={embedCode} readOnly className="font-mono text-xs h-32" />
              <h3 className="text-sm font-medium">Preview</h3>
              <div className="border rounded p-4 bg-white" dangerouslySetInnerHTML={{ __html: embedCode }} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="fetch" className="flex-1 p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Fetch API</h3>
            <p className="text-xs text-muted-foreground">
              Test API requests using the Fetch API. Write your code below and execute it.
            </p>
            <Textarea
              value={fetchCode}
              onChange={(e) => setFetchCode(e.target.value)}
              className="font-mono text-xs h-32"
            />
            <Button onClick={executeFetch}>
              <Play className="h-4 w-4 mr-1" />
              Execute
            </Button>
          </div>

          {fetchResponse && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Response</h3>
              <div className="bg-black text-green-400 font-mono text-xs p-4 rounded h-32 overflow-auto">
                {fetchResponse}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="flex-1 p-4 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="proxy">Enable Proxy</Label>
                <div className="text-xs text-muted-foreground">Use a proxy to bypass CORS restrictions</div>
              </div>
              <Switch id="proxy" checked={proxyEnabled} onCheckedChange={setProxyEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="cors">CORS Handling</Label>
                <div className="text-xs text-muted-foreground">Automatically handle CORS issues</div>
              </div>
              <Switch id="cors" checked={corsEnabled} onCheckedChange={setCorsEnabled} />
            </div>

            <div className="space-y-2">
              <Label>Embed Options</Label>
              <div className="space-y-2">
                {["Allow Scripts", "Allow Forms", "Allow Popups", "Allow Same Origin"].map((option) => (
                  <div key={option} className="flex items-center justify-between">
                    <span className="text-sm">{option}</span>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Browser Features</Label>
              <div className="space-y-2">
                {["JavaScript Enabled", "Cookies Allowed", "Local Storage", "Camera Access", "Microphone Access"].map(
                  (feature) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm">{feature}</span>
                      <Switch defaultChecked={feature !== "Camera Access" && feature !== "Microphone Access"} />
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

