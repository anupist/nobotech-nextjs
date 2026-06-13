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
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { MediaPickerButton } from '@/components/shared/media-picker-button'

type Settings = Record<string, string>

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
  }, [fetchSettings])

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
                <Label>Currency Symbol</Label>
                <Input
                  value={settings.currency_symbol || ''}
                  onChange={(e) => updateSetting('currency_symbol', e.target.value)}
                  placeholder="$"
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
            <CardHeader>
              <CardTitle className="text-base">Shipping Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Shipping Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.shipping_cost || ''}
                  onChange={(e) => updateSetting('shipping_cost', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Free Shipping Above</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.free_shipping_above || ''}
                  onChange={(e) => updateSetting('free_shipping_above', e.target.value)}
                  placeholder="100.00"
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-sm text-muted-foreground">Enable free shipping on all orders</p>
                </div>
                <Switch
                  checked={settings.shipping_free === 'true'}
                  onCheckedChange={(v) => updateSetting('shipping_free', v ? 'true' : 'false')}
                />
              </div>
              <Button onClick={() => saveGroup('shipping')} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Shipping Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
