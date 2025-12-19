import { MapPin, Utensils } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface VendorCardProps {
  vendor: {
    id: number
    businessName: string
    businessDescription: string | null
    supportPhone: string | null
    status: string
    user: {
      image: string | null
    } | null
    location: {
      city: string
    } | null
    menuItems: { id: number }[]
  }
}

export function VendorCard({ vendor }: VendorCardProps) {
  return (
    <Card className='group h-full overflow-hidden rounded-2xl border-none bg-white pt-0 shadow-md ring-1 ring-slate-100 transition-all duration-300 hover:shadow-xl'>
      {/* Cover / Header Area */}
      <div className='relative h-32 w-full overflow-hidden bg-slate-900'>
        {/* Abstract pattern or solid color if no cover image exists */}
        <div className='absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500 opacity-90' />
        <div className='absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-black/50 to-transparent' />
      </div>

      <CardContent className='relative px-6 pb-6'>
        {/* Profile Image - Overlapping header */}
        <div className='-mt-12 mb-4 flex items-end justify-between'>
          <div className='relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg'>
            {vendor.user?.image ? (
              <Image
                alt={vendor.businessName}
                className='h-full w-full object-cover'
                height={96}
                src={vendor.user.image}
                width={96}
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-orange-50'>
                <span className='font-bold text-3xl text-orange-500'>
                  {vendor.businessName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className='mb-2'>
            {vendor.status === "active" && (
              <Badge className='border-none bg-green-100 text-green-700 shadow-none hover:bg-green-200'>
                Active
              </Badge>
            )}
            {vendor.status === "pending_approval" && (
              <Badge className='border-none bg-amber-100 text-amber-700 shadow-none hover:bg-amber-200'>
                Pending
              </Badge>
            )}
          </div>
        </div>

        <div className='space-y-4'>
          <div>
            <h3 className='font-bold text-slate-900 text-xl transition-colors group-hover:text-orange-600'>
              {vendor.businessName}
            </h3>
            {vendor.supportPhone && (
              <p className='mt-1 flex items-center gap-1 text-slate-500 text-sm'>
                Contact: {vendor.supportPhone}
              </p>
            )}
          </div>

          <p className='line-clamp-2 text-muted-foreground text-sm'>
            {vendor.businessDescription ||
              "Providing excellent culinary experiences for your events."}
          </p>

          <div className='flex flex-wrap gap-3 text-sm'>
            {vendor.location && (
              <div className='flex items-center gap-1 text-slate-500'>
                <MapPin className='h-3.5 w-3.5' /> {vendor.location.city}
              </div>
            )}
            <div className='flex items-center gap-1 text-slate-500'>
              <Utensils className='h-3.5 w-3.5' /> {vendor.menuItems.length}{" "}
              Menus
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className='p-6 pt-0'>
        <Button
          asChild
          className='w-full rounded-xl bg-slate-900 font-semibold text-white shadow-lg shadow-slate-900/10 transition-colors hover:bg-orange-500'
        >
          <Link href={`/menu-items?vendorId=${vendor.id}`}>View Menu</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
