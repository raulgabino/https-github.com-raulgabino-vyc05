"use client"

import { useCallback } from "react"
import type { RouteData } from "@/lib/types"

interface ShareData {
  title: string
  text: string
  url: string
}

export function useShare() {
  const shareRoute = useCallback(async (route: RouteData) => {
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://ycv-play.vercel.app"}/route/${route.slug}`

    const shareData: ShareData = {
      title: route.article?.title || `Ruta ${route.vibe} en ${route.city}`,
      text: `¡Mira esta ruta ${route.vibe} que encontré! ${route.places.map((p) => p.name).join(", ")}`,
      url: shareUrl,
    }

    // Check if Web Share API is available
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        return { success: true, method: "native" }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return { success: false, error: "User cancelled share" }
        }
        console.error("Error sharing:", error)
      }
    }

    // Fallback: Copy to clipboard
    try {
      const textToShare = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
      await navigator.clipboard.writeText(textToShare)
      return { success: true, method: "clipboard" }
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      return { success: false, error: "Failed to copy to clipboard" }
    }
  }, [])

  const sharePlace = useCallback(async (place: { name: string; description?: string; tagline?: string }) => {
    const shareData: ShareData = {
      title: `${place.name} - YourCityVibes`,
      text: place.tagline || place.description || `¡Descubre ${place.name}!`,
      url: process.env.NEXT_PUBLIC_APP_URL || "https://ycv-play.vercel.app",
    }

    // Check if Web Share API is available
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        return { success: true, method: "native" }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return { success: false, error: "User cancelled share" }
        }
        console.error("Error sharing:", error)
      }
    }

    // Fallback: Copy to clipboard
    try {
      const textToShare = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
      await navigator.clipboard.writeText(textToShare)
      return { success: true, method: "clipboard" }
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      return { success: false, error: "Failed to copy to clipboard" }
    }
  }, [])

  return { shareRoute, sharePlace }
}
