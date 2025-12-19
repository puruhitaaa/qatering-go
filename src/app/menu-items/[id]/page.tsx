"use client"

import {
  Check,
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
  Star,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { api } from "@/trpc/react"

// Helper to format currency
const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(parseFloat(amount))
}

export default function MenuItemDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)
  const [quantity, setQuantity] = useState(1)

  const {
    data: item,
    isLoading,
    isError,
  } = api.menuItem.getById.useQuery({ id }, { enabled: !!id })

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-white'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent' />
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-white text-center'>
        <h1 className='font-bold text-2xl text-slate-900'>Item not found</h1>
        <p className='text-muted-foreground'>
          The menu item you are looking for does not exist or has been removed.
        </p>
        <Button onClick={() => router.back()} variant='outline'>
          Go Back
        </Button>
      </div>
    )
  }

  const handleIncrement = () => setQuantity((q) => q + 1)
  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1))

  return (
    <div className='min-h-screen bg-white pb-20'>
      <div className='container mx-auto px-4 py-8 md:px-6'>
        {/* Breadcrumb / Back */}
        <div className='mb-8'>
          <Button
            className='pl-0 text-muted-foreground hover:text-orange-600'
            onClick={() => router.back()}
            variant='link'
          >
            <ChevronLeft className='mr-1 h-4 w-4' /> Back to Menu
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-12 lg:grid-cols-2'>
          {/* Left Column: Image Gallery */}
          <div className='relative'>
            <div className='sticky top-24 overflow-hidden rounded-3xl bg-slate-50 shadow-sm ring-1 ring-slate-100'>
              <div className='relative aspect-square w-full'>
                <Image
                  alt={item.itemName}
                  className='object-cover'
                  fill
                  priority
                  src={item.imageUrl || "/placeholder-food.jpg"}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className='flex flex-col space-y-8 py-4'>
            <div className='space-y-4'>
              <div className='flex flex-wrap items-center gap-3'>
                {item.isAvailable ? (
                  <Badge className='border-none bg-green-100 px-3 py-1 font-semibold text-green-700 hover:bg-green-200'>
                    Available
                  </Badge>
                ) : (
                  <Badge className='border-none bg-red-100 px-3 py-1 font-semibold text-red-700 hover:bg-red-200'>
                    Sold Out
                  </Badge>
                )}
                <Badge className='border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50'>
                  <Star className='mr-1 h-3.5 w-3.5 fill-orange-400 text-orange-400' />
                  Top Rated
                </Badge>
              </div>

              <h1 className='font-bold text-4xl text-slate-900 tracking-tight lg:text-5xl'>
                {item.itemName}
              </h1>

              <div className='font-bold text-3xl text-slate-900'>
                {formatCurrency(item.unitPrice)}
              </div>
            </div>

            {/* Vendor Info Card */}
            <div className='flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:border-orange-200 hover:bg-orange-50/30'>
              <div className='relative h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm'>
                {item.vendor.user?.image ? (
                  <Image
                    alt={item.vendor.businessName}
                    className='object-cover'
                    fill
                    src={item.vendor.user.image}
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center bg-orange-100 font-bold text-orange-600'>
                    {item.vendor.businessName.charAt(0)}
                  </div>
                )}
              </div>
              <div className='flex-1'>
                <p className='font-medium text-slate-500 text-xs uppercase tracking-wider'>
                  Sold by
                </p>
                <Link
                  className='font-bold text-slate-900 hover:text-orange-600 hover:underline'
                  href={`/menu-items?vendorId=${item.vendorId}`}
                >
                  {item.vendor.businessName}
                </Link>
              </div>
              <Button asChild size='sm' variant='outline'>
                <Link href={`/menu-items?vendorId=${item.vendorId}`}>
                  View Menu
                </Link>
              </Button>
            </div>

            <Separator />

            <div className='space-y-4'>
              <h3 className='font-semibold text-lg text-slate-900'>
                Description
              </h3>
              <p className='text-slate-600 leading-relaxed'>
                {item.description ||
                  "No detailed description available for this item. Please contact the vendor for more information."}
              </p>
            </div>

            <div className='flex-1' />

            {/* Sticky Bottom Actions on Mobile / Normal on Desktop */}
            <div className='fixed right-0 bottom-0 left-0 z-20 border-slate-200 border-t bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:static md:border-none md:bg-transparent md:p-0 md:shadow-none'>
              <div className='container mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center'>
                {/* Quantity */}
                <div className='md:justify-[initial] flex w-auto items-center justify-evenly gap-4 rounded-xl border border-slate-200 bg-slate-50 p-1'>
                  <Button
                    className='h-10 w-10 rounded-lg hover:bg-white hover:shadow-sm'
                    disabled={quantity <= 1 || !item.isAvailable}
                    onClick={handleDecrement}
                    size='icon'
                    variant='ghost'
                  >
                    <Minus className='h-4 w-4' />
                  </Button>
                  <span className='w-8 text-center font-bold text-lg'>
                    {quantity}
                  </span>
                  <Button
                    className='h-10 w-10 rounded-lg hover:bg-white hover:shadow-sm'
                    disabled={!item.isAvailable}
                    onClick={handleIncrement}
                    size='icon'
                    variant='ghost'
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>

                {/* Add to Cart */}
                <Button
                  className='h-12 flex-1 rounded-xl bg-slate-900 font-bold text-lg text-white shadow-slate-900/10 shadow-xl transition-transform hover:-translate-y-1 hover:bg-orange-500 hover:shadow-orange-500/20 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:hover:translate-y-0 disabled:hover:shadow-none'
                  disabled={!item.isAvailable}
                >
                  {item.isAvailable ? (
                    <>
                      <ShoppingBag className='mr-2 h-5 w-5' />
                      Add to Cart -{" "}
                      {formatCurrency(
                        (parseFloat(item.unitPrice) * quantity).toString()
                      )}
                    </>
                  ) : (
                    "Currently Unavailable"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
