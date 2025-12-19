"use client"

import Autoplay from "embla-carousel-autoplay"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { MenuItemCard } from "@/components/ui/menu-item-card"
import { Separator } from "@/components/ui/separator"
import { VendorCard } from "@/components/ui/vendor-card"
import { api } from "@/trpc/react"

export default function HomePage() {
  const { data: recommendationsData } = api.menuItem.getAll.useQuery({
    limit: 8,
    isAvailable: true,
  })
  const { data: vendorsData } = api.vendor.getAll.useQuery({ limit: 6 })

  const recommendations = recommendationsData?.items
  const merchants = vendorsData?.items

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  const heroSlides = [
    {
      id: 1,
      image: "/hero/hero-1.png",
      title: "Elevate Your Corporate Events",
      subtitle:
        "Premium Indonesian catering served with elegance and tradition.",
      cta: "Explore Menu",
    },
    {
      id: 2,
      image: "/hero/hero-2.png",
      title: "Exquisite Bento Boxes",
      subtitle: "Perfectly curated meals for productive meetings.",
      cta: "Order Bento",
    },
    {
      id: 3,
      image: "/hero/hero-3.png",
      title: "Luxury Buffet Experiences",
      subtitle:
        "Create unforgettable moments with our signature buffet setups.",
      cta: "View Packages",
    },
  ]

  return (
    <div className='min-h-screen bg-studio-50 pb-20 font-sans text-slate-900'>
      {/* Hero Section */}
      <section className='relative w-full overflow-hidden'>
        <Carousel
          className='w-full'
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{
            loop: true,
          }}
          plugins={[plugin.current]}
        >
          <CarouselContent>
            {heroSlides.map((slide) => (
              <CarouselItem
                className='relative h-[500px] w-full md:h-[600px]'
                key={slide.id}
              >
                <div className='absolute inset-0'>
                  <Image
                    alt={slide.title}
                    className='object-cover'
                    fill
                    priority={slide.id === 1}
                    src={slide.image}
                  />
                  <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent' />
                </div>
                <div className='container relative mx-auto flex h-full flex-col justify-center px-4 md:px-6'>
                  <div className='slide-in-from-left-10 fade-in max-w-2xl animate-in space-y-6 duration-700'>
                    <Badge
                      className='border-none bg-orange-500/90 px-4 py-1 text-sm text-white uppercase tracking-wide hover:bg-orange-500'
                      variant='secondary'
                    >
                      Premium Catering
                    </Badge>
                    <h1 className='font-extrabold text-4xl text-white tracking-tight drop-shadow-lg md:text-6xl lg:text-7xl'>
                      {slide.title}
                    </h1>
                    <p className='max-w-xl font-medium text-lg text-white/90 drop-shadow-md md:text-xl md:leading-relaxed'>
                      {slide.subtitle}
                    </p>
                    <div className='flex gap-4 pt-4'>
                      <Button
                        asChild
                        className='rounded-full bg-orange-500 px-8 py-6 font-semibold text-lg text-white shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-1 hover:bg-orange-600'
                        size='lg'
                      >
                        <Link href='/menu-items'>{slide.cta}</Link>
                      </Button>
                      <Button
                        className='rounded-full border-2 border-white bg-transparent px-8 py-6 font-semibold text-lg text-white transition-all hover:bg-white hover:text-black'
                        size='lg'
                        variant='outline'
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className='absolute right-8 bottom-8 hidden gap-2 md:flex'>
            <CarouselPrevious className='static translate-y-0 border-white/30 bg-black/20 text-white hover:bg-white hover:text-black' />
            <CarouselNext className='static translate-y-0 border-white/30 bg-black/20 text-white hover:bg-white hover:text-black' />
          </div>
        </Carousel>
      </section>

      <div className='container mx-auto space-y-20 px-4 py-16 md:px-6'>
        {/* Today's Recommend Section */}
        <section className='space-y-8'>
          <div className='flex items-end justify-between'>
            <div className='space-y-2'>
              <h2 className='font-bold text-3xl text-slate-900 tracking-tight md:text-4xl'>
                Today's Recommendations
              </h2>
              <p className='w-full max-w-md text-muted-foreground'>
                Curated selections just for you based on popular demand.
              </p>
            </div>
            <Button
              asChild
              className='hidden font-semibold text-orange-500 md:flex'
              variant='link'
            >
              <Link href='/menu-items'>
                View All <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </div>

          <div className='relative'>
            <Carousel
              className='w-full'
              opts={{
                align: "start",
                loop: false,
              }}
            >
              <CarouselContent className='-ml-4 pb-4'>
                {recommendations?.map((item) => (
                  <CarouselItem
                    className='pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4'
                    key={item.id}
                  >
                    <MenuItemCard item={item} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className='-left-4 hidden border-slate-200 bg-white text-slate-700 shadow-lg hover:border-orange-200 hover:text-orange-500 md:flex' />
              <CarouselNext className='-right-4 hidden border-slate-200 bg-white text-slate-700 shadow-lg hover:border-orange-200 hover:text-orange-500 md:flex' />
            </Carousel>
          </div>
        </section>

        <Separator className='bg-slate-200' />

        {/* Merchant Section */}
        <section className='space-y-8'>
          <div className='flex items-center justify-between'>
            <h2 className='font-bold text-3xl text-slate-900 tracking-tight md:text-4xl'>
              Featured Merchants
            </h2>
            <Button asChild className='hidden md:flex' variant='outline'>
              <Link href='/vendor'>See All Merchants</Link>
            </Button>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {merchants?.map((merchant) => (
              <VendorCard key={merchant.id} vendor={merchant} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
