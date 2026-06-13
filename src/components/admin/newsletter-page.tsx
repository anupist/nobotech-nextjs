'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Download, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface Subscriber {
  id: string
  email: string
  isActive: boolean
  createdAt: string
}

export function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/newsletter')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setSubscribers(data.data || [])
        }
      } else {
        setSubscribers([])
      }
    } catch {
      setSubscribers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  const handleExport = useCallback(() => {
    const filtered = subscribers.filter((s) =>
      s.email.toLowerCase().includes(search.toLowerCase())
    )
    const csv = [
      'Email,Active,Subscribed Date',
      ...filtered.map((s) => `${s.email},${s.isActive},${new Date(s.createdAt).toLocaleDateString()}`),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subscribers.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Subscribers exported')
  }, [subscribers, search])

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = subscribers.filter((s) => s.isActive).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Newsletter</h1>
          <p className="text-sm text-muted-foreground">Manage newsletter subscribers</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-full bg-emerald-50">
              <Mail className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Subscribers</p>
              <p className="text-2xl font-bold">{subscribers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-full bg-blue-50">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-full bg-gray-50">
              <Mail className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold">{subscribers.length - activeCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subscribers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscribed Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No subscribers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscribers.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium text-sm">{sub.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={sub.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}>
                          {sub.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table></div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
