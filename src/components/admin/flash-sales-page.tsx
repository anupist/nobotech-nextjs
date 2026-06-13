'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Zap } from 'lucide-react'

export function FlashSalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Flash Sales</h1>
          <p className="text-sm text-muted-foreground">Manage time-limited sale events</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Flash Sale
        </Button>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Zap className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No flash sales created yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create a flash sale to offer time-limited deals</p>
        </CardContent>
      </Card>
    </div>
  )
}
