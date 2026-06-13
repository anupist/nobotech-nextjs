'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ImageIcon, X } from 'lucide-react'
import { MediaGallery } from '@/components/shared/media-gallery'
import { cn } from '@/lib/utils'

interface MediaPickerButtonProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  previewClassName?: string
}

export function MediaPickerButton({
  value,
  onChange,
  folder = 'general',
  label = 'Choose Image',
  previewClassName,
}: MediaPickerButtonProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)

  const handleSelect = (urls: string[]) => {
    if (urls.length > 0) {
      onChange(urls[0])
    }
  }

  const handleRemove = () => {
    onChange('')
  }

  return (
    <div className="flex items-center gap-2">
      {/* Image Preview */}
      <div
        className={cn(
          'w-10 h-10 rounded-md border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/50 shrink-0',
          previewClassName
        )}
      >
        {value ? (
          <img
            src={value}
            alt="Selected image"
            className="w-full h-full object-cover rounded-sm"
          />
        ) : (
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Choose Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setGalleryOpen(true)}
        className="gap-1.5"
      >
        <ImageIcon className="h-3.5 w-3.5" />
        {label}
      </Button>

      {/* Remove Button */}
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-red-500"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Media Gallery Dialog */}
      <MediaGallery
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onSelect={handleSelect}
        multiple={false}
        folder={folder}
      />
    </div>
  )
}
