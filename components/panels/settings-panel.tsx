"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor, User, Smartphone, Laptop } from "lucide-react"

interface SettingsPanelProps {
  deviceType: "desktop" | "mobile"
  setDeviceType: (type: "desktop" | "mobile") => void
}

export default function SettingsPanel({ deviceType, setDeviceType }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [privacyMode, setPrivacyMode] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="p-4 h-full overflow-auto">
      <Tabs defaultValue="appearance">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <div className="text-xs text-muted-foreground">Choose your preferred theme</div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button variant={theme === "dark" ? "default" : "outline"} size="icon" onClick={() => setTheme("dark")}>
                  <Moon className="h-4 w-4" />
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Device Mode</Label>
                <div className="text-xs text-muted-foreground">Switch between desktop and mobile layouts</div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={deviceType === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDeviceType("desktop")}
                >
                  <Laptop className="h-4 w-4 mr-2" />
                  Desktop
                </Button>
                <Button
                  variant={deviceType === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDeviceType("mobile")}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="grid grid-cols-6 gap-2">
                {["slate", "red", "orange", "green", "blue", "purple"].map((color) => (
                  <Button
                    key={color}
                    variant="outline"
                    className={`h-8 w-full bg-${color}-500 hover:bg-${color}-600`}
                    onClick={() => {
                      document.documentElement.style.setProperty("--accent", `hsl(var(--${color}-500))`)
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button className="w-full">
            <User className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <div className="text-xs text-muted-foreground">Receive notifications for important events</div>
            </div>
            <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
          </div>

          <div className="space-y-2">
            <Label>Notification Types</Label>
            <div className="space-y-2">
              {["System Updates", "Security Alerts", "Panel Changes", "AI Suggestions"].map((type) => (
                <div key={type} className="flex items-center justify-between">
                  <span>{type}</span>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="privacy-mode">Privacy Mode</Label>
              <div className="text-xs text-muted-foreground">Hide all content when enabled</div>
            </div>
            <Switch id="privacy-mode" checked={privacyMode} onCheckedChange={setPrivacyMode} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-save">Auto Save</Label>
              <div className="text-xs text-muted-foreground">Automatically save your work</div>
            </div>
            <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
          </div>

          <div className="space-y-2">
            <Label>Data Storage</Label>
            <Select defaultValue="local">
              <SelectTrigger>
                <SelectValue placeholder="Select storage option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Storage Only</SelectItem>
                <SelectItem value="cloud">Cloud Sync</SelectItem>
                <SelectItem value="encrypted">Encrypted Cloud</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

