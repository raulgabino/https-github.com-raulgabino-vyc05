"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Place } from "@/lib/types"

interface PlaceCardProps {
  place: Place & { tagline?: string }
  onClick?: () => void
}

export function PlaceCard({ place, onClick }: PlaceCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-card border-border"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-foreground line-clamp-1">{place.name}</CardTitle>
          <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
            {place.category}
          </Badge>
        </div>
        {place.tagline && (
          <CardDescription className="text-sm text-muted-foreground font-medium italic">
            {place.tagline}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">{place.description}</p>

        {place.tags && place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {place.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-2 py-0.5 bg-background border-border text-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
