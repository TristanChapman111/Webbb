"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { generateAIResponse } from "@/lib/ai-service"
import { Wand2, Loader2, Undo, Redo, Eye, EyeOff, Zap, Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { HexColorPicker } from "react-colorful"

interface UIDesignerPanelProps {
  onApplyChanges?: (css: string) => void
}

export default function UIDesignerPanel({ onApplyChanges }: UIDesignerPanelProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [customCSS, setCustomCSS] = useState("")
  const [previewCSS, setPreviewCSS] = useState("")
  const [cssHistory, setCssHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showPreview, setShowPreview] = useState(true)
  const [prompt, setPrompt] = useState("")
  const [activeColor, setActiveColor] = useState("#3b82f6")
  const [colorTarget, setColorTarget] = useState("primary")

  const [uiSettings, setUiSettings] = useState({
    theme: "light",
    primaryColor: "#3b82f6",
    secondaryColor: "#6b7280",
    accentColor: "#f97316",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    fontSize: 16,
    borderRadius: 8,
    spacing: 16,
    animation: "subtle",
    layout: "default",
    density: "comfortable",
  })

  // Add CSS to history when it changes
  useEffect(() => {
    if (customCSS && (cssHistory.length === 0 || cssHistory[cssHistory.length - 1] !== customCSS)) {
      const newHistory = [...cssHistory.slice(0, historyIndex + 1), customCSS]
      setCssHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }, [customCSS])

  // Apply CSS changes
  useEffect(() => {
    if (showPreview) {
      applyChanges()
    }
  }, [showPreview, previewCSS])

  const generateUIChanges = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for the AI",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const aiPrompt = `Generate CSS code to modify a web application's UI based on this description: "${prompt}".
      The CSS should be clean, modern, and responsive.
      Focus on colors, spacing, typography, and subtle animations.
      Only return the CSS code without any explanations or markdown formatting.
      Make sure the CSS is valid and uses modern CSS features.`

      const response = await generateAIResponse(aiPrompt)
      if (response.text) {
        // Extract CSS from the response if it's wrapped in code blocks
        let css = response.text
        if (css.includes("```css")) {
          css = css.split("```css")[1].split("```")[0].trim()
        } else if (css.includes("```")) {
          css = css.split("```")[1].split("```")[0].trim()
        }

        setCustomCSS(css)
        setPreviewCSS(css)
        toast({
          title: "UI Changes Generated",
          description: "AI has generated UI modifications based on your prompt",
        })
      }
    } catch (error) {
      console.error("Error generating UI changes:", error)
      toast({
        title: "Error",
        description: "Failed to generate UI changes",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const applyChanges = () => {
    if (onApplyChanges) {
      onApplyChanges(previewCSS)
    }

    // Apply CSS directly to the page
    let styleElement = document.getElementById("ui-designer-styles")
    if (!styleElement) {
      styleElement = document.createElement("style")
      styleElement.id = "ui-designer-styles"
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = previewCSS

    toast({
      title: "UI Changes Applied",
      description: "Your UI modifications have been applied to the page",
    })
  }

  const resetChanges = () => {
    // Remove the style element
    const styleElement = document.getElementById("ui-designer-styles")
    if (styleElement) {
      styleElement.textContent = ""
    }

    setPreviewCSS("")

    toast({
      title: "UI Changes Reset",
      description: "Your UI modifications have been reset",
    })
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setCustomCSS(cssHistory[historyIndex - 1])
      setPreviewCSS(cssHistory[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < cssHistory.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setCustomCSS(cssHistory[historyIndex + 1])
      setPreviewCSS(cssHistory[historyIndex + 1])
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    setUiSettings((prev) => ({
      ...prev,
      [key]: value,
    }))

    // Generate CSS based on settings
    generateCSSFromSettings({
      ...uiSettings,
      [key]: value,
    })
  }

  const generateCSSFromSettings = (settings: any) => {
    const css = `
      :root {
        --primary: ${settings.primaryColor};
        --secondary: ${settings.secondaryColor};
        --accent: ${settings.accentColor};
        --background: ${settings.backgroundColor};
        --foreground: ${settings.textColor};
        --radius: ${settings.borderRadius}px;
        --font-size: ${settings.fontSize}px;
        --spacing: ${settings.spacing}px;
      }
      
      body {
        background-color: ${settings.backgroundColor};
        color: ${settings.textColor};
        font-size: ${settings.fontSize}px;
      }
      
      .card {
        border-radius: ${settings.borderRadius}px;
        ${settings.animation === "subtle" ? "transition: transform 0.2s, box-shadow 0.2s;" : ""}
        ${settings.animation === "moderate" ? "transition: transform 0.3s, box-shadow 0.3s;" : ""}
        ${settings.animation === "pronounced" ? "transition: transform 0.5s, box-shadow 0.5s;" : ""}
      }
      
      ${
        settings.animation !== "none"
          ? `
      .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      `
          : ""
      }
      
      button {
        border-radius: ${settings.borderRadius}px;
        ${settings.animation === "subtle" ? "transition: all 0.2s;" : ""}
        ${settings.animation === "moderate" ? "transition: all 0.3s;" : ""}
        ${settings.animation === "pronounced" ? "transition: all 0.5s;" : ""}
      }
      
      ${
        settings.density === "compact"
          ? `
      .p-4 {
        padding: 0.5rem !important;
      }
      .space-y-4 > * + * {
        margin-top: 0.5rem !important;
      }
      `
          : ""
      }
      
      ${
        settings.density === "spacious"
          ? `
      .p-4 {
        padding: 1.5rem !important;
      }
      .space-y-4 > * + * {
        margin-top: 1.5rem !important;
      }
      `
          : ""
      }
      
      ${
        settings.theme === "dark"
          ? `
      body {
        background-color: #1f2937;
        color: #f9fafb;
      }
      .bg-background {
        background-color: #1f2937 !important;
      }
      .text-foreground {
        color: #f9fafb !important;
      }
      .border {
        border-color: #374151 !important;
      }
      .bg-muted {
        background-color: #374151 !important;
      }
      .text-muted-foreground {
        color: #9ca3af !important;
      }
      `
          : ""
      }
    `

    setCustomCSS(css)
    setPreviewCSS(css)
  }

  const handleColorChange = (color: string) => {
    setActiveColor(color)

    // Update the appropriate color in settings
    if (colorTarget === "primary") {
      handleSettingChange("primaryColor", color)
    } else if (colorTarget === "secondary") {
      handleSettingChange("secondaryColor", color)
    } else if (colorTarget === "accent") {
      handleSettingChange("accentColor", color)
    } else if (colorTarget === "background") {
      handleSettingChange("backgroundColor", color)
    } else if (colorTarget === "text") {
      handleSettingChange("textColor", color)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="visual" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="visual">Visual Editor</TabsTrigger>
          <TabsTrigger value="code">CSS Editor</TabsTrigger>
          <TabsTrigger value="ai">AI Generator</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="flex-1 p-4 overflow-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Visual UI Editor</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={resetChanges}>
                  Reset
                </Button>
                <Button size="sm" onClick={applyChanges}>
                  <Zap className="h-4 w-4 mr-1" />
                  Apply Changes
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={uiSettings.theme} onValueChange={(value) => handleSettingChange("theme", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Layout</Label>
                <Select value={uiSettings.layout} onValueChange={(value) => handleSettingChange("layout", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="centered">Centered</SelectItem>
                    <SelectItem value="wide">Wide</SelectItem>
                    <SelectItem value="narrow">Narrow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Density</Label>
                <Select value={uiSettings.density} onValueChange={(value) => handleSettingChange("density", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a density" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Animation</Label>
                <Select value={uiSettings.animation} onValueChange={(value) => handleSettingChange("animation", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select animation style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="subtle">Subtle</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="pronounced">Pronounced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Colors</Label>
                  <Select value={colorTarget} onValueChange={setColorTarget}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="accent">Accent</SelectItem>
                      <SelectItem value="background">Background</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center py-4">
                  <HexColorPicker color={activeColor} onChange={handleColorChange} />
                </div>

                <div className="flex justify-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-full cursor-pointer border"
                    style={{ backgroundColor: uiSettings.primaryColor }}
                    onClick={() => {
                      setColorTarget("primary")
                      setActiveColor(uiSettings.primaryColor)
                    }}
                  />
                  <div
                    className="w-8 h-8 rounded-full cursor-pointer border"
                    style={{ backgroundColor: uiSettings.secondaryColor }}
                    onClick={() => {
                      setColorTarget("secondary")
                      setActiveColor(uiSettings.secondaryColor)
                    }}
                  />
                  <div
                    className="w-8 h-8 rounded-full cursor-pointer border"
                    style={{ backgroundColor: uiSettings.accentColor }}
                    onClick={() => {
                      setColorTarget("accent")
                      setActiveColor(uiSettings.accentColor)
                    }}
                  />
                  <div
                    className="w-8 h-8 rounded-full cursor-pointer border"
                    style={{ backgroundColor: uiSettings.backgroundColor }}
                    onClick={() => {
                      setColorTarget("background")
                      setActiveColor(uiSettings.backgroundColor)
                    }}
                  />
                  <div
                    className="w-8 h-8 rounded-full cursor-pointer border"
                    style={{ backgroundColor: uiSettings.textColor }}
                    onClick={() => {
                      setColorTarget("text")
                      setActiveColor(uiSettings.textColor)
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Font Size: {uiSettings.fontSize}px</Label>
                <Slider
                  min={12}
                  max={24}
                  step={1}
                  value={[uiSettings.fontSize]}
                  onValueChange={(value) => handleSettingChange("fontSize", value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label>Border Radius: {uiSettings.borderRadius}px</Label>
                <Slider
                  min={0}
                  max={20}
                  step={1}
                  value={[uiSettings.borderRadius]}
                  onValueChange={(value) => handleSettingChange("borderRadius", value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label>Spacing: {uiSettings.spacing}px</Label>
                <Slider
                  min={8}
                  max={32}
                  step={2}
                  value={[uiSettings.spacing]}
                  onValueChange={(value) => handleSettingChange("spacing", value[0])}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="flex-1 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">CSS Editor</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleUndo} disabled={historyIndex <= 0}>
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleRedo} disabled={historyIndex >= cssHistory.length - 1}>
                <Redo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(customCSS)
                  toast({
                    title: "Copied",
                    description: "CSS copied to clipboard",
                  })
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant={showPreview ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
            </div>
          </div>

          <div className="flex-1">
            <Textarea
              value={customCSS}
              onChange={(e) => {
                setCustomCSS(e.target.value)
                setPreviewCSS(e.target.value)
              }}
              placeholder="Enter custom CSS here..."
              className="h-full resize-none font-mono"
            />
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={resetChanges}>
              Reset
            </Button>
            <Button onClick={applyChanges}>
              <Zap className="h-4 w-4 mr-1" />
              Apply Changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="flex-1 p-4 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">AI UI Generator</CardTitle>
              <CardDescription>Describe the UI changes you want, and AI will generate the CSS for you.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="ui-prompt">Your UI Description</Label>
                  <Textarea
                    id="ui-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the UI changes you want, e.g., 'Create a dark theme with blue accents and rounded corners'"
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
                        onClick={() => setPrompt("Create a dark theme with blue accents and rounded corners")}
                      >
                        Dark theme with blue accents
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => {
                          setPrompt("Make the UI more minimalist with subtle animations and increased whitespace")
                        }}
                      >
                        Minimalist UI with subtle animations
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() =>
                          setPrompt("Create a colorful, vibrant UI with gradient backgrounds and bold typography")
                        }
                      >
                        Colorful UI with gradients
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => setPrompt("Design a professional, corporate UI with navy blue and gray colors")}
                      >
                        Professional corporate design
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => setPrompt("Create a playful UI with rounded elements and pastel colors")}
                      >
                        Playful UI with pastel colors
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button onClick={generateUIChanges} disabled={isGenerating || !prompt.trim()} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate UI Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="flex-1 p-4">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Preview UI Changes</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={resetChanges}>
                  Reset
                </Button>
                <Button size="sm" onClick={applyChanges}>
                  <Zap className="h-4 w-4 mr-1" />
                  Apply Changes
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-6 space-y-6">
              <h4 className="text-lg font-medium">UI Preview</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Example</CardTitle>
                    <CardDescription>This is how cards will look with your changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      This is some sample content inside a card. You can see how your styling affects various elements.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button>Primary Button</Button>
                  </CardFooter>
                </Card>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Input Example</Label>
                    <Input placeholder="Type something..." />
                  </div>

                  <div className="space-y-2">
                    <Label>Select Example</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                        <SelectItem value="option3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="preview-switch" />
                    <Label htmlFor="preview-switch">Toggle Example</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium">Button Variants</h5>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium">Typography</h5>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">Heading 1</h1>
                  <h2 className="text-2xl font-bold">Heading 2</h2>
                  <h3 className="text-xl font-bold">Heading 3</h3>
                  <p className="text-base">Regular paragraph text</p>
                  <p className="text-sm text-muted-foreground">Muted text</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

