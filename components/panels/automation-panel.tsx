"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Play, Square, Plus, Trash, Edit, MousePointer, KeyboardIcon, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface MacroStep {
  id: string
  type: "click" | "type" | "wait"
  params: Record<string, any>
}

interface Macro {
  id: string
  name: string
  steps: MacroStep[]
}

export default function AutomationPanel() {
  const { toast } = useToast()
  const [macros, setMacros] = useState<Macro[]>([
    {
      id: "1",
      name: "Sample Macro",
      steps: [
        { id: "s1", type: "click", params: { x: 100, y: 100 } },
        { id: "s2", type: "type", params: { text: "Hello World" } },
        { id: "s3", type: "wait", params: { ms: 1000 } },
      ],
    },
  ])
  const [activeMacroId, setActiveMacroId] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [newMacroName, setNewMacroName] = useState("")
  const [editingStep, setEditingStep] = useState<MacroStep | null>(null)

  const activeMacro = activeMacroId ? macros.find((m) => m.id === activeMacroId) : null

  const startRecording = () => {
    if (!activeMacroId) {
      toast({
        title: "Error",
        description: "Please select or create a macro first",
        variant: "destructive",
      })
      return
    }

    setIsRecording(true)
    toast({
      title: "Recording Started",
      description: "Your actions are now being recorded",
    })

    // In a real implementation, this would hook into browser events
  }

  const stopRecording = () => {
    setIsRecording(false)
    toast({
      title: "Recording Stopped",
      description: "Your macro has been saved",
    })
  }

  const playMacro = () => {
    if (!activeMacroId) {
      toast({
        title: "Error",
        description: "Please select a macro to play",
        variant: "destructive",
      })
      return
    }

    setIsPlaying(true)
    toast({
      title: "Macro Playing",
      description: `Playing "${activeMacro?.name}"`,
    })

    // Simulate macro execution
    setTimeout(() => {
      setIsPlaying(false)
      toast({
        title: "Macro Complete",
        description: "The macro has finished executing",
      })
    }, 3000)
  }

  const stopPlaying = () => {
    setIsPlaying(false)
    toast({
      title: "Macro Stopped",
      description: "Macro execution has been stopped",
    })
  }

  const createNewMacro = () => {
    if (!newMacroName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the macro",
        variant: "destructive",
      })
      return
    }

    const newMacro: Macro = {
      id: Date.now().toString(),
      name: newMacroName,
      steps: [],
    }

    setMacros([...macros, newMacro])
    setActiveMacroId(newMacro.id)
    setNewMacroName("")

    toast({
      title: "Macro Created",
      description: `Created new macro "${newMacroName}"`,
    })
  }

  const deleteMacro = (id: string) => {
    if (confirm("Are you sure you want to delete this macro?")) {
      setMacros(macros.filter((m) => m.id !== id))

      if (activeMacroId === id) {
        setActiveMacroId(null)
      }

      toast({
        title: "Macro Deleted",
        description: "The macro has been deleted",
      })
    }
  }

  const addStep = (type: "click" | "type" | "wait") => {
    if (!activeMacroId) return

    const newStep: MacroStep = {
      id: Date.now().toString(),
      type,
      params: type === "click" ? { x: 0, y: 0 } : type === "type" ? { text: "" } : { ms: 1000 },
    }

    setMacros(
      macros.map((macro) => (macro.id === activeMacroId ? { ...macro, steps: [...macro.steps, newStep] } : macro)),
    )

    setEditingStep(newStep)
  }

  const updateStep = (step: MacroStep) => {
    if (!activeMacroId) return

    setMacros(
      macros.map((macro) =>
        macro.id === activeMacroId
          ? {
              ...macro,
              steps: macro.steps.map((s) => (s.id === step.id ? step : s)),
            }
          : macro,
      ),
    )

    setEditingStep(null)
  }

  const deleteStep = (stepId: string) => {
    if (!activeMacroId) return

    setMacros(
      macros.map((macro) =>
        macro.id === activeMacroId
          ? {
              ...macro,
              steps: macro.steps.filter((s) => s.id !== stepId),
            }
          : macro,
      ),
    )
  }

  const renderStepEditor = () => {
    if (!editingStep) return null

    return (
      <div className="border rounded p-4 mt-4">
        <h3 className="font-medium mb-2">Edit Step</h3>

        {editingStep.type === "click" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>X Position</Label>
              <Input
                type="number"
                value={editingStep.params.x}
                onChange={(e) =>
                  setEditingStep({
                    ...editingStep,
                    params: { ...editingStep.params, x: Number.parseInt(e.target.value) || 0 },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Y Position</Label>
              <Input
                type="number"
                value={editingStep.params.y}
                onChange={(e) =>
                  setEditingStep({
                    ...editingStep,
                    params: { ...editingStep.params, y: Number.parseInt(e.target.value) || 0 },
                  })
                }
              />
            </div>
          </div>
        )}

        {editingStep.type === "type" && (
          <div className="space-y-2">
            <Label>Text to Type</Label>
            <Textarea
              value={editingStep.params.text}
              onChange={(e) =>
                setEditingStep({
                  ...editingStep,
                  params: { ...editingStep.params, text: e.target.value },
                })
              }
              placeholder="Enter text to type..."
            />
          </div>
        )}

        {editingStep.type === "wait" && (
          <div className="space-y-2">
            <Label>Wait Time (ms)</Label>
            <Input
              type="number"
              value={editingStep.params.ms}
              onChange={(e) =>
                setEditingStep({
                  ...editingStep,
                  params: { ...editingStep.params, ms: Number.parseInt(e.target.value) || 0 },
                })
              }
            />
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => setEditingStep(null)}>
            Cancel
          </Button>
          <Button onClick={() => updateStep(editingStep)}>Save</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="macros" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="macros">Macros</TabsTrigger>
          <TabsTrigger value="shortcuts">Keyboard Shortcuts</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="macros" className="flex-1 flex flex-col p-4">
          <div className="flex space-x-2 mb-4">
            <Input
              placeholder="New macro name..."
              value={newMacroName}
              onChange={(e) => setNewMacroName(e.target.value)}
            />
            <Button onClick={createNewMacro}>
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border rounded p-4 space-y-2">
              <h3 className="font-medium mb-2">Macros</h3>
              {macros.length > 0 ? (
                <ul className="space-y-1">
                  {macros.map((macro) => (
                    <li
                      key={macro.id}
                      className={`
                        flex items-center justify-between p-2 rounded
                        ${activeMacroId === macro.id ? "bg-muted" : "hover:bg-muted/50"}
                        cursor-pointer
                      `}
                      onClick={() => setActiveMacroId(macro.id)}
                    >
                      <span>{macro.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteMacro(macro.id)
                        }}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-muted-foreground p-4">No macros created yet</div>
              )}
            </div>

            <div className="border rounded p-4">
              <h3 className="font-medium mb-2">Controls</h3>
              <div className="grid grid-cols-2 gap-2">
                {isRecording ? (
                  <Button variant="destructive" onClick={stopRecording}>
                    <Square className="h-4 w-4 mr-1" />
                    Stop Recording
                  </Button>
                ) : (
                  <Button onClick={startRecording} disabled={!activeMacroId || isPlaying}>
                    <Play className="h-4 w-4 mr-1" />
                    Record
                  </Button>
                )}

                {isPlaying ? (
                  <Button variant="destructive" onClick={stopPlaying}>
                    <Square className="h-4 w-4 mr-1" />
                    Stop
                  </Button>
                ) : (
                  <Button onClick={playMacro} disabled={!activeMacroId || !activeMacro?.steps.length || isRecording}>
                    <Play className="h-4 w-4 mr-1" />
                    Play
                  </Button>
                )}
              </div>
            </div>
          </div>

          {activeMacroId && (
            <div className="flex-1 flex flex-col border rounded p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Steps for "{activeMacro?.name}"</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addStep("click")}
                    disabled={isRecording || isPlaying}
                  >
                    <MousePointer className="h-3 w-3 mr-1" />
                    Click
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addStep("type")}
                    disabled={isRecording || isPlaying}
                  >
                    <KeyboardIcon className="h-3 w-3 mr-1" />
                    Type
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addStep("wait")}
                    disabled={isRecording || isPlaying}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Wait
                  </Button>
                </div>
              </div>

              {activeMacro?.steps.length ? (
                <ul className="space-y-1 mb-4">
                  {activeMacro.steps.map((step, index) => (
                    <li key={step.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium mr-2">{index + 1}.</span>
                        {step.type === "click" && (
                          <span>
                            Click at ({step.params.x}, {step.params.y})
                          </span>
                        )}
                        {step.type === "type" && <span>Type "{step.params.text}"</span>}
                        {step.type === "wait" && <span>Wait {step.params.ms}ms</span>}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setEditingStep(step)}
                          disabled={isRecording || isPlaying}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => deleteStep(step.id)}
                          disabled={isRecording || isPlaying}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  No steps added yet. Add steps using the buttons above or start recording.
                </div>
              )}

              {renderStepEditor()}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shortcuts" className="flex-1 p-4">
          <div className="space-y-4">
            <h3 className="font-medium">Custom Keyboard Shortcuts</h3>
            <p className="text-sm text-muted-foreground">
              Create custom keyboard shortcuts to automate repetitive tasks.
            </p>

            <div className="border rounded p-4">
              <div className="text-center text-muted-foreground p-4">Keyboard shortcut editor coming soon.</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="flex-1 p-4">
          <div className="space-y-4">
            <h3 className="font-medium">Schedule Automation</h3>
            <p className="text-sm text-muted-foreground">Schedule macros to run at specific times.</p>

            <div className="border rounded p-4">
              <div className="text-center text-muted-foreground p-4">Scheduling functionality coming soon.</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

