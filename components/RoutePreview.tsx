"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, ExternalLink } from "lucide-react"
import type { RouteData } from "@/lib/types"

interface RoutePreviewProps {
  route: RouteData
  onReadArticle: () => void
  onShare?: () => void
}

export function RoutePreview({ route, onReadArticle, onShare }: RoutePreviewProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Ruta {route.vibe}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {route.places.length} lugares • {route.city}
            </p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            #{route.slug}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Places List */}
        <div className="space-y-3">
          {route.places.map((place, index) => (
            <div key={place.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                {index + 1}
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="font-medium text-foreground truncate">{place.name}</h4>
                <p className="text-xs text-muted-foreground">{place.category}</p>
              </div>
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Article CTA */}
        {route.article && (
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-lg border border-border">
            <h4 className="font-semibold text-foreground mb-2">{route.article.title}</h4>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {route.article.content.substring(0, 120)}...
            </p>
            <Button onClick={onReadArticle} variant="default" size="sm" className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              Leer artículo completo
            </Button>
          </div>
        )}

        {/* Share Button */}
        {onShare && (
          <Button onClick={onShare} variant="outline" size="sm" className="w-full bg-transparent">
            Compartir ruta
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
