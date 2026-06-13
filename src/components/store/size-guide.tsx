'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Ruler,
  Shirt,
  Footprints,
  Watch,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface SizeGuideProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'clothing' | 'shoes' | 'accessories'
}

// Clothing sizes (inches / cm)
const clothingData = {
  inches: [
    { size: 'XS', us: '0-2', uk: '4-6', eu: '32-34', chest: '31-32', waist: '23-24', hips: '33-34' },
    { size: 'S', us: '4-6', uk: '8-10', eu: '36-38', chest: '33-34', waist: '25-26', hips: '35-36' },
    { size: 'M', us: '8-10', uk: '12-14', eu: '40-42', chest: '35-36', waist: '27-28', hips: '37-38' },
    { size: 'L', us: '12-14', uk: '16-18', eu: '44-46', chest: '37-39', waist: '29-31', hips: '39-41' },
    { size: 'XL', us: '16-18', uk: '20-22', eu: '48-50', chest: '40-42', waist: '32-34', hips: '42-44' },
    { size: 'XXL', us: '20-22', uk: '24-26', eu: '52-54', chest: '43-45', waist: '35-37', hips: '45-47' },
  ],
  cm: [
    { size: 'XS', us: '0-2', uk: '4-6', eu: '32-34', chest: '79-81', waist: '58-61', hips: '84-86' },
    { size: 'S', us: '4-6', uk: '8-10', eu: '36-38', chest: '84-86', waist: '64-66', hips: '89-91' },
    { size: 'M', us: '8-10', uk: '12-14', eu: '40-42', chest: '89-91', waist: '69-71', hips: '94-97' },
    { size: 'L', us: '12-14', uk: '16-18', eu: '44-46', chest: '94-99', waist: '74-79', hips: '99-104' },
    { size: 'XL', us: '16-18', uk: '20-22', eu: '48-50', chest: '102-107', waist: '81-86', hips: '107-112' },
    { size: 'XXL', us: '20-22', uk: '24-26', eu: '52-54', chest: '109-114', waist: '89-94', hips: '114-119' },
  ],
}

// Shoe sizes
const shoesData = [
  { us: '5', uk: '2.5', eu: '35', cm: '22' },
  { us: '5.5', uk: '3', eu: '35.5', cm: '22.5' },
  { us: '6', uk: '3.5', eu: '36', cm: '23' },
  { us: '6.5', uk: '4', eu: '37', cm: '23.5' },
  { us: '7', uk: '4.5', eu: '37.5', cm: '24' },
  { us: '7.5', uk: '5', eu: '38', cm: '24.5' },
  { us: '8', uk: '5.5', eu: '39', cm: '25' },
  { us: '8.5', uk: '6', eu: '39.5', cm: '25.5' },
  { us: '9', uk: '6.5', eu: '40', cm: '26' },
  { us: '9.5', uk: '7', eu: '41', cm: '26.5' },
  { us: '10', uk: '7.5', eu: '41.5', cm: '27' },
  { us: '10.5', uk: '8', eu: '42', cm: '27.5' },
  { us: '11', uk: '8.5', eu: '43', cm: '28' },
  { us: '12', uk: '9.5', eu: '44', cm: '29' },
]

// Accessories sizes
const accessoriesData = [
  { type: 'Ring', sizes: '4-13 (US)', description: 'Measure circumference of finger' },
  { type: 'Bracelet', sizes: '6-9 inches', description: 'Measure wrist circumference' },
  { type: 'Necklace', sizes: '14-24 inches', description: 'Measure from base of neck' },
  { type: 'Hat', sizes: 'S/M/L/XL', description: 'Measure head circumference' },
  { type: 'Belt', sizes: '26-46 inches', description: 'Measure waist at belt level' },
  { type: 'Gloves', sizes: 'S/M/L/XL', description: 'Measure hand circumference' },
]

const howToMeasure = [
  {
    title: 'Chest',
    description: 'Measure around the fullest part of your chest, keeping the tape horizontal.',
  },
  {
    title: 'Waist',
    description: 'Measure around the narrowest part of your natural waist, keeping the tape comfortable.',
  },
  {
    title: 'Hips',
    description: 'Measure around the fullest part of your hips, keeping the tape horizontal.',
  },
  {
    title: 'Foot Length',
    description: 'Stand on a piece of paper and mark the longest toe and heel. Measure the distance.',
  },
]

