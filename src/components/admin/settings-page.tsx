'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Save, Plus, Pencil, Trash2, Truck } from 'lucide-react'
import { MediaPickerButton } from '@/components/shared/media-picker-button'

type Settings = Record<string, string>

interface ShippingMethod {
  id: string
  name: string
  cost: number
  freeAbove: number | null
  isActive: boolean
  sortOrder: number
}

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [shippingLoading, setShippingLoading] = useState(true)
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false)
  const [shippingDeleteId, setShippingDeleteId] = useState<string | null>(null)
  const [shippingEditing, setShippingEditing] = useState<ShippingMethod | null>(null)
  const [formName, setFormName] = useState('')
  const [formCost, setFormCost] = useState('')
  const [formFreeAbove, setFormFreeAbove] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)
  const [formSortOrder, setFormSortOrder] = useState('0')

  const fetchShippingMethods = useCallback(async () => {
    try {
      setShippingLoading(true)
      const res = await fetch('/api/admin/shipping-methods')
      const data = await res.json()
      if (data.success) {
        setShippingMethods(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch shipping methods:', error)
    } finally {
      setShippingLoading(false)
    }
  }, [])

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.success) {
        setSettings(data.data || {})
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
    fetchShippingMethods()
  }, [fetchSettings, fetchShippingMethods])

  const openCreateShippingDialog = useCallback(() => {
    setShippingEditing(null)
    setFormName('')
    setFormCost('')
    setFormFreeAbove('')
    setFormIsActive(true)
    setFormSortOrder('0')
    setShippingDialogOpen(true)
  }, [])

  const openEditShippingDialog = useCallback((method: ShippingMethod) => {
    setShippingEditing(method)
    setFormName(method.name)
    setFormCost(String(method.cost))
    setFormFreeAbove(method.freeAbove === null ? '' : String(method.freeAbove))
    setFormIsActive(method.isActive)
    setFormSortOrder(String(method.sortOrder))
    setShippingDialogOpen(true)
  }, [])

  const handleSaveShippingMethod = useCallback(async () => {
    if (!formName.trim()) {
      toast.error('Shipping method name is required')
      return
    }

    try {
      const payload = {
        ...(shippingEditing ? { id: shippingEditing.id } : {}),
        name: formName.trim(),
        cost: parseFloat(formCost) || 0,
        freeAbove: formFreeAbove === '' ? null : parseFloat(formFreeAbove) || 0,
        isActive: formIsActive,
        sortOrder: parseInt(formSortOrder) || 0,
      }

      const res = await fetch('/api/admin/shipping-methods', {
        method: shippingEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(shippingEditing ? 'Shipping method updated' : 'Shipping method created')
        setShippingDialogOpen(false)
        fetchShippingMethods()
      } else {
        toast.error(data.error || 'Failed to save shipping method')
      }
    } catch {
      toast.error('Failed to save shipping method')
    }
  }, [shippingEditing, formName, formCost, formFreeAbove, formIsActive, formSortOrder, fetchShippingMethods])

  const handleDeleteShippingMethod = useCallback(async () => {
    if (!shippingDeleteId) return
    try {
      const res = await fetch(`/api/admin/shipping-methods?id=${shippingDeleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Shipping method deleted')
        fetchShippingMethods()
      } else {
        toast.error(data.error || 'Failed to delete shipping method')
      }
    } catch {
      toast.error('Failed to delete shipping method')
    } finally {
      setShippingDeleteId(null)
    }
  }, [shippingDeleteId, fetchShippingMethods])

  const updateSetting = useCallback((key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  const saveGroup = useCallback(async (group: string) => {
    try {
      setSaving(true)
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group, settings }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Settings saved successfully')
      } else {
        toast.error(data.error || 'Failed to save settings')
      }
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }, [settings])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage store settings</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input
                  value={settings.site_name || ''}
                  onChange={(e) => updateSetting('site_name', e.target.value)}
                  placeholder="My Store"
                />
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <MediaPickerButton
                  value={settings.site_logo || ''}
                  onChange={(url) => updateSetting('site_logo', url)}
                  folder="general"
                  label="Choose Logo"
                />
              </div>
              <div className="space-y-2">
                <Label>Favicon</Label>
                <MediaPickerButton
                  value={settings.site_favicon || ''}
                  onChange={(url) => updateSetting('site_favicon', url)}
                  folder="general"
                  label="Choose Favicon"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input
                  value={settings.currency || ''}
                  onChange={(e) => updateSetting('currency', e.target.value)}
                  placeholder="USD"
                />
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input
                  value={settings.site_tagline || ''}
                  onChange={(e) => updateSetting('site_tagline', e.target.value)}
                  placeholder="Your One-Stop Online Shop"
                />
              </div>
              <div className="space-y-2">
                <Label>Slogan</Label>
                <Input
                  value={settings.site_slogan || ''}
                  onChange={(e) => updateSetting('site_slogan', e.target.value)}
                  placeholder="Discover Amazing Products"
                />
              </div>
              <div className="space-y-2">
                <Label>Site Description</Label>
                <Input
                  value={settings.site_description || ''}
                  onChange={(e) => updateSetting('site_description', e.target.value)}
                  placeholder="Describe your store for search engines"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency Symbol</Label>
                <Input
                  value={settings.currency_symbol || ''}
                  onChange={(e) => updateSetting('currency_symbol', e.target.value)}
                  placeholder="$"
                />
              </div>

              <Separator />
              <h3 className="text-sm font-semibold">Newsletter Popup</h3>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Enable Newsletter Popup</p>
                  <p className="text-sm text-muted-foreground">Show newsletter subscription popup</p>
                </div>
                <Switch
                  checked={settings.newsletter_popup_active !== 'false'}
                  onCheckedChange={(v) => updateSetting('newsletter_popup_active', v ? 'true' : 'false')}
                />
              </div>
              <div className="space-y-2">
                <Label>Discount Code</Label>
                <Input
                  value={settings.newsletter_popup_discount_code || ''}
                  onChange={(e) => updateSetting('newsletter_popup_discount_code', e.target.value)}
                  placeholder="WELCOME10"
                />
              </div>
              <div className="space-y-2">
                <Label>Discount Text</Label>
                <Input
                  value={settings.newsletter_popup_discount_text || ''}
                  onChange={(e) => updateSetting('newsletter_popup_discount_text', e.target.value)}
                  placeholder="Get 10% OFF"
                />
              </div>
              <div className="space-y-2">
                <Label>Popup Delay (ms)</Label>
                <Input
                  type="number"
                  value={settings.newsletter_popup_delay_ms || '30000'}
                  onChange={(e) => updateSetting('newsletter_popup_delay_ms', e.target.value)}
                />
              </div>

              <Separator />
              <h3 className="text-sm font-semibold">Cookie Consent</h3>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Enable Cookie Consent</p>
                  <p className="text-sm text-muted-foreground">Show cookie consent popup to visitors</p>
                </div>
                <Switch
                  checked={settings.cookie_consent_active !== 'false'}
                  onCheckedChange={(v) => updateSetting('cookie_consent_active', v ? 'true' : 'false')}
                />
              </div>

              <Separator />
              <h3 className="text-sm font-semibold">Download Our App</h3>
              <div className="space-y-2">
                <Label>iOS App Store URL</Label>
                <Input
                  value={settings.download_app_ios_url || ''}
                  onChange={(e) => updateSetting('download_app_ios_url', e.target.value)}
                  placeholder="https://apps.apple.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Android Google Play URL</Label>
                <Input
                  value={settings.download_app_android_url || ''}
                  onChange={(e) => updateSetting('download_app_android_url', e.target.value)}
                  placeholder="https://play.google.com/..."
                />
              </div>

              <Button onClick={() => saveGroup('general')} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save General Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={settings.contact_phone || ''}
                  onChange={(e) => updateSetting('contact_phone', e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={settings.contact_email || ''}
                  onChange={(e) => updateSetting('contact_email', e.target.value)}
                  placeholder="support@mystore.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={settings.contact_address || ''}
                  onChange={(e) => updateSetting('contact_address', e.target.value)}
                  placeholder="123 Main St, City, Country"
                />
              </div>
              <Button onClick={() => saveGroup('contact')} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Contact Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input
                  value={settings.social_facebook || ''}
                  onChange={(e) => updateSetting('social_facebook', e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input
                  value={settings.social_instagram || ''}
                  onChange={(e) => updateSetting('social_instagram', e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>YouTube</Label>
                <Input
                  value={settings.social_youtube || ''}
                  onChange={(e) => updateSetting('social_youtube', e.target.value)}
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Twitter / X</Label>
                <Input
                  value={settings.social_twitter || ''}
                  onChange={(e) => updateSetting('social_twitter', e.target.value)}
                  placeholder="https://twitter.com/..."
                />
              </div>
              <Button onClick={() => saveGroup('social')} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Social Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-muted-foreground">Accept cash payment on delivery</p>
                </div>
                <Switch
                  checked={settings.payment_cod === 'true'}
                  onCheckedChange={(v) => updateSetting('payment_cod', v ? 'true' : 'false')}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Stripe</p>
                  <p className="text-sm text-muted-foreground">Accept credit card payments via Stripe</p>
                </div>
                <Switch
                  checked={settings.payment_stripe === 'true'}
                  onCheckedChange={(v) => updateSetting('payment_stripe', v ? 'true' : 'false')}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Stripe Public Key</Label>
                <Input
                  value={settings.stripe_public_key || ''}
                  onChange={(e) => updateSetting('stripe_public_key', e.target.value)}
                  placeholder="pk_..."
                />
              </div>
              <Button onClick={() => saveGroup('payment')} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Payment Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Shipping Methods</CardTitle>
              <Button onClick={openCreateShippingDialog} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" /> Add Shipping Method
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Create the shipping methods shown at checkout. Each method has a rate and an optional
                free-shipping threshold.
              </p>

              {shippingLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : shippingMethods.length === 0 ? (
                <div className="p-6 border rounded-lg text-center text-muted-foreground text-sm">
                  No shipping methods yet. Click &quot;Add Shipping Method&quot; to create one.
                </div>
              ) : (
                <div className="space-y-2">
                  {shippingMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-3 border rounded-lg gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${method.isActive ? 'bg-emerald-100' : 'bg-muted'}`}>
                          <Truck className={`h-4 w-4 ${method.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate flex items-center gap-2">
                            {method.name}
                            {!method.isActive && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {method.freeAbove !== null ? (
                              <>Cost {method.cost} · Free above {method.freeAbove}</>
                            ) : (
                              <>Cost {method.cost}</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Switch
                          checked={method.isActive}
                          onCheckedChange={(v) => {
                            fetch('/api/admin/shipping-methods', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: method.id, isActive: v }),
                            })
                              .then((res) => res.json())
                              .then((data) => {
                                if (data.success) {
                                  toast.success(v ? 'Shipping method enabled' : 'Shipping method disabled')
                                  fetchShippingMethods()
                                }
                              })
                              .catch(() => toast.error('Failed to update shipping method'))
                          }}
                        />
                        <Button variant="ghost" size="icon" onClick={() => openEditShippingDialog(method)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setShippingDeleteId(method.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete shipping method</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{method.name}&quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteShippingMethod} className="bg-red-600 hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Dialog open={shippingDialogOpen} onOpenChange={setShippingDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{shippingEditing ? 'Edit Shipping Method' : 'Add Shipping Method'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Inside Dhaka"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cost (৳) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formCost}
                          onChange={(e) => setFormCost(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Free Shipping Above</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formFreeAbove}
                          onChange={(e) => setFormFreeAbove(e.target.value)}
                          placeholder="Leave empty for none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Sort Order</Label>
                        <Input
                          type="number"
                          value={formSortOrder}
                          onChange={(e) => setFormSortOrder(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center justify-between w-full p-3 border rounded-lg">
                          <div>
                            <p className="text-sm font-medium">Active</p>
                            <p className="text-xs text-muted-foreground">Show at checkout</p>
                          </div>
                          <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleSaveShippingMethod} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Save className="h-4 w-4 mr-2" />
                      {shippingEditing ? 'Update Shipping Method' : 'Create Shipping Method'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax */}
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tax Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Enable Tax</p>
                  <p className="text-sm text-muted-foreground">Apply tax to orders when enabled</p>
                </div>
                <Switch
                  checked={settings.tax_enabled === 'true'}
                  onCheckedChange={(v) => updateSetting('tax_enabled', v ? 'true' : 'false')}
                />
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.tax_rate || ''}
                  onChange={(e) => updateSetting('tax_rate', e.target.value)}
                  placeholder="8"
                />
              </div>
              <Button onClick={() => saveGroup('tax')} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Tax Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email / SMTP */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SMTP Email Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Configure SMTP settings for sending transactional emails (contact form submissions, order notifications, etc.)</p>
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input
                  value={settings.smtp_host || ''}
                  onChange={(e) => updateSetting('smtp_host', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label>SMTP Port</Label>
                <Input
                  value={settings.smtp_port || ''}
                  onChange={(e) => updateSetting('smtp_port', e.target.value)}
                  placeholder="587"
                />
              </div>
              <div className="space-y-2">
                <Label>SMTP Username</Label>
                <Input
                  value={settings.smtp_user || ''}
                  onChange={(e) => updateSetting('smtp_user', e.target.value)}
                  placeholder="user@gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label>SMTP Password</Label>
                <Input
                  type="password"
                  value={settings.smtp_pass || ''}
                  onChange={(e) => updateSetting('smtp_pass', e.target.value)}
                  placeholder="app password"
                />
              </div>
              <div className="space-y-2">
                <Label>From Email</Label>
                <Input
                  value={settings.smtp_from_email || ''}
                  onChange={(e) => updateSetting('smtp_from_email', e.target.value)}
                  placeholder="noreply@mystore.com"
                />
              </div>
              <div className="space-y-2">
                <Label>From Name</Label>
                <Input
                  value={settings.smtp_from_name || ''}
                  onChange={(e) => updateSetting('smtp_from_name', e.target.value)}
                  placeholder="My Store"
                />
              </div>
              <Button onClick={() => saveGroup('smtp')} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Email Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO & Meta Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">Home Page</h3>
                <div className="space-y-3 pl-2 border-l-2 border-emerald-200">
                  <div className="space-y-2">
                    <Label>Meta Title</Label>
                    <Input
                      value={settings.seo_meta_title || ''}
                      onChange={(e) => updateSetting('seo_meta_title', e.target.value)}
                      placeholder="ShopHub - Your One-Stop Online Shop"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Description</Label>
                    <Input
                      value={settings.seo_meta_description || ''}
                      onChange={(e) => updateSetting('seo_meta_description', e.target.value)}
                      placeholder="Discover amazing products at great prices..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Keywords</Label>
                    <Input
                      value={settings.seo_meta_keywords || ''}
                      onChange={(e) => updateSetting('seo_meta_keywords', e.target.value)}
                      placeholder="e-commerce, online shopping, fashion, electronics"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Section Meta</h3>
                <p className="text-xs text-muted-foreground mb-4">Default meta for sections that don't have their own meta fields (product, page, blog posts use their own).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'meta_products', label: 'Products' },
                    { key: 'meta_cart', label: 'Cart' },
                    { key: 'meta_checkout', label: 'Checkout' },
                    { key: 'meta_auth', label: 'Auth (Login/Register)' },
                    { key: 'meta_account', label: 'My Account' },
                    { key: 'meta_wishlist', label: 'Wishlist' },
                    { key: 'meta_compare', label: 'Compare' },
                    { key: 'meta_search', label: 'Search' },
                    { key: 'meta_blog', label: 'Blog' },
                    { key: 'meta_contact', label: 'Contact' },
                    { key: 'meta_faq', label: 'FAQ' },
                    { key: 'meta_about', label: 'About Us' },
                    { key: 'meta_shipping', label: 'Shipping' },
                    { key: 'meta_deals', label: 'Deals' },
                    { key: 'meta_gift_cards', label: 'Gift Cards' },
                    { key: 'meta_return_request', label: 'Return Request' },
                    { key: 'meta_order_detail', label: 'Order Detail' },
                    { key: 'meta_order_tracking', label: 'Order Tracking' },
                    { key: 'meta_category', label: 'Category' },
                    { key: 'meta_brand', label: 'Brand' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <Input
                        value={settings[`${key}_title`] || ''}
                        onChange={(e) => updateSetting(`${key}_title`, e.target.value)}
                        placeholder={`${label} title...`}
                      />
                      <Input
                        value={settings[`${key}_description`] || ''}
                        onChange={(e) => updateSetting(`${key}_description`, e.target.value)}
                        placeholder={`${label} description...`}
                        className="text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={() => saveGroup('seo')} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save SEO Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
