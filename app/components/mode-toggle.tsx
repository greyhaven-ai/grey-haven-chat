"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Switch } from "./ui/switch"

export function ModeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const currentTheme = theme === "system" ? systemTheme : theme

  return (
    <Switch
      checked={currentTheme === "dark"}
      onCheckedChange={() => setTheme(currentTheme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      <SunIcon className="h-4 w-4" />
      <MoonIcon className="h-4 w-4" />
    </Switch>
  )
}