export function SizeGuide({ open, onOpenChange, defaultTab = 'clothing' }: SizeGuideProps) {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches')
  const [showHowToMeasure, setShowHowToMeasure] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-emerald-600" />
            Size Guide
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 mb-4">
            <TabsTrigger
              value="clothing"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 transition-all gap-1.5"
            >
              <Shirt className="h-4 w-4" />
              Clothing
            </TabsTrigger>
            <TabsTrigger
              value="shoes"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 transition-all gap-1.5"
            >
              <Footprints className="h-4 w-4" />
              Shoes
            </TabsTrigger>
            <TabsTrigger
              value="accessories"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 transition-all gap-1.5"
            >
              <Watch className="h-4 w-4" />
              Accessories
            </TabsTrigger>
          </TabsList>

          {/* Clothing Tab */}
          <TabsContent value="clothing" className="mt-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Women&apos;s clothing size chart</p>
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
                <button
                  onClick={() => setUnit('inches')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    unit === 'inches' ? 'bg-emerald-600 text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Inches
                </button>
                <button
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    unit === 'cm' ? 'bg-emerald-600 text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  CM
                </button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                    <th className="px-3 py-2.5 text-left font-semibold">Size</th>
                    <th className="px-3 py-2.5 text-left font-semibold">US</th>
                    <th className="px-3 py-2.5 text-left font-semibold">UK</th>
                    <th className="px-3 py-2.5 text-left font-semibold">EU</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Chest ({unit})</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Waist ({unit})</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Hips ({unit})</th>
                  </tr>
                </thead>
                <tbody>
                  {(unit === 'inches' ? clothingData.inches : clothingData.cm).map((row, idx) => (
                    <tr
                      key={row.size}
                      className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                    >
                      <td className="px-3 py-2 font-medium">
                        <Badge variant="secondary" className="text-xs">{row.size}</Badge>
                      </td>
                      <td className="px-3 py-2">{row.us}</td>
                      <td className="px-3 py-2">{row.uk}</td>
                      <td className="px-3 py-2">{row.eu}</td>
                      <td className="px-3 py-2">{row.chest}</td>
                      <td className="px-3 py-2">{row.waist}</td>
                      <td className="px-3 py-2">{row.hips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Shoes Tab */}
          <TabsContent value="shoes" className="mt-0">
            <p className="text-sm text-muted-foreground mb-4">Shoe size conversion chart</p>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                    <th className="px-3 py-2.5 text-left font-semibold">US</th>
                    <th className="px-3 py-2.5 text-left font-semibold">UK</th>
                    <th className="px-3 py-2.5 text-left font-semibold">EU</th>
                    <th className="px-3 py-2.5 text-left font-semibold">CM (Foot Length)</th>
                  </tr>
                </thead>
                <tbody>
                  {shoesData.map((row, idx) => (
                    <tr
                      key={row.us}
                      className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                    >
                      <td className="px-3 py-2 font-medium">{row.us}</td>
                      <td className="px-3 py-2">{row.uk}</td>
                      <td className="px-3 py-2">{row.eu}</td>
                      <td className="px-3 py-2">{row.cm} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Accessories Tab */}
          <TabsContent value="accessories" className="mt-0">
            <p className="text-sm text-muted-foreground mb-4">Accessories sizing guide</p>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                    <th className="px-3 py-2.5 text-left font-semibold">Type</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Available Sizes</th>
                    <th className="px-3 py-2.5 text-left font-semibold">How to Measure</th>
                  </tr>
                </thead>
                <tbody>
                  {accessoriesData.map((row, idx) => (
                    <tr
                      key={row.type}
                      className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                    >
                      <td className="px-3 py-2 font-medium">{row.type}</td>
                      <td className="px-3 py-2">{row.sizes}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        {/* How to Measure Section */}
        <div className="mt-6 border-t pt-4">
          <button
            onClick={() => setShowHowToMeasure(!showHowToMeasure)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Ruler className="h-4 w-4 text-emerald-600" />
              How to Measure
            </h3>
            {showHowToMeasure ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {showHowToMeasure && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {howToMeasure.map((item) => (
                <div
                  key={item.title}
                  className="p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30"
                >
                  <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <strong>Tip:</strong> If you&apos;re between sizes, we recommend going up a size for a more comfortable fit. For the most accurate measurements, wear lightweight clothing and use a flexible measuring tape.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
