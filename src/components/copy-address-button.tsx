"use client"
import React, { forwardRef, useState } from "react"

type Props = {
  address: string
  variant?: string
  className?: string
  children?: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const CopyAddressButton = forwardRef<HTMLButtonElement, Props>(function CopyAddressButton(
  { address, variant, className = "", children, onClick, ...rest },
  ref
) {
  const [copied, setCopied] = useState(false)

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (onClick) onClick(e)
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy address", err)
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className={className}
      {...rest}
      data-variant={variant}
    >
      {copied ? "Copied" : children}
    </button>
  )
})

export default CopyAddressButton
export { CopyAddressButton }