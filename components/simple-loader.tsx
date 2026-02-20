"use client"

import { useState, useEffect } from "react"
import { Loader2, Check, CircleDashed } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SimpleLoaderProps {
  // Accepts a single string OR an array of messages
  text?: string | string[]
  title?: string
}

export function SimpleLoader({ text = "Processing...", title = "Please wait" }: SimpleLoaderProps) {
  // Normalize input to an array
  const messages = Array.isArray(text) ? text : [text]
  const [currentIndex, setCurrentIndex] = useState(0)

  // Cycle through messages if there is more than one
  useEffect(() => {
    if (messages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= messages.length - 1) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [messages.length])

  // Single Message Variant (Legacy)
  if (messages.length === 1) {
    return (
      <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
        <Card className="w-full max-w-sm shadow-xl border-slate-200">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20 duration-1000" />
              <Loader2 className="h-8 w-8 animate-spin text-slate-900 relative z-10" />
            </div>
            <p className="text-sm font-medium text-slate-600 animate-pulse">{messages[0]}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Checklist Variant
  return (
    <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 bg-white/95 ring-1 ring-slate-900/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <Loader2 className="h-5 w-5 animate-spin text-slate-900" />
            <h3 className="font-semibold text-slate-900">{title}</h3>
          </div>

          <div className="space-y-4">
            {messages.map((message, idx) => {
              const isCompleted = idx < currentIndex
              const isCurrent = idx === currentIndex
              const isPending = idx > currentIndex

              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-3 transition-all duration-300",
                    isPending && "opacity-40"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border shrink-0 transition-colors duration-300",
                    isCompleted ? "bg-emerald-500 border-emerald-500 text-white" :
                      isCurrent ? "border-slate-900 text-slate-900" :
                        "border-slate-200 text-slate-300"
                  )}>
                    {isCompleted && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                    {isCurrent && <div className="w-2 h-2 bg-slate-900 rounded-full animate-pulse" />}
                    {isPending && <div className="w-2 h-2 bg-slate-200 rounded-full" />}
                  </div>

                  <span className={cn(
                    "text-sm transition-colors duration-300",
                    isCompleted ? "text-slate-500 font-medium" :
                      isCurrent ? "text-slate-900 font-semibold" :
                        "text-slate-400"
                  )}>
                    {message}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center">
            <p className="text-xs text-slate-400">This might take a few seconds...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}