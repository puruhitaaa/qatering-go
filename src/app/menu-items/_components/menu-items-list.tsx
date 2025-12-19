"use client"

import { Loader2, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import { useDebounce } from "use-debounce"
import { Input } from "@/components/ui/input"
import { MenuItemCard } from "@/components/ui/menu-item-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/trpc/react"

export function MenuItemsList() {
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebounce(search, 500)
  const [vendorId, setVendorId] = useState<string>("all")

  // Infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = api.menuItem.getAll.useInfiniteQuery(
    {
      limit: 12,
      search: debouncedSearch,
      vendorId: vendorId !== "all" ? parseInt(vendorId) : undefined,
      isAvailable: true, // Only show available items for customers
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  // Infinite scroll trigger
  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  // Fetch vendors for filter
  const { data: vendorsData } = api.vendor.getAll.useQuery({ limit: 100 })
  const vendors = vendorsData?.items || []

  const items = data?.pages.flatMap((page) => page.items) || []

  return (
    <div className='space-y-6'>
      {/* Sticky Header */}
      <div className='sticky top-0 z-10 -mx-4 border-slate-200 border-b bg-white/80 px-4 py-4 backdrop-blur-md md:-mx-6 md:px-6'>
        <div className='container mx-auto flex flex-col gap-4 md:flex-row md:items-center'>
          <div className='relative flex-1'>
            <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              className='bg-white pl-9'
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search menu items...'
              value={search}
            />
          </div>
          <div className='w-full md:w-[200px]'>
            <Select onValueChange={setVendorId} value={vendorId}>
              <SelectTrigger className='bg-white'>
                <SelectValue placeholder='Filter by Vendor' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Vendors</SelectItem>
                {vendors.map((v) => (
                  <SelectItem key={v.id} value={v.id.toString()}>
                    {v.businessName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='container mx-auto px-4 md:px-6'>
        {isLoading ? (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {[...Array(8)].map((_, i) => (
              <div
                className='h-[300px] animate-pulse rounded-2xl bg-slate-100'
                key={i}
              />
            ))}
          </div>
        ) : isError ? (
          <div className='py-20 text-center text-red-500'>
            Failed to load menu items. Please try again.
          </div>
        ) : items.length === 0 ? (
          <div className='py-20 text-center text-muted-foreground'>
            No menu items found. Try different filters.
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {items.map((item) => (
              <MenuItemCard item={item} key={item.id} />
            ))}
          </div>
        )}

        {/* Loading Spinner at bottom */}
        {isFetchingNextPage && (
          <div className='flex justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-orange-500' />
          </div>
        )}

        {/* Intersection Obsever Trigger */}
        <div className='h-4 w-full' ref={ref} />
      </div>
    </div>
  )
}
