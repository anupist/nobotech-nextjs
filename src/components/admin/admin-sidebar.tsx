'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavStore, type AdminPage } from '@/stores/nav-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  BarChart3,
  Package,
  FolderTree,
  Tag,
  ShoppingCart,
  Ticket,
  Zap,
  Image as ImageIcon,
  ImagePlus,
  FileText,
  File,
  Mail,
  Users,
  Star,
  Settings,
  Warehouse,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Store,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
  MessageSquareQuote,
  Megaphone,
  Menu,
  Grid3X3,
  Truck,
  CreditCard,
  HelpCircle,
  Info,
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { motion } from 'framer-motion'

interface NavItem {
  label: string
  page: AdminPage
  icon: React.ElementType
  badge?: number
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroupsBase: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
      { label: 'Analytics', page: 'analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { label: 'Products', page: 'products', icon: Package },
      { label: 'Categories', page: 'categories', icon: FolderTree },
      { label: 'Brands', page: 'brands', icon: Tag },
    ],
  },
  {
    title: 'Sales',
    items: [
      { label: 'Orders', page: 'orders', icon: ShoppingCart },
      { label: 'Coupons', page: 'coupons', icon: Ticket },
      { label: 'Flash Sales', page: 'flash-sales', icon: Zap },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Media', page: 'media', icon: ImagePlus },
      { label: 'Banners', page: 'banners', icon: ImageIcon },
      { label: 'Blog', page: 'blog', icon: FileText },
      { label: 'Pages', page: 'pages', icon: File },
      { label: 'Testimonials', page: 'testimonials', icon: MessageSquareQuote },
      { label: 'FAQ', page: 'faq', icon: HelpCircle },
      { label: 'About Sections', page: 'about-sections', icon: Info },
      { label: 'Newsletter', page: 'newsletter', icon: Mail },
    ],
  },
  {
    title: 'Appearance',
    items: [
      { label: 'Announcements', page: 'announcements', icon: Megaphone },
      { label: 'Navigation', page: 'navigation', icon: Menu },
      { label: 'Footer Widgets', page: 'footer-widgets', icon: Grid3X3 },
      { label: 'Features', page: 'features', icon: Truck },
      { label: 'Payment Methods', page: 'payment-methods', icon: CreditCard },
    ],
  },
  {
    title: 'Customers',
    items: [
      { label: 'Customers', page: 'customers', icon: Users },
      { label: 'Reviews', page: 'reviews', icon: Star },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', page: 'settings', icon: Settings },
      { label: 'Inventory', page: 'inventory', icon: Warehouse },
      { label: 'Audit Logs', page: 'audit-logs', icon: ClipboardList },
    ],
  },
]

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const { adminPage, navigateAdmin } = useNavStore()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(navGroupsBase.map((g) => [g.title, true]))
  )
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [adminLogo, setAdminLogo] = useState('')
  const [siteName, setSiteName] = useState('KinleyMart')

  // Fetch admin logo + site name for branding
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setAdminLogo(res.data.admin_logo || res.data.site_logo || '')
          setSiteName(res.data.site_name || 'KinleyMart')
        }
      })
      .catch(() => {})
  }, [])

  // Fetch low stock count for badge
  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const res = await fetch('/api/products?limit=100')
        const data = await res.json()
        if (data.success) {
          const count = (data.data as Array<{ inventory?: { quantity: number } | null }>).filter(
            (p) => p.inventory && p.inventory.quantity < 10
          ).length
          setLowStockCount(count)
        }
      } catch {
        // silently fail
      }
    }
    fetchLowStock()
  }, [])

  const toggleGroup = useCallback((title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }))
  }, [])

  // Build nav groups with dynamic low stock badge
  const navGroups = useMemo(() => {
    return navGroupsBase.map((group) => ({
      ...group,
      items: group.items.map((item) =>
        item.page === 'inventory' && lowStockCount > 0
          ? { ...item, badge: lowStockCount }
          : item
      ),
    }))
  }, [lowStockCount])

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'relative flex flex-col h-full bg-[#0D1B3D] dark:bg-[#080E21] text-white transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-[300px]'
        )}
      >
        {/* Gradient border on right side */}
        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-emerald-400 via-teal-500 to-emerald-600 opacity-50" />

        {/* Brand Logo Header */}
        <div className={cn(
          'flex items-center border-b border-slate-700/50 transition-all duration-300',
          collapsed ? 'justify-center py-3' : 'justify-center px-4 py-4'
        )}>
          {adminLogo ? (
            <img
              src={adminLogo}
              alt={siteName}
              className={cn(
                'object-contain',
                collapsed ? 'h-8 w-8' : 'w-[250px] h-[80px]'
              )}
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#FF6600] to-[#FF8A33] flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">K</span>
            </div>
          )}
        </div>

        {/* Back to Store Button */}
        <div className={cn(
          'border-b border-slate-700/50',
          collapsed ? 'py-2 px-2' : 'py-2 px-3'
        )}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.location.href = '/'}
                  className="w-full text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/50 h-8"
                >
                  <Store className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                Back to Store
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/'}
              className="w-full text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/50 justify-start gap-2"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs font-medium">Back to Store</span>
              <Store className="h-3 w-3 ml-auto opacity-50" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 min-h-0 admin-sidebar-scroll">
          <nav className="py-2">
            {navGroups.map((group, groupIdx) => (
              <Collapsible
                key={group.title}
                open={collapsed ? false : (openGroups[group.title] ?? true)}
                onOpenChange={() => toggleGroup(group.title)}
              >
                {!collapsed && (
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center justify-between w-full px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">
                      {group.title}
                      <ChevronRight
                        className={cn(
                          'h-3 w-3 transition-transform duration-200',
                          openGroups[group.title] ? 'rotate-90' : ''
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                )}
                {collapsed && groupIdx > 0 && (
                  <div className="mx-3 my-1.5 border-t border-slate-700/40" />
                )}
                <CollapsibleContent>
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = adminPage === item.page
                    const isHovered = hoveredItem === item.page

                    const navButton = (
                      <motion.button
                        key={item.page}
                        onClick={() => navigateAdmin(item.page)}
                        onMouseEnter={() => setHoveredItem(item.page)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={cn(
                          'relative flex items-center gap-3 w-full text-sm transition-all duration-200',
                          isActive
                            ? 'text-emerald-400'
                            : 'text-slate-400 hover:text-white hover:bg-emerald-950/30',
                          collapsed ? 'justify-center px-2 py-2.5 mx-1 rounded-lg' : 'px-4 py-2'
                        )}
                        whileHover={{ x: collapsed ? 0 : 3 }}
                        transition={{ duration: 0.15 }}
                      >
                        {/* Active gradient highlight bar */}
                        {isActive && !collapsed && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 to-teal-500"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}
                        {/* Hover left border animation with emerald gradient tint */}
                        {!isActive && !collapsed && isHovered && (
                          <motion.div
                            initial={{ scaleY: 0, opacity: 0 }}
                            animate={{ scaleY: 1, opacity: 1 }}
                            exit={{ scaleY: 0, opacity: 0 }}
                            className="absolute left-0 top-1 bottom-1 w-0.5 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full"
                            transition={{ duration: 0.15 }}
                          />
                        )}
                        {/* Subtle hover gradient background overlay */}
                        {!isActive && !collapsed && isHovered && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-r-lg pointer-events-none"
                            transition={{ duration: 0.15 }}
                          />
                        )}
                        {isActive && collapsed && (
                          <motion.div
                            layoutId="activeNavCollapsed"
                            className="absolute inset-0 bg-emerald-600/15 rounded-lg border border-emerald-500/20"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}
                        <Icon className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive ? 'text-emerald-400' : ''
                        )} />
                        {!collapsed && (
                          <>
                            <span className={cn('flex-1 text-left', isActive && 'font-medium')}>{item.label}</span>
                          </> 
                        )}
                      </motion.button>
                    )

                    if (collapsed) {
                      return (
                        <Tooltip key={item.page}>
                          <TooltipTrigger asChild>
                            {navButton}
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                            {item.label}
                            {item.badge ? ` (${item.badge})` : ''}
                          </TooltipContent>
                        </Tooltip>
                      )
                    }

                    return navButton
                  })}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </nav>
        </ScrollArea>

        <Separator className="bg-slate-700/50" />

        {/* Collapse Toggle at bottom */}
        <div className="p-3">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="w-full text-slate-400 hover:text-white hover:bg-slate-800 h-8"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                Expand sidebar
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="w-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <PanelLeftClose className="h-4 w-4" />
              <span className="ml-2 text-xs">Collapse</span>
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
