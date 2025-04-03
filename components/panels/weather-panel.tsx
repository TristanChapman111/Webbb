"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Search,
  MapPin,
  Star,
  Trash,
  RefreshCw,
  Save,
  AlertTriangle,
  ArrowUp,
  Compass,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface WeatherSettings {
  unit: "metric" | "imperial"
  updateInterval: number
  showHourlyForecast: boolean
  showDailyForecast: boolean
  showWindInfo: boolean
  showHumidity: boolean
  showPressure: boolean
  showSunriseSunset: boolean
  showFeelsLike: boolean
  showUVIndex: boolean
  darkMode: boolean
}

interface WeatherLocation {
  id: string
  name: string
  lat: number
  lon: number
  isFavorite: boolean
  lastUpdated?: number
}

interface WeatherData {
  location: string
  country: string
  temperature: number
  feelsLike: number
  description: string
  icon: string
  humidity: number
  pressure: number
  windSpeed: number
  windDirection: number
  sunrise: number
  sunset: number
  uvIndex: number
  hourlyForecast: {
    time: number
    temperature: number
    icon: string
  }[]
  dailyForecast: {
    date: number
    minTemp: number
    maxTemp: number
    icon: string
    description: string
  }[]
}

export default function WeatherPanel() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [locations, setLocations] = useState<WeatherLocation[]>([])
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("weather")
  const [settings, setSettings] = useState<WeatherSettings>({
    unit: "metric",
    updateInterval: 30,
    showHourlyForecast: true,
    showDailyForecast: true,
    showWindInfo: true,
    showHumidity: true,
    showPressure: true,
    showSunriseSunset: true,
    showFeelsLike: true,
    showUVIndex: true,
    darkMode: false,
  })

  // Load locations and settings from localStorage on initial render
  useEffect(() => {
    const savedLocations = localStorage.getItem("weather-locations")
    if (savedLocations) {
      try {
        setLocations(JSON.parse(savedLocations))
      } catch (e) {
        console.error("Failed to parse saved locations", e)
      }
    }

    const savedSettings = localStorage.getItem("weather-settings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error("Failed to parse saved settings", e)
      }
    }

    const savedActiveLocationId = localStorage.getItem("weather-active-location")
    if (savedActiveLocationId) {
      setActiveLocationId(savedActiveLocationId)
    }
  }, [])

  // Save locations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("weather-locations", JSON.stringify(locations))
  }, [locations])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("weather-settings", JSON.stringify(settings))
  }, [settings])

  // Save active location to localStorage whenever it changes
  useEffect(() => {
    if (activeLocationId) {
      localStorage.setItem("weather-active-location", activeLocationId)
    }
  }, [activeLocationId])

  // Fetch weather data for active location
  useEffect(() => {
    if (activeLocationId) {
      const location = locations.find((loc) => loc.id === activeLocationId)
      if (location) {
        fetchWeatherData(location)
      }
    }
  }, [activeLocationId, settings.unit])

  // Set up auto-refresh interval
  useEffect(() => {
    if (!activeLocationId || settings.updateInterval <= 0) return

    const intervalId = setInterval(
      () => {
        const location = locations.find((loc) => loc.id === activeLocationId)
        if (location) {
          fetchWeatherData(location)
        }
      },
      settings.updateInterval * 60 * 1000,
    )

    return () => clearInterval(intervalId)
  }, [activeLocationId, settings.updateInterval, locations])

  const searchLocations = () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchResults([])

    // Simulate API call
    setTimeout(() => {
      // Generate mock search results
      const results = [
        {
          name: searchQuery,
          country: "United States",
          lat: 40.7128,
          lon: -74.006,
        },
        {
          name: searchQuery + " City",
          country: "Canada",
          lat: 45.4215,
          lon: -75.6972,
        },
        {
          name: "North " + searchQuery,
          country: "United Kingdom",
          lat: 51.5074,
          lon: -0.1278,
        },
      ]

      setSearchResults(results)
      setIsSearching(false)
    }, 1000)
  }

  const addLocation = (result: any) => {
    const newLocation: WeatherLocation = {
      id: Date.now().toString(),
      name: `${result.name}, ${result.country}`,
      lat: result.lat,
      lon: result.lon,
      isFavorite: false,
    }

    setLocations([...locations, newLocation])
    setActiveLocationId(newLocation.id)
    setSearchQuery("")
    setSearchResults([])

    toast({
      title: "Location Added",
      description: `${newLocation.name} has been added to your locations`,
    })
  }

  const removeLocation = (id: string) => {
    setLocations(locations.filter((loc) => loc.id !== id))

    if (activeLocationId === id) {
      const remainingLocations = locations.filter((loc) => loc.id !== id)
      if (remainingLocations.length > 0) {
        setActiveLocationId(remainingLocations[0].id)
      } else {
        setActiveLocationId(null)
        setWeatherData(null)
      }
    }

    toast({
      title: "Location Removed",
      description: "The location has been removed from your list",
    })
  }

  const toggleFavorite = (id: string) => {
    setLocations(locations.map((loc) => (loc.id === id ? { ...loc, isFavorite: !loc.isFavorite } : loc)))
  }

  const fetchWeatherData = (location: WeatherLocation) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Generate mock weather data
      const mockWeatherData: WeatherData = {
        location: location.name.split(",")[0],
        country: location.name.split(",")[1]?.trim() || "Unknown",
        temperature: Math.round(Math.random() * 30 + (settings.unit === "metric" ? 0 : 32)),
        feelsLike: Math.round(Math.random() * 30 + (settings.unit === "metric" ? 0 : 32)),
        description: ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Thunderstorm"][Math.floor(Math.random() * 5)],
        icon: ["01d", "02d", "03d", "10d", "11d"][Math.floor(Math.random() * 5)],
        humidity: Math.round(Math.random() * 100),
        pressure: Math.round(Math.random() * 50 + 970),
        windSpeed: Math.round(Math.random() * 20),
        windDirection: Math.round(Math.random() * 360),
        sunrise: Date.now() - 3600000,
        sunset: Date.now() + 3600000,
        uvIndex: Math.round(Math.random() * 11),
        hourlyForecast: Array.from({ length: 24 }, (_, i) => ({
          time: Date.now() + i * 3600000,
          temperature: Math.round(Math.random() * 30 + (settings.unit === "metric" ? 0 : 32)),
          icon: ["01d", "02d", "03d", "10d", "11d"][Math.floor(Math.random() * 5)],
        })),
        dailyForecast: Array.from({ length: 7 }, (_, i) => ({
          date: Date.now() + i * 86400000,
          minTemp: Math.round(Math.random() * 20 + (settings.unit === "metric" ? 0 : 32)),
          maxTemp: Math.round(Math.random() * 30 + (settings.unit === "metric" ? 0 : 32)),
          icon: ["01d", "02d", "03d", "10d", "11d"][Math.floor(Math.random() * 5)],
          description: ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Thunderstorm"][Math.floor(Math.random() * 5)],
        })),
      }

      setWeatherData(mockWeatherData)
      setIsLoading(false)

      // Update location's lastUpdated timestamp
      setLocations(locations.map((loc) => (loc.id === location.id ? { ...loc, lastUpdated: Date.now() } : loc)))

      toast({
        title: "Weather Updated",
        description: `Weather data for ${location.name} has been updated`,
      })
    }, 1500)
  }

  const saveSettings = () => {
    localStorage.setItem("weather-settings", JSON.stringify(settings))

    toast({
      title: "Settings Saved",
      description: "Your weather settings have been saved",
    })

    setActiveTab("weather")
  }

  const getWeatherIcon = (iconCode: string) => {
    switch (iconCode.substring(0, 2)) {
      case "01":
        return <Sun className="h-8 w-8 text-yellow-500" />
      case "02":
        return <Cloud className="h-8 w-8 text-gray-400" />
      case "03":
      case "04":
        return <Cloud className="h-8 w-8 text-gray-500" />
      case "09":
      case "10":
        return <CloudRain className="h-8 w-8 text-blue-400" />
      case "11":
        return <AlertTriangle className="h-8 w-8 text-yellow-600" />
      default:
        return <Cloud className="h-8 w-8 text-gray-400" />
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
  }

  const getWindDirection = (degrees: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    return directions[Math.round(degrees / 45) % 8]
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="weather" className="flex-1 overflow-auto">
          {!activeLocationId && (
            <div className="h-full flex flex-col items-center justify-center p-4">
              <MapPin className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Location Selected</h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Please add a location to view weather information
              </p>
              <Button onClick={() => setActiveTab("locations")}>Add Location</Button>
            </div>
          )}

          {activeLocationId && isLoading && (
            <div className="h-full flex flex-col items-center justify-center p-4">
              <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mb-4" />
              <h3 className="text-lg font-medium">Loading Weather Data...</h3>
            </div>
          )}

          {activeLocationId && !isLoading && weatherData && (
            <div className="p-4 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{weatherData.location}</h2>
                  <p className="text-gray-500">{weatherData.country}</p>
                  <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleTimeString()}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const location = locations.find((loc) => loc.id === activeLocationId)
                    if (location) fetchWeatherData(location)
                  }}
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {getWeatherIcon(weatherData.icon)}
                    <div className="ml-4">
                      <div className="text-4xl font-bold">
                        {weatherData.temperature}°{settings.unit === "metric" ? "C" : "F"}
                      </div>
                      <div className="text-lg">{weatherData.description}</div>
                    </div>
                  </div>

                  {settings.showFeelsLike && (
                    <div className="text-right">
                      <div className="text-sm">Feels like</div>
                      <div className="text-2xl font-semibold">
                        {weatherData.feelsLike}°{settings.unit === "metric" ? "C" : "F"}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {settings.showHumidity && (
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center">
                      <Droplets className="h-6 w-6 text-blue-500 mb-2" />
                      <div className="text-sm text-gray-500">Humidity</div>
                      <div className="text-lg font-semibold">{weatherData.humidity}%</div>
                    </CardContent>
                  </Card>
                )}

                {settings.showWindInfo && (
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center">
                      <Wind className="h-6 w-6 text-blue-500 mb-2" />
                      <div className="text-sm text-gray-500">Wind</div>
                      <div className="text-lg font-semibold">
                        {weatherData.windSpeed} {settings.unit === "metric" ? "m/s" : "mph"}
                      </div>
                      <div className="text-xs text-gray-400">{getWindDirection(weatherData.windDirection)}</div>
                    </CardContent>
                  </Card>
                )}

                {settings.showPressure && (
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center">
                      <Compass className="h-6 w-6 text-blue-500 mb-2" />
                      <div className="text-sm text-gray-500">Pressure</div>
                      <div className="text-lg font-semibold">{weatherData.pressure} hPa</div>
                    </CardContent>
                  </Card>
                )}

                {settings.showUVIndex && (
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center">
                      <Sun className="h-6 w-6 text-yellow-500 mb-2" />
                      <div className="text-sm text-gray-500">UV Index</div>
                      <div className="text-lg font-semibold">{weatherData.uvIndex}</div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {settings.showSunriseSunset && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col items-center">
                        <ArrowUp className="h-5 w-5 text-yellow-500 mb-1" />
                        <div className="text-sm text-gray-500">Sunrise</div>
                        <div className="text-lg font-semibold">{formatTime(weatherData.sunrise)}</div>
                      </div>

                      <div className="h-0.5 flex-1 bg-gray-200 mx-4"></div>

                      <div className="flex flex-col items-center">
                        <ArrowUp className="h-5 w-5 text-orange-500 mb-1 transform rotate-180" />
                        <div className="text-sm text-gray-500">Sunset</div>
                        <div className="text-lg font-semibold">{formatTime(weatherData.sunset)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {settings.showHourlyForecast && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Hourly Forecast</h3>
                  <div className="flex overflow-x-auto pb-2 space-x-4">
                    {weatherData.hourlyForecast.slice(0, 12).map((hour, index) => (
                      <div key={index} className="flex flex-col items-center min-w-[60px]">
                        <div className="text-sm text-gray-500">{formatTime(hour.time)}</div>
                        {getWeatherIcon(hour.icon)}
                        <div className="text-sm font-medium">
                          {hour.temperature}°{settings.unit === "metric" ? "C" : "F"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settings.showDailyForecast && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">7-Day Forecast</h3>
                  <Card>
                    {weatherData.dailyForecast.map((day, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 ${
                          index !== weatherData.dailyForecast.length - 1 ? "border-b" : ""
                        }`}
                      >
                        <div className="w-24">{formatDate(day.date)}</div>
                        <div className="flex items-center">
                          {getWeatherIcon(day.icon)}
                          <span className="ml-2 text-sm">{day.description}</span>
                        </div>
                        <div className="flex space-x-3">
                          <span className="text-sm font-medium">
                            {day.maxTemp}°{settings.unit === "metric" ? "C" : "F"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {day.minTemp}°{settings.unit === "metric" ? "C" : "F"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="locations" className="flex-1 overflow-auto">
          <div className="p-4 space-y-6">
            <div className="flex space-x-2">
              <Input
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchLocations()
                }}
              />
              <Button onClick={searchLocations} disabled={isSearching}>
                {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {searchResults.map((result, index) => (
                    <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-md">
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-500">{result.country}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => addLocation(result)}>
                        Add
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-3">Your Locations</h3>
              {locations.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No locations added yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {locations.map((location) => (
                    <Card key={location.id} className={`${activeLocationId === location.id ? "border-blue-500" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1 cursor-pointer" onClick={() => setActiveLocationId(location.id)}>
                            <div className="font-medium">{location.name}</div>
                            {location.lastUpdated && (
                              <div className="text-xs text-gray-500">
                                Updated: {new Date(location.lastUpdated).toLocaleString()}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => toggleFavorite(location.id)}>
                              <Star
                                className={`h-4 w-4 ${
                                  location.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                                }`}
                              />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => removeLocation(location.id)}>
                              <Trash className="h-4 w-4 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 overflow-auto">
          <div className="p-4 space-y-6">
            <h3 className="text-lg font-semibold mb-3">Weather Settings</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Temperature Unit</Label>
                  <Select
                    value={settings.unit}
                    onValueChange={(value: "metric" | "imperial") => setSettings({ ...settings, unit: value })}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Celsius (°C)</SelectItem>
                      <SelectItem value="imperial">Fahrenheit (°F)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-interval">Auto-update Interval (minutes)</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="update-interval"
                      min={0}
                      max={60}
                      step={5}
                      value={[settings.updateInterval]}
                      onValueChange={(value) => setSettings({ ...settings, updateInterval: value[0] })}
                    />
                    <span className="w-12 text-center">{settings.updateInterval}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Display Options</Label>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hourly-forecast"
                      checked={settings.showHourlyForecast}
                      onCheckedChange={(checked) => setSettings({ ...settings, showHourlyForecast: checked })}
                    />
                    <Label htmlFor="hourly-forecast">Show Hourly Forecast</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="daily-forecast"
                      checked={settings.showDailyForecast}
                      onCheckedChange={(checked) => setSettings({ ...settings, showDailyForecast: checked })}
                    />
                    <Label htmlFor="daily-forecast">Show Daily Forecast</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="wind-info"
                      checked={settings.showWindInfo}
                      onCheckedChange={(checked) => setSettings({ ...settings, showWindInfo: checked })}
                    />
                    <Label htmlFor="wind-info">Show Wind Information</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="humidity"
                      checked={settings.showHumidity}
                      onCheckedChange={(checked) => setSettings({ ...settings, showHumidity: checked })}
                    />
                    <Label htmlFor="humidity">Show Humidity</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pressure"
                      checked={settings.showPressure}
                      onCheckedChange={(checked) => setSettings({ ...settings, showPressure: checked })}
                    />
                    <Label htmlFor="pressure">Show Pressure</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sunrise-sunset"
                      checked={settings.showSunriseSunset}
                      onCheckedChange={(checked) => setSettings({ ...settings, showSunriseSunset: checked })}
                    />
                    <Label htmlFor="sunrise-sunset">Show Sunrise/Sunset</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="feels-like"
                      checked={settings.showFeelsLike}
                      onCheckedChange={(checked) => setSettings({ ...settings, showFeelsLike: checked })}
                    />
                    <Label htmlFor="feels-like">Show Feels Like</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="uv-index"
                      checked={settings.showUVIndex}
                      onCheckedChange={(checked) => setSettings({ ...settings, showUVIndex: checked })}
                    />
                    <Label htmlFor="uv-index">Show UV Index</Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
                />
                <Label htmlFor="dark-mode">Dark Mode</Label>
              </div>
            </div>

            <Button onClick={saveSettings} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

