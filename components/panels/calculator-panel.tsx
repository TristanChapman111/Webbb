"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Copy, History, Trash, Download, Upload, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CalculatorSettings {
  precision: number
  angleUnit: "deg" | "rad"
  notation: "standard" | "scientific" | "engineering"
  showThousandsSeparator: boolean
  autoCalculate: boolean
  saveHistory: boolean
  theme: "light" | "dark" | "system"
}

interface HistoryItem {
  expression: string
  result: string
  timestamp: number
}

export default function CalculatorPanel() {
  const { toast } = useToast()
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [memory, setMemory] = useState<number | null>(null)
  const [settings, setSettings] = useState<CalculatorSettings>({
    precision: 10,
    angleUnit: "deg",
    notation: "standard",
    showThousandsSeparator: true,
    autoCalculate: true,
    saveHistory: true,
    theme: "system",
  })
  const [calculatorType, setCalculatorType] = useState<"standard" | "scientific" | "programmer" | "graphing">(
    "standard",
  )
  const [isCalculating, setIsCalculating] = useState(false)

  // Load history and settings from localStorage on initial render
  useEffect(() => {
    const savedHistory = localStorage.getItem("calculator-history")
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Failed to parse saved history", e)
      }
    }

    const savedSettings = localStorage.getItem("calculator-settings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error("Failed to parse saved settings", e)
      }
    }

    const savedMemory = localStorage.getItem("calculator-memory")
    if (savedMemory) {
      try {
        setMemory(JSON.parse(savedMemory))
      } catch (e) {
        console.error("Failed to parse saved memory", e)
      }
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (settings.saveHistory) {
      localStorage.setItem("calculator-history", JSON.stringify(history))
    }
  }, [history, settings.saveHistory])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("calculator-settings", JSON.stringify(settings))
  }, [settings])

  // Save memory to localStorage whenever it changes
  useEffect(() => {
    if (memory !== null) {
      localStorage.setItem("calculator-memory", JSON.stringify(memory))
    }
  }, [memory])

  // Auto calculate when input changes if enabled
  useEffect(() => {
    if (settings.autoCalculate && input) {
      calculate()
    }
  }, [input, settings.autoCalculate])

  const appendToInput = (value: string) => {
    setInput((prev) => prev + value)
  }

  const clearInput = () => {
    setInput("")
    setResult("")
  }

  const clearLastChar = () => {
    setInput((prev) => prev.slice(0, -1))
  }

  const calculate = () => {
    if (!input) return

    setIsCalculating(true)

    try {
      // Replace mathematical symbols for JavaScript evaluation
      let expression = input.replace(/×/g, "*").replace(/÷/g, "/").replace(/π/g, "Math.PI").replace(/e/g, "Math.E")

      // Handle trigonometric functions based on angle unit
      if (settings.angleUnit === "deg") {
        expression = expression
          .replace(/sin\(/g, "Math.sin(Math.PI/180*")
          .replace(/cos\(/g, "Math.cos(Math.PI/180*")
          .replace(/tan\(/g, "Math.tan(Math.PI/180*")
      } else {
        expression = expression
          .replace(/sin\(/g, "Math.sin(")
          .replace(/cos\(/g, "Math.cos(")
          .replace(/tan\(/g, "Math.tan(")
      }

      // Handle other mathematical functions
      expression = expression
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/abs\(/g, "Math.abs(")
        .replace(/pow\(/g, "Math.pow(")

      // Evaluate the expression
      // eslint-disable-next-line no-eval
      let calculatedResult = eval(expression)

      // Format the result based on settings
      if (typeof calculatedResult === "number") {
        if (settings.notation === "scientific") {
          calculatedResult = calculatedResult.toExponential(settings.precision)
        } else if (settings.notation === "engineering") {
          const exponent = Math.floor(Math.log10(Math.abs(calculatedResult)))
          const mantissa = calculatedResult / Math.pow(10, exponent)
          calculatedResult = `${mantissa.toFixed(settings.precision)} × 10^${exponent}`
        } else {
          calculatedResult = calculatedResult.toFixed(settings.precision)

          // Add thousands separator if enabled
          if (settings.showThousandsSeparator) {
            calculatedResult = Number(calculatedResult).toLocaleString(undefined, {
              maximumFractionDigits: settings.precision,
            })
          }
        }
      }

      setResult(calculatedResult.toString())

      // Add to history
      if (settings.saveHistory) {
        setHistory((prev) =>
          [
            {
              expression: input,
              result: calculatedResult.toString(),
              timestamp: Date.now(),
            },
            ...prev,
          ].slice(0, 100),
        ) // Keep only the last 100 items
      }
    } catch (error) {
      setResult("Error")
      console.error("Calculation error:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const useHistoryItem = useCallback((item: HistoryItem) => {
    setInput(item.expression)
    setResult(item.result)
  }, [])

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear the calculation history?")) {
      setHistory([])
      localStorage.removeItem("calculator-history")

      toast({
        title: "History Cleared",
        description: "Your calculation history has been cleared",
      })
    }
  }

  const copyResult = () => {
    if (!result) return

    navigator.clipboard.writeText(result)

    toast({
      title: "Copied",
      description: "Result copied to clipboard",
    })
  }

  const memoryStore = () => {
    if (!result) return

    try {
      const value = Number.parseFloat(result.replace(/,/g, ""))
      setMemory(value)

      toast({
        title: "Memory Stored",
        description: `Value ${value} stored in memory`,
      })
    } catch (error) {
      console.error("Memory store error:", error)
    }
  }

  const memoryRecall = () => {
    if (memory === null) return

    setInput((prev) => prev + memory.toString())
  }

  const memoryClear = () => {
    setMemory(null)
    localStorage.removeItem("calculator-memory")

    toast({
      title: "Memory Cleared",
      description: "Calculator memory has been cleared",
    })
  }

  const memoryAdd = () => {
    if (!result || memory === null) return

    try {
      const value = Number.parseFloat(result.replace(/,/g, ""))
      setMemory(memory + value)

      toast({
        title: "Memory Updated",
        description: `Added ${value} to memory`,
      })
    } catch (error) {
      console.error("Memory add error:", error)
    }
  }

  const memorySubtract = () => {
    if (!result || memory === null) return

    try {
      const value = Number.parseFloat(result.replace(/,/g, ""))
      setMemory(memory - value)

      toast({
        title: "Memory Updated",
        description: `Subtracted ${value} from memory`,
      })
    } catch (error) {
      console.error("Memory subtract error:", error)
    }
  }

  const exportSettings = () => {
    const exportData = {
      settings,
      memory,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "calculator-settings.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Settings Exported",
      description: "Your calculator settings have been exported",
    })
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        if (data.settings) {
          setSettings(data.settings)
        }

        if (data.memory !== undefined) {
          setMemory(data.memory)
        }

        toast({
          title: "Settings Imported",
          description: "Your calculator settings have been imported",
        })
      } catch (error) {
        console.error("Error importing settings:", error)
        toast({
          title: "Import Error",
          description: "Failed to import calculator settings",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="calculator" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="flex-1 flex flex-col p-4">
          <div className="mb-4">
            <Select
              value={calculatorType}
              onValueChange={(value: "standard" | "scientific" | "programmer" | "graphing") => setCalculatorType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Calculator Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="scientific">Scientific</SelectItem>
                <SelectItem value="programmer">Programmer</SelectItem>
                <SelectItem value="graphing">Graphing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 mb-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter expression..."
              className="text-right text-lg font-mono"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  calculate()
                }
              }}
            />

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{memory !== null && <span>Memory: {memory}</span>}</div>
              <div className="text-right text-2xl font-mono font-bold">
                {isCalculating ? <RefreshCw className="h-6 w-6 animate-spin ml-auto" /> : result || "0"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            <Button variant="outline" onClick={() => memoryStore()}>
              MS
            </Button>
            <Button variant="outline" onClick={() => memoryRecall()} disabled={memory === null}>
              MR
            </Button>
            <Button variant="outline" onClick={() => memoryAdd()} disabled={memory === null}>
              M+
            </Button>
            <Button variant="outline" onClick={() => memorySubtract()} disabled={memory === null}>
              M-
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            <Button variant="outline" onClick={() => clearInput()}>
              C
            </Button>
            <Button variant="outline" onClick={() => clearLastChar()}>
              ⌫
            </Button>
            <Button variant="outline" onClick={() => appendToInput("%")}>
              %
            </Button>
            <Button variant="outline" onClick={() => appendToInput("÷")}>
              ÷
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            <Button variant="outline" onClick={() => appendToInput("7")}>
              7
            </Button>
            <Button variant="outline" onClick={() => appendToInput("8")}>
              8
            </Button>
            <Button variant="outline" onClick={() => appendToInput("9")}>
              9
            </Button>
            <Button variant="outline" onClick={() => appendToInput("×")}>
              ×
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            <Button variant="outline" onClick={() => appendToInput("4")}>
              4
            </Button>
            <Button variant="outline" onClick={() => appendToInput("5")}>
              5
            </Button>
            <Button variant="outline" onClick={() => appendToInput("6")}>
              6
            </Button>
            <Button variant="outline" onClick={() => appendToInput("-")}>
              -
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            <Button variant="outline" onClick={() => appendToInput("1")}>
              1
            </Button>
            <Button variant="outline" onClick={() => appendToInput("2")}>
              2
            </Button>
            <Button variant="outline" onClick={() => appendToInput("3")}>
              3
            </Button>
            <Button variant="outline" onClick={() => appendToInput("+")}>
              +
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            <Button variant="outline" onClick={() => appendToInput("0")}>
              0
            </Button>
            <Button variant="outline" onClick={() => appendToInput(".")}>
              .
            </Button>
            <Button variant="outline" onClick={() => copyResult()}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="default" onClick={() => calculate()}>
              =
            </Button>
          </div>

          {calculatorType === "scientific" && (
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" onClick={() => appendToInput("sin(")}>
                sin
              </Button>
              <Button variant="outline" onClick={() => appendToInput("cos(")}>
                cos
              </Button>
              <Button variant="outline" onClick={() => appendToInput("tan(")}>
                tan
              </Button>
              <Button variant="outline" onClick={() => appendToInput("π")}>
                π
              </Button>

              <Button variant="outline" onClick={() => appendToInput("log(")}>
                log
              </Button>
              <Button variant="outline" onClick={() => appendToInput("ln(")}>
                ln
              </Button>
              <Button variant="outline" onClick={() => appendToInput("sqrt(")}>
                √
              </Button>
              <Button variant="outline" onClick={() => appendToInput("e")}>
                e
              </Button>

              <Button variant="outline" onClick={() => appendToInput("(")}>
                (
              </Button>
              <Button variant="outline" onClick={() => appendToInput(")")}>
                )
              </Button>
              <Button variant="outline" onClick={() => appendToInput("pow(")}>
                x^y
              </Button>
              <Button variant="outline" onClick={() => appendToInput("!")}>
                !
              </Button>
            </div>
          )}

          {calculatorType === "programmer" && (
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" onClick={() => appendToInput("&")}>
                AND
              </Button>
              <Button variant="outline" onClick={() => appendToInput("|")}>
                OR
              </Button>
              <Button variant="outline" onClick={() => appendToInput("^")}>
                XOR
              </Button>
              <Button variant="outline" onClick={() => appendToInput("~")}>
                NOT
              </Button>

              <Button variant="outline" onClick={() => appendToInput("<<")}>
                &lt;&lt;
              </Button>
              <Button variant="outline" onClick={() => appendToInput(">>")}>
                &gt;&gt;
              </Button>
              <Button variant="outline" onClick={() => appendToInput("0x")}>
                HEX
              </Button>
              <Button variant="outline" onClick={() => appendToInput("0b")}>
                BIN
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="flex-1 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Calculation History</h3>
            <Button variant="outline" size="sm" onClick={clearHistory} disabled={history.length === 0}>
              <Trash className="h-4 w-4 mr-1" />
              Clear History
            </Button>
          </div>

          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="p-3 border rounded hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => useHistoryItem(item)}
                >
                  <div className="flex justify-between">
                    <span className="font-mono">{item.expression}</span>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(item.timestamp)}</span>
                  </div>
                  <div className="font-mono font-bold mt-1">= {item.result}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <History className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No calculation history</p>
              {!settings.saveHistory && (
                <p className="text-xs text-muted-foreground mt-1">History saving is currently disabled in settings</p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="flex-1 p-4">
          <div className="space-y-6">
            <h3 className="font-medium">Calculator Settings</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="precision">Decimal Precision</Label>
                <Select
                  value={settings.precision.toString()}
                  onValueChange={(value) => setSettings({ ...settings, precision: Number.parseInt(value) })}
                >
                  <SelectTrigger id="precision">
                    <SelectValue placeholder="Select precision" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value} {value === 1 ? "digit" : "digits"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="angle-unit">Angle Unit</Label>
                <Select
                  value={settings.angleUnit}
                  onValueChange={(value: "deg" | "rad") => setSettings({ ...settings, angleUnit: value })}
                >
                  <SelectTrigger id="angle-unit">
                    <SelectValue placeholder="Select angle unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deg">Degrees</SelectItem>
                    <SelectItem value="rad">Radians</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notation">Number Notation</Label>
                <Select
                  value={settings.notation}
                  onValueChange={(value: "standard" | "scientific" | "engineering") =>
                    setSettings({ ...settings, notation: value })
                  }
                >
                  <SelectTrigger id="notation">
                    <SelectValue placeholder="Select notation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="scientific">Scientific</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="thousands-separator">Thousands Separator</Label>
                  <p className="text-xs text-muted-foreground">Show commas as thousands separators</p>
                </div>
                <Switch
                  id="thousands-separator"
                  checked={settings.showThousandsSeparator}
                  onCheckedChange={(checked) => setSettings({ ...settings, showThousandsSeparator: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-calculate">Auto Calculate</Label>
                  <p className="text-xs text-muted-foreground">Calculate automatically as you type</p>
                </div>
                <Switch
                  id="auto-calculate"
                  checked={settings.autoCalculate}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoCalculate: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="save-history">Save History</Label>
                  <p className="text-xs text-muted-foreground">Save calculation history</p>
                </div>
                <Switch
                  id="save-history"
                  checked={settings.saveHistory}
                  onCheckedChange={(checked) => setSettings({ ...settings, saveHistory: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value: "light" | "dark" | "system") => setSettings({ ...settings, theme: value })}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1" onClick={exportSettings}>
                  <Download className="h-4 w-4 mr-1" />
                  Export Settings
                </Button>

                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => document.getElementById("import-settings")?.click()}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Import Settings
                </Button>
                <input id="import-settings" type="file" accept=".json" className="hidden" onChange={importSettings} />
              </div>

              <Button variant="outline" className="w-full" onClick={memoryClear} disabled={memory === null}>
                <Trash className="h-4 w-4 mr-1" />
                Clear Memory
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

