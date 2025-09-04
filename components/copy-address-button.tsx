"use client"

import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import type { ReactNode } from "react"

interface CopyAddressButtonProps {
  address: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: ReactNode
}

export function CopyAddressButton({
  address,
  variant = "outline",
  size = "sm",
  className,
  children,
}: CopyAddressButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(address)
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleCopy}>
      {children || <Copy className="w-4 h-4" />}
    </Button>
  )
}
