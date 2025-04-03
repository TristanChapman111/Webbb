"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TerminalIcon, Copy, Download, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function TerminalPanel() {
  const { toast } = useToast()
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [output, setOutput] = useState<{ type: "input" | "output"; content: string }[]>([
    { type: "output", content: "Web Terminal v1.0.0" },
    { type: "output", content: "Type 'help' to see available commands." },
  ])

  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  // Focus input when terminal is clicked
  useEffect(() => {
    const handleClick = () => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }

    if (terminalRef.current) {
      terminalRef.current.addEventListener("click", handleClick)
    }

    return () => {
      if (terminalRef.current) {
        terminalRef.current.removeEventListener("click", handleClick)
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add command to output
    setOutput([...output, { type: "input", content: `$ ${input}` }])

    // Add to history
    setHistory([...history, input])
    setHistoryIndex(-1)

    // Process command
    processCommand(input)

    // Clear input
    setInput("")
  }

  const processCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase()
    const args = command.split(" ")

    switch (args[0]) {
      case "help":
        setOutput((prev) => [
          ...prev,
          {
            type: "output",
            content: `
Available commands:
  help                Show this help message
  clear               Clear the terminal
  echo [text]         Display text
  date                Show current date and time
  ls                  List virtual files
  cat [file]          Display file content
  whoami              Display current user
  ping [url]          Ping a URL
  calc [expression]   Calculate a mathematical expression
  history             Show command history
  weather [location]  Show weather (simulated)
  joke                Tell a joke
  exit                Close the terminal panel
          `.trim(),
          },
        ])
        break

      case "clear":
        setOutput([])
        break

      case "echo":
        setOutput((prev) => [
          ...prev,
          {
            type: "output",
            content: args.slice(1).join(" ") || "",
          },
        ])
        break

      case "date":
        setOutput((prev) => [
          ...prev,
          {
            type: "output",
            content: new Date().toString(),
          },
        ])
        break

      case "ls":
        setOutput((prev) => [
          ...prev,
          {
            type: "output",
            content: `
documents/
images/
projects/
  website/
  app/
notes.txt
todo.md
          `.trim(),
          },
        ])
        break

      case "cat":
        if (args[1] === "notes.txt") {
          setOutput((prev) => [
            ...prev,
            {
              type: "output",
              content: "This is a virtual file system. These files don't actually exist.",
            },
          ])
        } else if (args[1] === "todo.md") {
          setOutput((prev) => [
            ...prev,
            {
              type: "output",
              content: "# Todo\n- Finish the terminal panel\n- Add more features\n- Test everything",
            },
          ])
        } else {
          setOutput((prev) => [
            ...prev,
            {
              type: "output",
              content: `File not found: ${args[1] || ""}`,
            },
          ])
        }
        break

      case "whoami":
        setOutput((prev) => [
          ...prev,
          {
            type: "output",
            content: "guest@web-terminal",
          },
        ])
        break

      case "ping":
        if (!args[1]) {
          setOutput((prev) => [
            ...prev,
            {
              type: "output",
              content: "Usage: ping [url]",
            },
          ])
          break
        }

        setOutput((prev) => [
          ...prev,
          {
            type: "output",
            content: `Pinging ${args[1]}...`,
          },
        ])

        setTimeout(() => {
          setOutput((prev) => [
            ...prev,
            {
              type: "output",
              content: `Reply from ${args[1]}: time=42ms`,
            },
          ])
        }, 500)

        setTimeout(() => {
          setOutput((prev) => [
            ...prev,
            {
              type: "output",
              content: `Reply from ${args[1]}: time=36ms`,
            },
          ])
        }, 1000)

        setTimeout(() => {
          setOutput((prev) => [
            ...prev,
            {
              type: "output",
              content: `Reply from ${args[1]}: time=38ms`,
            },
          ])
        }, 1500)

        break

      case "calc":
        if (!args[1]) {
          setOutput((prev) => [
            ...prev,
            {
              type: "output",
              content: "Usage: calc [expression]",
            },
          ])
          break
        }

        try {
          const expression = args.slice(1).join(" ")
          // Use Function instead of eval for better isolation
          const result = new Function(`return ${expression}`)()
          setOutput((prev) => [
            ...prev,
            {
              type: "output",
              content: `${expression} = ${result}`,
            },
          ])
        } catch (error) {
          setOutput((prev) => [
            ...prev,
            {
              type: "output",
              content: `Error: Invalid expression`,
            },
          ])
        }
        break

      case "history":
        setOutput((prev) => [
          ...prev,
          {
            type: "output",
            content: history.map((cmd, i) => `${i + 1}  ${cmd}`).join("\n"),
          },
        ])
        break

      case "weather":
        const location = args[1] || "current location"
        setOutput((prev) => [
          ...prev,
          {
            type: "output",
            content: `Weather for ${location}: 72°F, Partly Cloudy`,
          },
        ])
        break

      case "joke":
        const jokes = [
          "Why do programmers prefer dark mode? Because light attracts bugs!",
          "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
          "Why do Java developers wear glasses? Because they don't C#!",
          "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'",
          "Why was the JavaScript developer sad? Because he didn't know how to Object.create(happiness).",
        ]
        setOutput((prev) => [
          ...prev,
          {
            type: "output",
            content: jokes[Math.floor(Math.random() * jokes.length)],
          },
        ])
        break

      case "exit":
        toast({
          title: "Terminal",
          description: "Use the X button in the panel header to close the terminal",
        })
        break

      default:
        setOutput((prev) => [
          ...prev,
          {
            type: "output",
            content: `Command not found: ${args[0]}. Type 'help' for available commands.`,
          },
        ])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle up/down arrows for history navigation
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(history[history.length - 1 - newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(history[history.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput("")
      }
    }
  }

  const copyOutput = () => {
    const text = output.map((line) => line.content).join("\n")
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Terminal output copied to clipboard",
    })
  }

  const downloadOutput = () => {
    const text = output.map((line) => line.content).join("\n")
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "terminal-output.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Downloaded",
      description: "Terminal output saved as terminal-output.txt",
    })
  }

  const clearTerminal = () => {
    if (confirm("Are you sure you want to clear the terminal?")) {
      setOutput([])
      toast({
        title: "Cleared",
        description: "Terminal output has been cleared",
      })
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b bg-black text-white">
        <div className="flex items-center">
          <TerminalIcon className="h-4 w-4 mr-2" />
          <span className="text-sm font-mono">Terminal</span>
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white" onClick={copyOutput}>
            <Copy className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white" onClick={downloadOutput}>
            <Download className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white" onClick={clearTerminal}>
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div ref={terminalRef} className="flex-1 bg-black text-green-400 font-mono text-sm p-2 overflow-auto">
        {output.map((line, index) => (
          <div key={index} className={line.type === "input" ? "text-cyan-400" : "text-green-400"}>
            {line.content}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="flex items-center mt-1">
          <span className="text-cyan-400 mr-1">$</span>
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none text-cyan-400 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-6"
            autoFocus
          />
        </form>
      </div>
    </div>
  )
}

