"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"

interface Vibe {
  id: string
  v: number[]
  tags: string[]
  desc: string
}

interface VibeSelectorProps {
  selectedVibe?: string
  onVibeSelect: (vibe: string) => void
  vibes: Vibe[]
}

const TRENDING_VIBES = [
  "Fiesta",
  "Relax",
  "MoodBooster",
  "Romántico",
  "Foodie",
  "Alternativo",
  "Aventurero",
  "Cultural",
  "Pet-Friendly",
  "Shopaholic",
  "Techie",
  "Artsy",
]

export function VibeSelector({ selectedVibe, onVibeSelect, vibes }: VibeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [matches, setMatches] = useState<Vibe[]>([])
  const [showMatches, setShowMatches] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        const filtered = vibes
          .filter(
            (vibe) =>
              vibe.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              vibe.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
              vibe.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
          )
          .slice(0, 6)
        setMatches(filtered)
        setShowMatches(true)
      } else {
        setMatches([])
        setShowMatches(false)
      }
    }, 300)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [searchQuery, vibes])

  const handleTrendingClick = (vibe: string) => {
    onVibeSelect(vibe)
    setSearchQuery("")
    setShowMatches(false)
  }

  const handleMatchSelect = (vibe: Vibe) => {
    onVibeSelect(vibe.id)
    setSearchQuery(vibe.id)
    setShowMatches(false)
    inputRef.current?.blur()
  }

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // Fallback: usar texto libre para LLM routing
      onVibeSelect(searchQuery.trim())
      setShowMatches(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Trending Vibes Chips */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Trending Vibes</h3>
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {TRENDING_VIBES.map((vibe) => (
              <Button
                key={vibe}
                variant={selectedVibe === vibe ? "default" : "outline"}
                size="sm"
                onClick={() => handleTrendingClick(vibe)}
                className={`whitespace-nowrap flex-shrink-0 ${selectedVibe === vibe ? "bg-primary/80 text-white" : ""}`}
              >
                {vibe}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Input
              ref={inputRef}
              placeholder="Busca entre 450+ vibes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
              className="pr-8"
            />
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button onClick={handleSearchSubmit} size="sm">
            Buscar
          </Button>
        </div>

        {/* Autocomplete Matches */}
        {showMatches && matches.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg">
            <div className="p-2 space-y-1">
              {matches.map((vibe) => (
                <div
                  key={vibe.id}
                  onClick={() => handleMatchSelect(vibe)}
                  className="p-2 rounded-sm hover:bg-accent cursor-pointer"
                >
                  <div className="font-medium text-sm">{vibe.id}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{vibe.desc}</div>
                  <div className="flex gap-1 mt-1">
                    {vibe.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
