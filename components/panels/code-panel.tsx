"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Play, Trash, Copy, Download, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function CodePanel() {
  const { toast } = useToast()
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [aiPrompt, setAiPrompt] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Load saved code from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem("code-" + language)
    if (savedCode) {
      setCode(savedCode)
    } else {
      // Set default code examples for each language
      switch (language) {
        case "javascript":
          setCode('console.log("Hello, world!");')
          break
        case "python":
          setCode('print("Hello, world!")')
          break
        case "html":
          setCode("<div>\n  <h1>Hello, world!</h1>\n  <p>Welcome to the code panel</p>\n</div>")
          break
        case "css":
          setCode("body {\n  font-family: sans-serif;\n  color: #333;\n}")
          break
        default:
          setCode("// Start coding here")
      }
    }
  }, [language])

  // Save code to localStorage when it changes
  useEffect(() => {
    if (code) {
      localStorage.setItem("code-" + language, code)
    }
  }, [code, language])

  const runCode = () => {
    setIsProcessing(true)
    setOutput("")

    setTimeout(() => {
      try {
        if (language === "javascript") {
          // Create a safe evaluation environment
          const originalConsoleLog = console.log
          const logs = []

          console.log = (...args) => {
            logs.push(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg)).join(" "))
          }

          try {
            // Use Function constructor instead of eval for better isolation
            const result = new Function(code)()
            if (result !== undefined) {
              logs.push("=> " + (typeof result === "object" ? JSON.stringify(result, null, 2) : result))
            }
            setOutput(logs.join("\n"))
          } catch (error) {
            setOutput("Error: " + error.message)
          } finally {
            console.log = originalConsoleLog
          }
        } else if (language === "html") {
          // For HTML, create an iframe to render the code
          const iframe = document.createElement("iframe")
          iframe.style.display = "none"
          document.body.appendChild(iframe)

          try {
            const doc = iframe.contentDocument || iframe.contentWindow.document
            doc.open()
            doc.write(code)
            doc.close()

            setOutput("HTML rendered successfully. Check the preview tab.")

            // Create a preview element
            const previewEl = document.getElementById("html-preview")
            if (previewEl) {
              previewEl.innerHTML = ""
              previewEl.appendChild(iframe.cloneNode(true))
              iframe.style.display = "block"
              iframe.style.width = "100%"
              iframe.style.height = "100%"
              iframe.style.border = "none"
            }
          } catch (error) {
            setOutput("Error: " + error.message)
          } finally {
            document.body.removeChild(iframe)
          }
        } else {
          setOutput(
            `Running ${language} code is not supported in the browser. This would typically be processed on a server.`,
          )
        }
      } catch (error) {
        setOutput("Error: " + error.message)
      }

      setIsProcessing(false)
    }, 500)
  }

  const generateCode = () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for code generation",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setOutput("Generating code based on your prompt...")

    // Simulate AI code generation
    setTimeout(() => {
      let generatedCode = ""

      if (aiPrompt.toLowerCase().includes("hello world")) {
        switch (language) {
          case "javascript":
            generatedCode =
              'console.log("Hello, World!");\n\n// This is a simple JavaScript program\n// that prints a greeting to the console'
            break
          case "python":
            generatedCode =
              'print("Hello, World!")\n\n# This is a simple Python program\n# that prints a greeting to the console'
            break
          case "html":
            generatedCode =
              "<!DOCTYPE html>\n<html>\n<head>\n  <title>Hello World</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <p>Welcome to my webpage</p>\n</body>\n</html>"
            break
          default:
            generatedCode = "// Hello World program in " + language
        }
      } else if (aiPrompt.toLowerCase().includes("button")) {
        switch (language) {
          case "javascript":
            generatedCode =
              'function createButton() {\n  const button = document.createElement("button");\n  button.textContent = "Click Me";\n  button.addEventListener("click", () => {\n    alert("Button clicked!");\n  });\n  document.body.appendChild(button);\n}\n\ncreateButton();'
            break
          case "html":
            generatedCode =
              '<button class="fancy-button" onclick="alert(\'Button clicked!\')">\n  Click Me\n</button>\n\n<style>\n  .fancy-button {\n    background-color: #4CAF50;\n    color: white;\n    padding: 10px 20px;\n    border: none;\n    border-radius: 4px;\n    cursor: pointer;\n  }\n  \n  .fancy-button:hover {\n    background-color: #45a049;\n  }\n</style>'
            break
          default:
            generatedCode = "// Button implementation in " + language
        }
      } else {
        generatedCode = `// Generated code based on: "${aiPrompt}"\n\n// This is a placeholder for actual AI-generated code\n// In a real implementation, this would call an AI service\n// like OpenAI's Codex or GitHub Copilot`
      }

      setCode(generatedCode)
      setOutput("Code generated successfully!")
      setIsProcessing(false)
    }, 1500)
  }

  const clearCode = () => {
    if (confirm("Are you sure you want to clear the code?")) {
      setCode("")
      setOutput("")
      toast({
        title: "Code Cleared",
        description: "Your code has been cleared",
      })
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied",
      description: "Code copied to clipboard",
    })
  }

  const downloadCode = () => {
    const fileExtension =
      language === "javascript"
        ? "js"
        : language === "python"
          ? "py"
          : language === "html"
            ? "html"
            : language === "css"
              ? "css"
              : "txt"

    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `code.${fileExtension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded",
      description: `Code saved as code.${fileExtension}`,
    })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center space-x-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={runCode} disabled={isProcessing}>
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
          <Button variant="outline" size="sm" onClick={clearCode}>
            <Trash className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={copyCode}>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCode}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      <Tabs defaultValue="code" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="output">Output</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
          {language === "html" && <TabsTrigger value="preview">Preview</TabsTrigger>}
        </TabsList>

        <TabsContent value="code" className="flex-1 p-2">
          <Textarea
            className="font-mono text-sm h-full resize-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
          />
        </TabsContent>

        <TabsContent value="output" className="flex-1 p-2">
          <div className="bg-black text-green-400 font-mono text-sm p-4 h-full overflow-auto rounded">
            {output || "Run your code to see output here"}
          </div>
        </TabsContent>

        <TabsContent value="ai" className="flex-1 p-2 flex flex-col">
          <div className="mb-2 flex">
            <Textarea
              className="flex-1 mr-2"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe the code you want to generate..."
            />
            <Button onClick={generateCode} disabled={isProcessing}>
              {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Generate"}
            </Button>
          </div>
          <div className="flex-1 bg-muted p-4 rounded overflow-auto">
            <h3 className="text-sm font-medium mb-2">AI Code Assistant</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Describe what you want to create, and the AI will generate code for you. Try prompts like "Create a hello
              world program" or "Make a button that shows an alert".
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setAiPrompt("Create a hello world program")}
              >
                Create a hello world program
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setAiPrompt("Make a button that shows an alert")}
              >
                Make a button that shows an alert
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setAiPrompt("Generate a function to calculate fibonacci numbers")}
              >
                Generate a function to calculate fibonacci numbers
              </Button>
            </div>
          </div>
        </TabsContent>

        {language === "html" && (
          <TabsContent value="preview" className="flex-1 p-2">
            <div id="html-preview" className="h-full border rounded overflow-auto">
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Run the HTML code to see the preview
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

