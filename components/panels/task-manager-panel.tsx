"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Maximize2,
  Minimize2,
  X,
  LayoutGrid,
  Columns,
  Rows,
  RefreshCw,
  Cpu,
  MemoryStickIcon as Memory,
  HardDrive,
  Wifi,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface TaskManagerProps {
  panels: any[]
  onRemovePanel: (id: string) => void
  onMaximizePanel: (id: string) => void
  onMinimizePanel: (id: string) => void
  onArrangePanels: (arrangement: "grid" | "horizontal" | "vertical") => void
}

export default function TaskManagerPanel({
  panels,
  onRemovePanel,
  onMaximizePanel,
  onMinimizePanel,
  onArrangePanels,
}: TaskManagerProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [systemInfo, setSystemInfo] = useState({
    cpu: Math.floor(Math.random() * 60) + 10,
    memory: Math.floor(Math.random() * 70) + 20,
    storage: Math.floor(Math.random() * 50) + 30,
    network: Math.floor(Math.random() * 40) + 5,
  })

  const filteredPanels = panels.filter((panel) => panel.type.toLowerCase().includes(searchQuery.toLowerCase()))

  const refreshSystemInfo = () => {
    setSystemInfo({
      cpu: Math.floor(Math.random() * 60) + 10,
      memory: Math.floor(Math.random() * 70) + 20,
      storage: Math.floor(Math.random() * 50) + 30,
      network: Math.floor(Math.random() * 40) + 5,
    })

    toast({
      title: "System Info Refreshed",
      description: "System information has been updated",
    })
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="panels" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="panels">Panels</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>

        <TabsContent value="panels" className="flex-1 flex flex-col p-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search panels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {filteredPanels.length > 0 ? (
              <div className="space-y-2">
                {filteredPanels.map((panel) => (
                  <div
                    key={panel.id}
                    className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                  >
                    <div>
                      <div className="font-medium">{panel.type.charAt(0).toUpperCase() + panel.type.slice(1)}</div>
                      <div className="text-xs text-muted-foreground">ID: {panel.id.substring(0, 8)}...</div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMaximizePanel(panel.id)}>
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMinimizePanel(panel.id)}>
                        <Minimize2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemovePanel(panel.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground">
                  {panels.length === 0 ? "No panels are currently open" : "No panels match your search"}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex space-x-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (panels.length === 0) {
                  toast({
                    title: "No Panels",
                    description: "There are no panels to close",
                    variant: "destructive",
                  })
                  return
                }

                panels.forEach((panel) => onRemovePanel(panel.id))
                toast({
                  title: "All Panels Closed",
                  description: "All panels have been closed",
                })
              }}
            >
              Close All Panels
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="system" className="flex-1 p-4">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">System Information</h3>
              <Button variant="outline" size="sm" onClick={refreshSystemInfo}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Cpu className="h-4 w-4 mr-2 text-blue-500" />
                    <span>CPU Usage</span>
                  </div>
                  <span className="font-medium">{systemInfo.cpu}%</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${systemInfo.cpu}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Memory className="h-4 w-4 mr-2 text-green-500" />
                    <span>Memory Usage</span>
                  </div>
                  <span className="font-medium">{systemInfo.memory}%</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: `${systemInfo.memory}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <HardDrive className="h-4 w-4 mr-2 text-amber-500" />
                    <span>Storage Usage</span>
                  </div>
                  <span className="font-medium">{systemInfo.storage}%</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: `${systemInfo.storage}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Wifi className="h-4 w-4 mr-2 text-purple-500" />
                    <span>Network Activity</span>
                  </div>
                  <span className="font-medium">{systemInfo.network} MB/s</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full" style={{ width: `${(systemInfo.network / 100) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="border rounded p-4">
              <h4 className="font-medium mb-2">Browser Information</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User Agent:</span>
                  <span className="truncate max-w-[250px]">{navigator.userAgent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform:</span>
                  <span>{navigator.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language:</span>
                  <span>{navigator.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cookies Enabled:</span>
                  <span>{navigator.cookieEnabled ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="layout" className="flex-1 p-4">
          <div className="space-y-6">
            <h3 className="font-medium">Panel Layout</h3>

            <div className="grid grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center p-6"
                onClick={() => onArrangePanels("grid")}
              >
                <LayoutGrid className="h-8 w-8 mb-2" />
                <span>Grid Layout</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center justify-center p-6"
                onClick={() => onArrangePanels("horizontal")}
              >
                <Rows className="h-8 w-8 mb-2" />
                <span>Horizontal Layout</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center justify-center p-6"
                onClick={() => onArrangePanels("vertical")}
              >
                <Columns className="h-8 w-8 mb-2" />
                <span>Vertical Layout</span>
              </Button>
            </div>

            <div className="border rounded p-4">
              <h4 className="font-medium mb-2">Layout Tips</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Use <strong>Grid Layout</strong> for organizing multiple panels in a balanced way
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Use <strong>Horizontal Layout</strong> for side-by-side comparison
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Use <strong>Vertical Layout</strong> for stacked workflows
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Drag panels manually for custom arrangements</span>
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

