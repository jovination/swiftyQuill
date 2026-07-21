import React from "react"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

export function SpinnerBadge({
  status = "Processing",
  variant = "emerald",
}: {
  status?: string
  variant?: "default" | "secondary" | "outline" | "emerald"
}) {
  return (
    <div className="flex items-center gap-2 transition-all duration-300 animate-in fade-in zoom-in-95">
      <Badge variant={variant} className="transition-all duration-300 hover:scale-105">
        <Spinner className="w-3.5 h-3.5 mr-1 text-emerald-500" />
        <span>{status}</span>
      </Badge>
    </div>
  )
}
