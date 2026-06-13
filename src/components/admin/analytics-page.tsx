'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import {
  DollarSign,
  Users,
  Package,
  Globe,
  Eye,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  BarChart3,
  MousePointerClick,
  Timer,
} from 'lucide-react'

// Demo data for Revenue Analytics
const revenueData = [
  { month: 'Jul', revenue: 18500, prevRevenue: 15200, orders: 124 },
  { month: 'Aug', revenue: 22300, prevRevenue: 18900, orders: 156 },
  { month: 'Sep', revenue: 19800, prevRevenue: 17200, orders: 138 },
  { month: 'Oct', revenue: 25400, prevRevenue: 21000, orders: 172 },
  { month: 'Nov', revenue: 28900, prevRevenue: 24600, orders: 198 },
  { month: 'Dec', revenue: 34200, prevRevenue: 27800, orders: 224 },
  { month: 'Jan', revenue: 31500, prevRevenue: 26500, orders: 208 },
  { month: 'Feb', revenue: 29800, prevRevenue: 25200, orders: 196 },
  { month: 'Mar', revenue: 36100, prevRevenue: 29800, orders: 245 },
]

// Demo data for Customer Analytics
const customerTypeData = [
  { name: 'New Customers', value: 1240, fill: '#10b981' },
  { name: 'Returning', value: 890, fill: '#14b8a6' },
]

const clvDistribution = [
  { range: '$0-50', count: 320 },
  { range: '$50-100', count: 480 },
  { range: '$100-200', count: 350 },
  { range: '$200-500', count: 210 },
  { range: '$500+', count: 85 },
]

const geoData = [
  { country: 'United States', orders: 4520, revenue: 385000, pct: 35 },
  { country: 'United Kingdom', orders: 2180, revenue: 195000, pct: 18 },
  { country: 'Germany', orders: 1560, revenue: 142000, pct: 13 },
  { country: 'Canada', orders: 1240, revenue: 108000, pct: 10 },
  { country: 'Australia', orders: 980, revenue: 87000, pct: 8 },
]

// Demo data for Product Analytics
const topProductsByRevenue = [
  { name: 'Premium Headphones', revenue: 45200 },
  { name: 'Smart Watch Pro', revenue: 38500 },
  { name: 'Wireless Earbuds', revenue: 32100 },
  { name: 'Laptop Stand', revenue: 24800 },
  { name: 'Mechanical Keyboard', revenue: 21500 },
  { name: 'USB-C Hub', revenue: 18200 },
  { name: 'Monitor Light Bar', revenue: 15600 },
  { name: 'Desk Mat XL', revenue: 12400 },
  { name: 'Webcam HD', revenue: 10800 },
  { name: 'Cable Organizer', revenue: 8500 },
]

const categoryPerformance = [
  { category: 'Electronics', revenue: 125000, growth: 15.2 },
  { category: 'Clothing', revenue: 89000, growth: 8.4 },
  { category: 'Home & Garden', revenue: 67000, growth: -2.1 },
  { category: 'Sports', revenue: 52000, growth: 12.8 },
  { category: 'Books', revenue: 34000, growth: -5.3 },
]

const conversionFunnel = [
  { stage: 'Page Views', value: 45200, pct: 100 },
  { stage: 'Product Views', value: 28400, pct: 62.8 },
  { stage: 'Add to Cart', value: 8560, pct: 18.9 },
  { stage: 'Checkout', value: 4230, pct: 9.4 },
  { stage: 'Purchase', value: 2890, pct: 6.4 },
]

// Demo data for Traffic Analytics
const pageViewsData = [
  { date: 'Mon', views: 4200, visitors: 2800 },
  { date: 'Tue', views: 5100, visitors: 3400 },
  { date: 'Wed', views: 4800, visitors: 3200 },
  { date: 'Thu', views: 5600, visitors: 3700 },
  { date: 'Fri', views: 6200, visitors: 4100 },
  { date: 'Sat', views: 7800, visitors: 5200 },
  { date: 'Sun', views: 6500, visitors: 4300 },
]

const trafficSources = [
  { source: 'Organic Search', visits: 12450, pct: 38, fill: '#10b981' },
  { source: 'Direct', visits: 8920, pct: 27, fill: '#14b8a6' },
  { source: 'Social Media', visits: 6340, pct: 19, fill: '#0d9488' },
  { source: 'Email', visits: 3210, pct: 10, fill: '#0f766e' },
  { source: 'Referral', visits: 1780, pct: 6, fill: '#115e59' },
]

