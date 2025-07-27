"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share, X, MapPin } from "lucide-react"
import ReactMarkdown from "react-markdown"
import type { RouteData } from "@/lib/types"

interface ArticleSheetProps {
  route: RouteData | null
  isOpen: boolean
  onClose: () => void
  onShare?: () => void
}

export function ArticleSheet({ route, isOpen, onClose, onShare }: ArticleSheetProps) {
  if (!route?.article) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-background">
        <SheetHeader className="text-left space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-grow pr-4">
              <SheetTitle className="text-xl font-bold text-foreground leading-tight">{route.article.title}</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-2">
                Una ruta {route.vibe} por {route.city}
              </SheetDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0 p-1 h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              #{route.slug}
            </Badge>
            <Badge variant="outline" className="bg-background border-border">
              {route.places.length} lugares
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Article Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown className="text-foreground leading-relaxed">{route.article.content}</ReactMarkdown>
          </div>

          {/* Places Summary */}
          <div className="border-t border-border pt-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Lugares de la ruta
            </h3>
            <div className="space-y-3">
              {route.places.map((place, index) => (
                <div key={place.id} className="flex gap-3 p-3 rounded-lg bg-secondary/10 border border-border">
                  <div className="flex-shrink-0 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-foreground">{place.name}</h4>
                    <p className="text-xs text-muted-foreground">{place.category}</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{place.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share Button */}
          {onShare && (
            <div className="border-t border-border pt-6">
              <Button onClick={onShare} className="w-full" size="lg">
                <Share className="mr-2 h-4 w-4" />
                Compartir esta ruta
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
