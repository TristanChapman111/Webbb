"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { generateAIResponse } from "@/lib/ai-service"
import { RefreshCw, Save, Download, Copy, Share2, Sparkles, Lightbulb, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AIEnhancedPanelProps {
  title: string
  description?: string
  initialContent?: string
  panelType: string
  isTemporary?: boolean
  query?: string
}

export default function AIEnhancedPanel({
  title,
  description = "This panel was auto-generated based on your search query.",
  initialContent = "",
  panelType,
  isTemporary = true,
  query = "",
}: AIEnhancedPanelProps) {
  const { toast } = useToast()
  const [content, setContent] = useState(initialContent)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isInitializing, setIsInitializing] = useState(!initialContent)
  const [activeTab, setActiveTab] = useState("content")
  const contentRef = useRef<HTMLDivElement>(null)

  const [settings, setSettings] = useState({
    enableAI: true,
    autoSave: false,
    darkMode: false,
    notifications: true,
    fontSize: 16,
    theme: "default",
    refreshInterval: 0,
    autoRefresh: false,
    compactMode: false,
    showTimestamps: true,
    enableVoiceControl: false,
    enableKeyboardShortcuts: true,
    enableGestures: false,
    enableAnimations: true,
    enableSpellCheck: true,
    enableAutoComplete: true,
    enableSuggestions: true,
  })

  // Initialize panel with AI-generated content if empty
  useEffect(() => {
    if (!initialContent && settings.enableAI) {
      generateInitialContent()
    }
  }, [])

  const generateInitialContent = async () => {
    setIsInitializing(true)
    setIsGenerating(true)
    try {
      const prompt = `Generate comprehensive, detailed content for a ${panelType} panel titled "${title}" based on the query "${query}". 
      Provide useful, informative content that would be helpful for a user. 
      Include relevant information, examples, and actionable insights.
      Format the content with markdown headings, lists, and other formatting as appropriate.
      Make sure the content is directly relevant to the query and provides value to the user.`

      const response = await generateAIResponse(prompt)
      if (response.text) {
        setContent(response.text)
      }
    } catch (error) {
      console.error("Error generating initial content:", error)
      toast({
        title: "Error",
        description: "Failed to generate initial content",
        variant: "destructive",
      })
      setContent("Failed to generate content. Please try refreshing the panel.")
    } finally {
      setIsGenerating(false)
      setIsInitializing(false)
    }
  }

  const handleAIAssist = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for the AI",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const prompt = `${aiPrompt}\nContext: This is for a ${panelType} panel titled "${title}" with the following existing content:\n\n${content.substring(0, 500)}${content.length > 500 ? "..." : ""}`
      const response = await generateAIResponse(prompt)
      if (response.text) {
        setContent((prev) => prev + "\n\n" + response.text)
        setAiPrompt("")
        toast({
          title: "AI Response Generated",
          description: "The AI has added content to your panel",
        })
        setActiveTab("content")
      }
    } catch (error) {
      console.error("Error generating AI response:", error)
      toast({
        title: "Error",
        description: "Failed to generate AI response",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyContent = () => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    })
  }

  const downloadContent = () => {
    const fileName = title.toLowerCase().replace(/\s+/g, "-") + ".md"
    const blob = new Blob([content], { type: "text/markdown" })
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
      description: `Content saved as ${fileName}`,
    })
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))

    // Apply settings immediately for some settings
    if (key === "darkMode") {
      if (contentRef.current) {
        contentRef.current.classList.toggle("bg-gray-900", value)
        contentRef.current.classList.toggle("text-white", value)
      }
    }

    toast({
      title: "Setting Updated",
      description: `${key} has been updated`,
    })
  }

  // Function to generate AI insights about the content
  const generateInsights = async () => {
    setIsGenerating(true)
    try {
      const prompt = `Analyze the following content and provide 3-5 key insights or takeaways:
      
      ${content.substring(0, 1000)}${content.length > 1000 ? "..." : ""}
      
      Format your response as a bulleted list of insights.`

      const response = await generateAIResponse(prompt)
      if (response.text) {
        toast({
          title: "AI Insights Generated",
          description: "Here are some insights about your content",
        })

        // Create a temporary element to show insights
        const insightsElement = document.createElement("div")
        insightsElement.className =
          "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background border rounded-lg shadow-lg p-6 z-50 max-w-md w-full"
        insightsElement.innerHTML = `
          <h3 class="text-lg font-bold mb-4">AI Insights</h3>
          <div class="mb-4">${response.text.replace(/\n/g, "<br>")}</div>
          <button class="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 w-full">Close</button>
        `
        document.body.appendChild(insightsElement)

        // Add event listener to close button
        const closeButton = insightsElement.querySelector("button")
        if (closeButton) {
          closeButton.addEventListener("click", () => {
            document.body.removeChild(insightsElement)
          })
        }
      }
    } catch (error) {
      console.error("Error generating insights:", error)
      toast({
        title: "Error",
        description: "Failed to generate insights",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Function to render markdown content
  const renderMarkdown = (text: string) => {
    // Very simple markdown rendering for demonstration
    return text
      .replace(/# (.*?)$/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
      .replace(/## (.*?)$/gm, '<h2 class="text-xl font-bold my-3">$1</h2>')
      .replace(/### (.*?)$/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded">$1</code>')
      .replace(/- (.*?)$/gm, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, "<br><br>")
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="content" className="flex-1 flex flex-col" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="ai-assist">AI Assist</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="flex-1 p-4 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {description}
              {isTemporary && " This panel will not be saved when closed."}
            </p>
          </div>

          <div className="flex-1 flex flex-col">
            {isInitializing ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Generating content based on "{query}"...</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex justify-between mb-2">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("ai-assist")}>
                      <Sparkles className="h-4 w-4 mr-1" />
                      AI Assist
                    </Button>
                    <Button variant="outline" size="sm" onClick={generateInsights} disabled={isGenerating || !content}>
                      <Lightbulb className="h-4 w-4 mr-1" />
                      Get Insights
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={copyContent}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadContent}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="flex-1 flex">
                  <div className="w-1/2 pr-2">
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter content here..."
                      className="h-full resize-none"
                      style={{ fontSize: `${settings.fontSize}px` }}
                    />
                  </div>
                  <div
                    className="w-1/2 pl-2 border rounded-md p-4 overflow-auto"
                    ref={contentRef}
                    style={{ fontSize: `${settings.fontSize}px` }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                  />
                </div>

                <div className="flex justify-between mt-4">
                  <Button variant="outline" size="sm" onClick={() => setContent("")}>
                    Clear
                  </Button>
                  <Button variant="outline" size="sm" onClick={generateInitialContent} disabled={isGenerating}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? "animate-spin" : ""}`} />
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai-assist" className="flex-1 p-4 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              <CardDescription>
                Ask the AI to help you with your content. The AI will generate content based on your prompt.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="ai-prompt">Your Prompt</Label>
                  <Textarea
                    id="ai-prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Enter your prompt for the AI..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex-1 overflow-auto border rounded-md p-4 bg-muted/30">
                  <h4 className="font-medium mb-2">Prompt Ideas:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => setAiPrompt(`Generate a summary of the key points about ${title}.`)}
                      >
                        Generate a summary of the key points
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => setAiPrompt(`Provide a step-by-step guide for ${query || title}.`)}
                      >
                        Provide a step-by-step guide
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => setAiPrompt(`List the pros and cons of ${query || title}.`)}
                      >
                        List pros and cons
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => setAiPrompt(`Suggest improvements or alternatives to ${query || title}.`)}
                      >
                        Suggest improvements or alternatives
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => setAiPrompt(`Create a checklist for ${query || title}.`)}
                      >
                        Create a checklist
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => setAiPrompt(`Explain ${query || title} as if I'm a beginner.`)}
                      >
                        Explain for beginners
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => setAiPrompt(`Provide expert-level insights about ${query || title}.`)}
                      >
                        Provide expert-level insights
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => setAiPrompt(`Compare different approaches to ${query || title}.`)}
                      >
                        Compare different approaches
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button onClick={handleAIAssist} disabled={isGenerating || !aiPrompt.trim()} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 p-4 overflow-auto">
          <div className="space-y-6">
            <h3 className="font-medium">Panel Settings</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-ai">Enable AI</Label>
                  <p className="text-xs text-muted-foreground">Use AI to enhance this panel</p>
                </div>
                <Switch
                  id="enable-ai"
                  checked={settings.enableAI}
                  onCheckedChange={(checked) => handleSettingChange("enableAI", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Auto Save</Label>
                  <p className="text-xs text-muted-foreground">Automatically save content changes</p>
                </div>
                <Switch
                  id="auto-save"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">Use dark theme for this panel</p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size: {settings.fontSize}px</Label>
                <Slider
                  id="font-size"
                  min={12}
                  max={24}
                  step={1}
                  value={[settings.fontSize]}
                  onValueChange={(value) => handleSettingChange("fontSize", value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={settings.theme} onValueChange={(value) => handleSettingChange("theme", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="vibrant">Vibrant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <p className="text-xs text-muted-foreground">Use a more compact layout</p>
                </div>
                <Switch
                  id="compact-mode"
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => handleSettingChange("compactMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-animations">Enable Animations</Label>
                  <p className="text-xs text-muted-foreground">Show animations in the panel</p>
                </div>
                <Switch
                  id="enable-animations"
                  checked={settings.enableAnimations}
                  onCheckedChange={(checked) => handleSettingChange("enableAnimations", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-spell-check">Enable Spell Check</Label>
                  <p className="text-xs text-muted-foreground">Check spelling in text inputs</p>
                </div>
                <Switch
                  id="enable-spell-check"
                  checked={settings.enableSpellCheck}
                  onCheckedChange={(checked) => handleSettingChange("enableSpellCheck", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-auto-complete">Enable Auto Complete</Label>
                  <p className="text-xs text-muted-foreground">Show auto-complete suggestions</p>
                </div>
                <Switch
                  id="enable-auto-complete"
                  checked={settings.enableAutoComplete}
                  onCheckedChange={(checked) => handleSettingChange("enableAutoComplete", checked)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Panel Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Panel Type:</span>
                  <span className="text-sm font-medium">{panelType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Temporary:</span>
                  <span className="text-sm font-medium">{isTemporary ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="text-sm font-medium">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save as Template
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="flex-1 p-4 overflow-auto">
          <div className="space-y-6">
            <h3 className="font-medium">Panel Tools</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">AI Analysis</CardTitle>
                  <CardDescription>Analyze content with AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={generateInsights} disabled={isGenerating || !content}>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Generate Insights
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Export Options</CardTitle>
                  <CardDescription>Export your content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={copyContent}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                  <Button variant="outline" className="w-full" onClick={downloadContent}>
                    <Download className="h-4 w-4 mr-2" />
                    Download as Markdown
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Content Tools</CardTitle>
                  <CardDescription>Manipulate your content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setContent(content.toUpperCase())
                      toast({
                        title: "Content Updated",
                        description: "Text converted to uppercase",
                      })
                    }}
                  >
                    Convert to Uppercase
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setContent(content.toLowerCase())
                      toast({
                        title: "Content Updated",
                        description: "Text converted to lowercase",
                      })
                    }}
                  >
                    Convert to Lowercase
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const wordCount = content.split(/\s+/).filter(Boolean).length
                      toast({
                        title: "Word Count",
                        description: `This document contains ${wordCount} words`,
                      })
                    }}
                  >
                    Count Words
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">AI Transformations</CardTitle>
                  <CardDescription>Transform content with AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      setIsGenerating(true)
                      try {
                        const prompt = `Summarize the following content in 3-5 sentences:
                        
                        ${content.substring(0, 1000)}${content.length > 1000 ? "..." : ""}`

                        const response = await generateAIResponse(prompt)
                        if (response.text) {
                          setContent(response.text)
                          toast({
                            title: "Content Summarized",
                            description: "Your content has been summarized",
                          })
                        }
                      } catch (error) {
                        console.error("Error summarizing content:", error)
                        toast({
                          title: "Error",
                          description: "Failed to summarize content",
                          variant: "destructive",
                        })
                      } finally {
                        setIsGenerating(false)
                      }
                    }}
                    disabled={isGenerating || !content}
                  >
                    Summarize Content
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      setIsGenerating(true)
                      try {
                        const prompt = `Improve the writing style of the following content while preserving its meaning:
                        
                        ${content.substring(0, 1000)}${content.length > 1000 ? "..." : ""}`

                        const response = await generateAIResponse(prompt)
                        if (response.text) {
                          setContent(response.text)
                          toast({
                            title: "Content Improved",
                            description: "Your content's writing style has been improved",
                          })
                        }
                      } catch (error) {
                        console.error("Error improving content:", error)
                        toast({
                          title: "Error",
                          description: "Failed to improve content",
                          variant: "destructive",
                        })
                      } finally {
                        setIsGenerating(false)
                      }
                    }}
                    disabled={isGenerating || !content}
                  >
                    Improve Writing Style
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