const bounceRateData = [
  { page: 'Homepage', rate: 32 },
  { page: 'Products', rate: 45 },
  { page: 'Cart', rate: 28 },
  { page: 'Checkout', rate: 18 },
  { page: 'Blog', rate: 52 },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const CHART_COLORS = ['#10b981', '#14b8a6', '#0d9488', '#0f766e', '#115e59']

export function AnalyticsPage() {
  const [revenuePeriod, setRevenuePeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  const kpiCards = useMemo(() => [
    {
      title: 'Total Revenue',
      value: '$227,500',
      change: '+14.2%',
      trend: 'up' as const,
      icon: DollarSign,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/60',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Avg Order Value',
      value: '$89.50',
      change: '+5.8%',
      trend: 'up' as const,
      icon: ShoppingCart,
      iconBg: 'bg-teal-100 dark:bg-teal-900/60',
      iconColor: 'text-teal-600 dark:text-teal-400',
    },
    {
      title: 'Revenue/Customer',
      value: '$142.30',
      change: '+3.1%',
      trend: 'up' as const,
      icon: Users,
      iconBg: 'bg-amber-100 dark:bg-amber-900/60',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Conversion Rate',
      value: '6.4%',
      change: '+0.8%',
      trend: 'up' as const,
      icon: TrendingUp,
      iconBg: 'bg-sky-100 dark:bg-sky-900/60',
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
  ], [])

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-600" />
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Detailed insights into your store performance</p>
        </div>
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0 w-fit">
          Last updated: just now
        </Badge>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <motion.div key={card.title} variants={itemVariants}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</p>
                      <p className="text-2xl font-bold mt-1.5 tracking-tight">{card.value}</p>
                      <div className="flex items-center mt-2 gap-1">
                        {card.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className={`text-xs font-semibold ${card.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {card.change}
                        </span>
                        <span className="text-[11px] text-muted-foreground">vs prev</span>
                      </div>
                    </div>
                    <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                      <Icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Revenue Analytics */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Revenue Analytics
              </CardTitle>
              <CardDescription className="mt-1">Revenue trends with previous period comparison</CardDescription>
            </div>
            <div className="flex items-center gap-1 bg-muted/50 rounded-full p-0.5">
              {(['7d', '30d', '90d', '1y'] as const).map((period) => (
                <Button
                  key={period}
                  variant={revenuePeriod === period ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-7 text-xs px-3 rounded-full ${
                    revenuePeriod === period
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setRevenuePeriod(period)}
                >
                  {period}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="prevRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number, name: string) => [
                      `$${value.toLocaleString()}`,
                      name === 'revenue' ? 'Current Period' : 'Previous Period',
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="prevRevenue"
                    stroke="#94a3b8"
                    fill="url(#prevRevGrad)"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    name="Previous Period"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fill="url(#revGrad)"
                    strokeWidth={2.5}
                    name="Current Period"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Customer Analytics */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-600" />
              Customer Analytics
            </CardTitle>
            <CardDescription>Customer segmentation and distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* New vs Returning Pie */}
              <div className="flex flex-col items-center">
                <h4 className="text-sm font-semibold mb-3">New vs Returning</h4>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {customerTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [value.toLocaleString(), 'Customers']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  {customerTypeData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CLV Distribution */}
              <div className="flex flex-col">
                <h4 className="text-sm font-semibold mb-3">Customer Lifetime Value</h4>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clvDistribution}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                      <XAxis dataKey="range" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [value, 'Customers']}
                      />
                      <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Geographic Distribution */}
              <div className="flex flex-col">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-emerald-600" />
                  Top Countries
                </h4>
                <div className="space-y-2.5 flex-1">
                  {geoData.map((item, index) => (
                    <div key={item.country} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{item.country}</span>
                        <span className="text-xs text-muted-foreground">{item.pct}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.pct}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index] || '#10b981' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Product Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Products by Revenue */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                Top 10 Products by Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsByRevenue} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis type="number" tick={{ fontSize: 10 }} className="text-muted-foreground" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" width={110} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]}>
                      {topProductsByRevenue.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Performance */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-teal-600" />
                Category Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryPerformance.map((cat, index) => (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{cat.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">${(cat.revenue / 1000).toFixed(0)}k</span>
                        <span className={`text-xs font-semibold flex items-center gap-0.5 ${cat.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {cat.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(cat.growth)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(cat.revenue / categoryPerformance[0].revenue) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index] || '#10b981' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Conversion Funnel */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3">Conversion Funnel</h4>
                <div className="space-y-2">
                  {conversionFunnel.map((stage, index) => (
                    <div key={stage.stage} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{stage.stage}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{stage.value.toLocaleString()}</span>
                          <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0 h-4 px-1">
                            {stage.pct}%
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stage.pct}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                          className={`h-5 rounded-md bg-gradient-to-r ${index < 2 ? 'from-emerald-400 to-emerald-500' : index < 4 ? 'from-emerald-500 to-teal-500' : 'from-teal-500 to-teal-600'} flex items-center justify-center`}
                          style={{ maxWidth: '100%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Traffic Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-600" />
                Page Views Over Time
              </CardTitle>
              <CardDescription>Weekly page views and unique visitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pageViewsData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [
                        value.toLocaleString(),
                        name === 'views' ? 'Page Views' : 'Unique Visitors',
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 3 }}
                      name="Page Views"
                    />
                    <Line
                      type="monotone"
                      dataKey="visitors"
                      stroke="#14b8a6"
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      dot={{ fill: '#14b8a6', r: 3 }}
                      name="Unique Visitors"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Traffic Sources + Bounce Rate */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-teal-600" />
                Traffic Sources & Bounce Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Traffic Sources Donut */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Top Sources</h4>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={trafficSources}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={55}
                          paddingAngle={3}
                          dataKey="visits"
                        >
                          {trafficSources.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [value.toLocaleString(), 'Visits']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1 mt-1">
                    {trafficSources.map((source) => (
                      <div key={source.source} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: source.fill }} />
                          <span className="text-[11px] text-muted-foreground">{source.source}</span>
                        </div>
                        <span className="text-[11px] font-medium">{source.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bounce Rate */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5 text-amber-500" />
                    Bounce Rate by Page
                  </h4>
                  <div className="space-y-3 mt-3">
                    {bounceRateData.map((item, index) => (
                      <div key={item.page} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{item.page}</span>
                          <span className={`text-xs font-semibold ${item.rate > 40 ? 'text-red-500' : item.rate > 25 ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {item.rate}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.rate}%` }}
                            transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                            className={`h-full rounded-full ${item.rate > 40 ? 'bg-red-400' : item.rate > 25 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
