"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wand2, Code, RefreshCw, Copy, Download, Play, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { generatePanelCode } from "@/lib/ai-service"

interface AIPanelCreatorProps {
  onCreatePanel: (code: string, name: string) => void
}

export default function AIPanelCreator({ onCreatePanel }: AIPanelCreatorProps) {
  const { toast } = useToast()
  const [panelDescription, setPanelDescription] = useState("")
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
    includeLocalStorage: true,
    includeErrorHandling: true,
  })
  const [codeStyle, setCodeStyle] = useState("modern")
  const [complexity, setComplexity] = useState("medium")

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

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="create" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="create">Create Panel</TabsTrigger>
          <TabsTrigger value="code">Generated Code</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="flex-1 p-4 flex flex-col">
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

