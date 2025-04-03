"use client"

import { Loader2 } from "lucide-react"

interface LoadingPanelProps {
  message?: string
  query?: string
}

export default function LoadingPanel({ message = "Loading...", query = "" }: LoadingPanelProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center space-y-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h3 className="text-lg font-medium">{message}</h3>
        {query && (
          <p className="text-sm text-muted-foreground">
            Creating a panel based on: <span className="font-medium">"{query}"</span>
          </p>
        )}
        <div className="w-48 h-2 bg-muted rounded-full overflow-hidden mt-4">
          <div className="h-full bg-primary animate-pulse-x origin-left"></div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">This may take a few moments...</p>
      </div>
    </div>
  )
}

