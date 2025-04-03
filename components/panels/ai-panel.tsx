"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Trash, Copy, Download, Brain, FileText, ImageIcon, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function AIPanel() {
  const { toast } = useToast()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI assistant. How can I help you today?" },
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const [essayInput, setEssayInput] = useState("")
  const [essayOutput, setEssayOutput] = useState("")
  const [essayTopic, setEssayTopic] = useState("")
  const [essayLength, setEssayLength] = useState("medium")
  const [essayStyle, setEssayStyle] = useState("academic")
  const [checkResult, setCheckResult] = useState<null | {
    aiScore: number
    readability: number
    grammar: number
    suggestions: string[]
  }>(null)
  const [imagePrompt, setImagePrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message
    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])

    // Clear input
    setInput("")

    // Process with AI
    processWithAI(input)
  }

  const processWithAI = (userInput: string) => {
    setIsProcessing(true)

    // Simulate AI processing
    setTimeout(() => {
      let response = ""

      if (userInput.toLowerCase().includes("hello") || userInput.toLowerCase().includes("hi")) {
        response = "Hello! How can I assist you today?"
      } else if (userInput.toLowerCase().includes("help")) {
        response =
          "I can help with various tasks like answering questions, generating text, checking essays, and more. What would you like to do?"
      } else if (userInput.toLowerCase().includes("weather")) {
        response =
          "I don't have real-time weather data, but I can help you find a weather service or website that provides that information."
      } else if (userInput.toLowerCase().includes("joke")) {
        const jokes = [
          "Why don't scientists trust atoms? Because they make up everything!",
          "Why did the scarecrow win an award? Because he was outstanding in his field!",
          "Why don't skeletons fight each other? They don't have the guts!",
          "What do you call a fake noodle? An impasta!",
          "Why couldn't the bicycle stand up by itself? It was two tired!",
        ]
        response = jokes[Math.floor(Math.random() * jokes.length)]
      } else {
        response = `I've processed your request: "${userInput}". In a real implementation, this would connect to an AI service like OpenAI's GPT or another language model to generate a meaningful response.`
      }

      // Add AI response
      setMessages((prev) => [...prev, { role: "assistant", content: response }])
      setIsProcessing(false)
    }, 1000)
  }

  const clearChat = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      setMessages([{ role: "assistant", content: "Hello! I'm your AI assistant. How can I help you today?" }])

      toast({
        title: "Chat Cleared",
        description: "Your chat history has been cleared",
      })
    }
  }

  const copyChat = () => {
    const text = messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n\n")
    navigator.clipboard.writeText(text)

    toast({
      title: "Copied",
      description: "Chat history copied to clipboard",
    })
  }

  const downloadChat = () => {
    const text = messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n\n")
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "chat-history.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded",
      description: "Chat history saved as chat-history.txt",
    })
  }

  const generateEssay = () => {
    if (!essayTopic.trim()) {
      toast({
        title: "Error",
        description: "Please enter an essay topic",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Simulate essay generation
    setTimeout(() => {
      let wordCount = 0
      switch (essayLength) {
        case "short":
          wordCount = 300
          break
        case "medium":
          wordCount = 600
          break
        case "long":
          wordCount = 1200
          break
        default:
          wordCount = 600
      }

      let style = ""
      switch (essayStyle) {
        case "academic":
          style = "formal academic"
          break
        case "creative":
          style = "creative and engaging"
          break
        case "persuasive":
          style = "persuasive and compelling"
          break
        default:
          style = "formal academic"
      }

      const essay = `
# ${essayTopic}

## Introduction

This is a ${style} essay on the topic of "${essayTopic}". In a real implementation, this would be generated by an AI language model like GPT-4 or another advanced text generation system. The essay would be approximately ${wordCount} words long.

## Main Arguments

The essay would explore several key aspects of ${essayTopic}, including:

1. Historical context and background
2. Current relevance and importance
3. Different perspectives and viewpoints
4. Analysis of supporting evidence
5. Consideration of counterarguments

## Supporting Evidence

To support the main arguments, the essay would include:

- Relevant statistics and data
- Expert opinions and quotes
- Case studies and examples
- Scholarly references

## Conclusion

The conclusion would summarize the main points discussed and provide a thoughtful reflection on the topic. It might also suggest areas for further research or consideration.

## References

1. Smith, J. (2023). Understanding ${essayTopic}. Journal of Academic Studies, 45(2), 112-128.
2. Johnson, A. & Williams, B. (2022). Perspectives on ${essayTopic}. Oxford University Press.
3. Garcia, M. (2021). The Evolution of Thought on ${essayTopic}. Cambridge Scholarly Review.

---

Note: This is a placeholder for a real AI-generated essay. In a production environment, this would connect to an AI service to generate a complete, original essay based on your specifications.
      `.trim()

      setEssayOutput(essay)
      setIsProcessing(false)

      toast({
        title: "Essay Generated",
        description: `A ${essayLength} ${essayStyle} essay has been created`,
      })
    }, 2000)
  }

  const checkEssay = () => {
    if (!essayInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter an essay to check",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Simulate essay checking
    setTimeout(() => {
      // Generate random scores between 0 and 100
      const aiScore = Math.floor(Math.random() * 100)
      const readability = Math.floor(Math.random() * 100)
      const grammar = Math.floor(Math.random() * 100)

      // Generate random suggestions
      const suggestions = [
        "Consider revising the introduction to more clearly state your thesis.",
        "The conclusion could be strengthened by summarizing your key points.",
        "Some paragraphs could benefit from additional supporting evidence.",
        "Consider varying your sentence structure for improved readability.",
        "Check for consistency in your use of tense throughout the essay.",
      ]

      // Randomly select 2-4 suggestions
      const numSuggestions = Math.floor(Math.random() * 3) + 2
      const selectedSuggestions = []
      for (let i = 0; i < numSuggestions; i++) {
        const index = Math.floor(Math.random() * suggestions.length)
        selectedSuggestions.push(suggestions[index])
        suggestions.splice(index, 1)
      }

      setCheckResult({
        aiScore,
        readability,
        grammar,
        suggestions: selectedSuggestions,
      })

      setIsProcessing(false)

      toast({
        title: "Essay Checked",
        description: "Your essay has been analyzed",
      })
    }, 2000)
  }

  const generateImage = () => {
    if (!imagePrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter an image prompt",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Simulate image generation
    setTimeout(() => {
      // Generate a placeholder image URL
      const width = 512
      const height = 512
      setGeneratedImage(`/placeholder.svg?height=${height}&width=${width}`)

      setIsProcessing(false)

      toast({
        title: "Image Generated",
        description: "Your AI image has been created",
      })
    }, 2000)
  }

  const copyEssay = () => {
    navigator.clipboard.writeText(essayOutput)

    toast({
      title: "Copied",
      description: "Essay copied to clipboard",
    })
  }

  const downloadEssay = () => {
    const blob = new Blob([essayOutput], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "essay.md"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded",
      description: "Essay saved as essay.md",
    })
  }

  const downloadImage = () => {
    const a = document.createElement("a")
    a.href = generatedImage
    a.download = "ai-generated-image.png"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    toast({
      title: "Downloaded",
      description: "Image saved as ai-generated-image.png",
    })
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="essay-writer">Essay Writer</TabsTrigger>
          <TabsTrigger value="essay-checker">Essay Checker</TabsTrigger>
          <TabsTrigger value="image-generator">Image Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-2 border-b">
            <div className="flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">AI Assistant</span>
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearChat}>
                <Trash className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyChat}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={downloadChat}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`
                    max-w-[80%] rounded-lg p-3
                    ${message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"}
                  `}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-2 border-t flex space-x-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <Button type="submit" size="icon" disabled={isProcessing || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="essay-writer" className="flex-1 p-4 flex flex-col">
          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="essay-topic">Essay Topic</Label>
              <Input
                id="essay-topic"
                value={essayTopic}
                onChange={(e) => setEssayTopic(e.target.value)}
                placeholder="Enter the topic for your essay"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="essay-length">Length</Label>
                <Select value={essayLength} onValueChange={setEssayLength}>
                  <SelectTrigger id="essay-length">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (~300 words)</SelectItem>
                    <SelectItem value="medium">Medium (~600 words)</SelectItem>
                    <SelectItem value="long">Long (~1200 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="essay-style">Style</Label>
                <Select value={essayStyle} onValueChange={setEssayStyle}>
                  <SelectTrigger id="essay-style">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={generateEssay} disabled={isProcessing || !essayTopic.trim()} className="w-full">
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Essay
                </>
              )}
            </Button>
          </div>

          {essayOutput && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Generated Essay</h3>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" onClick={copyEssay}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadEssay}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="flex-1 border rounded p-4 overflow-auto whitespace-pre-wrap">{essayOutput}</div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="essay-checker" className="flex-1 p-4 flex flex-col">
          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="essay-input">Paste Your Essay</Label>
              <Textarea
                id="essay-input"
                value={essayInput}
                onChange={(e) => setEssayInput(e.target.value)}
                placeholder="Paste your essay here for analysis..."
                className="min-h-[200px]"
              />
            </div>

            <Button onClick={checkEssay} disabled={isProcessing || !essayInput.trim()} className="w-full">
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Check Essay
                </>
              )}
            </Button>
          </div>

          {checkResult && (
            <div className="flex-1 flex flex-col">
              <h3 className="text-sm font-medium mb-2">Analysis Results</h3>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="border rounded p-4 text-center">
                  <div className="text-2xl font-bold mb-1">{checkResult.aiScore}%</div>
                  <div className="text-xs text-muted-foreground">AI Detection</div>
                  <div className={`text-xs mt-1 ${checkResult.aiScore > 70 ? "text-red-500" : "text-green-500"}`}>
                    {checkResult.aiScore > 70 ? "Likely AI-generated" : "Likely human-written"}
                  </div>
                </div>

                <div className="border rounded p-4 text-center">
                  <div className="text-2xl font-bold mb-1">{checkResult.readability}%</div>
                  <div className="text-xs text-muted-foreground">Readability</div>
                  <div className={`text-xs mt-1 ${checkResult.readability > 50 ? "text-green-500" : "text-amber-500"}`}>
                    {checkResult.readability > 80
                      ? "Excellent"
                      : checkResult.readability > 60
                        ? "Good"
                        : checkResult.readability > 40
                          ? "Average"
                          : "Needs Improvement"}
                  </div>
                </div>

                <div className="border rounded p-4 text-center">
                  <div className="text-2xl font-bold mb-1">{checkResult.grammar}%</div>
                  <div className="text-xs text-muted-foreground">Grammar & Style</div>
                  <div className={`text-xs mt-1 ${checkResult.grammar > 50 ? "text-green-500" : "text-amber-500"}`}>
                    {checkResult.grammar > 80
                      ? "Excellent"
                      : checkResult.grammar > 60
                        ? "Good"
                        : checkResult.grammar > 40
                          ? "Average"
                          : "Needs Improvement"}
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-medium mb-2">Suggestions for Improvement</h4>
              <div className="border rounded p-4 overflow-auto">
                <ul className="space-y-2">
                  {checkResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-2 mt-0.5 text-amber-500">•</div>
                      <div>{suggestion}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="image-generator" className="flex-1 p-4 flex flex-col">
          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="image-prompt">Image Prompt</Label>
              <Textarea
                id="image-prompt"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="min-h-[100px]"
              />
            </div>

            <Button onClick={generateImage} disabled={isProcessing || !imagePrompt.trim()} className="w-full">
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </div>

          {generatedImage && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Generated Image</h3>
                <Button variant="outline" size="sm" onClick={downloadImage}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>

              <div className="flex-1 border rounded p-4 flex items-center justify-center">
                <img
                  src={generatedImage || "/placeholder.svg"}
                  alt="AI generated image"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

