"use client"

import { Loader2, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import { useDebounce } from "use-debounce"
import { Input } from "@/components/ui/input"
import { VendorCard } from "@/components/ui/vendor-card"
import { api } from "@/trpc/react"

export function VendorList() {
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebounce(search, 500)

  // Infinite query for vendors
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = api.vendor.getAll.useInfiniteQuery(
    {
      limit: 9, // 3x grid
      search: debouncedSearch,
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

  const items = data?.pages.flatMap((page) => page.items) || []

  return (
    <div className='space-y-6'>
      {/* Sticky Header */}
      <div className='sticky top-0 z-10 -mx-4 border-slate-200 border-b bg-white/80 px-4 py-4 backdrop-blur-md md:-mx-6 md:px-6'>
        <div className='container mx-auto flex max-w-2xl items-center'>
          <div className='relative flex-1'>
            <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              className='bg-white pl-9 shadow-sm'
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Find a catering partner...'
              value={search}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='container mx-auto px-4 md:px-6'>
        {isLoading ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {[...Array(6)].map((_, i) => (
              <div
                className='h-[350px] animate-pulse rounded-2xl bg-slate-100'
                key={i}
              />
            ))}
          </div>
        ) : isError ? (
          <div className='py-20 text-center text-red-500'>
            Failed to load vendors. Please try again.
          </div>
        ) : items.length === 0 ? (
          <div className='py-20 text-center text-muted-foreground'>
            No vendors found matching your search.
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {items.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
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
