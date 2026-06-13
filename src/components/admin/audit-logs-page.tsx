'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ClipboardList } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  module: string
  details: string | null
  ip: string | null
  createdAt: string
  user: { name: string; email: string } | null
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [moduleFilter, setModuleFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ limit: '50' })
      if (moduleFilter && moduleFilter !== 'all') params.set('module', moduleFilter)
      if (actionFilter && actionFilter !== 'all') params.set('action', actionFilter)

      const res = await fetch(`/api/admin/audit-logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setLogs(data.data || [])
        }
      } else {
        setLogs([])
      }
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [moduleFilter, actionFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const actionColors: Record<string, string> = {
    create: 'bg-emerald-100 text-emerald-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
    login: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Track system activity</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="products">Products</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
                <SelectItem value="categories">Categories</SelectItem>
                <SelectItem value="brands">Brands</SelectItem>
                <SelectItem value="coupons">Coupons</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
              </SelectContent>
            </Select>
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
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead className="hidden lg:table-cell">Details</TableHead>
                  <TableHead className="hidden md:table-cell">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.user?.name || 'System'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`capitalize ${actionColors[log.action] || ''}`}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm capitalize">{log.module}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-64 truncate">
                      {log.details || '-'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs font-mono text-muted-foreground">
                      {log.ip || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
