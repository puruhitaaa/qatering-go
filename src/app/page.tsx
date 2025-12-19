"use client"

import Autoplay from "embla-carousel-autoplay"
import { ArrowRight, Clock, MapPin, Star } from "lucide-react"
import Image from "next/image"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Separator } from "@/components/ui/separator"
import { api } from "@/trpc/react"

export default function HomePage() {
  const { data: recommendations } = api.product.getRecommendations.useQuery()
  const { data: merchants } = api.merchant.getAll.useQuery()

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
                        className='rounded-full bg-orange-500 px-8 py-6 font-semibold text-lg text-white shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-1 hover:bg-orange-600'
                        size='lg'
                      >
                        {slide.cta}
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
              className='hidden font-semibold text-orange-500 md:flex'
              variant='link'
            >
              View All <ArrowRight className='ml-2 h-4 w-4' />
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
                    <Card className='group h-full overflow-hidden rounded-2xl border-none bg-white shadow-md ring-1 ring-slate-100 transition-all duration-300 hover:shadow-xl'>
                      <CardHeader className='p-0'>
                        <div className='relative aspect-[4/3] w-full overflow-hidden bg-gray-100'>
                          <Image
                            alt={item.name}
                            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                            height={400}
                            onError={(e) => {
                              // Simple fallback logic handled in UI via CSS or State if needed,
                              // but for now keeping it simple.
                              // Ideally would use a state variable, but direct DOM manipulation is hacky in React.
                            }}
                            src={item.image}
                            width={500}
                          />
                          <div className='absolute top-3 left-3'>
                            <Badge className='bg-white/90 font-bold text-orange-600 shadow-sm backdrop-blur-sm hover:bg-white'>
                              Recommended
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className='flex-1 space-y-3 p-5'>
                        <div className='flex items-start justify-between'>
                          <CardTitle className='line-clamp-1 font-bold text-lg text-slate-800 transition-colors group-hover:text-orange-600'>
                            {item.name}
                          </CardTitle>
                          <div className='flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 font-bold text-amber-500 text-xs'>
                            <Star className='h-3 w-3 fill-current' /> 4.8
                          </div>
                        </div>
                        <div className='flex items-center gap-2 text-muted-foreground text-sm'>
                          <Clock className='h-3.5 w-3.5' /> 45 mins
                          <span className='text-slate-300'>•</span>
                          <MapPin className='h-3.5 w-3.5' /> 2.1km
                        </div>
                        <p className='font-bold text-slate-900 text-xl'>
                          {item.price}
                        </p>
                      </CardContent>
                      <CardFooter className='p-5 pt-0'>
                        <Button className='h-11 w-full rounded-xl bg-slate-900 font-semibold text-white shadow-lg shadow-slate-900/10 transition-colors hover:bg-orange-500'>
                          Add to Cart
                        </Button>
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
                {/* Add a skeleton or empty state if recommendations is undefined? 
                    For now assuming data comes in eventually. */}
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
            <Button className='hidden md:flex' variant='outline'>
              See All Merchants
            </Button>
          </div>

          <div className='grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6'>
            {merchants?.map((merchant) => (
              <div
                className='group flex cursor-pointer flex-col items-center space-y-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-orange-100 hover:shadow-xl'
                key={merchant.id}
              >
                <div className='relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-orange-50 shadow-inner ring-4 ring-white transition-transform duration-300 group-hover:scale-110'>
                  {/* Fallback avatar */}
                  <span className='font-bold text-2xl text-orange-500'>
                    {merchant.name.charAt(0)}
                  </span>
                </div>
                <div className='space-y-1 text-center'>
                  <h3 className='font-semibold text-slate-900 transition-colors group-hover:text-orange-600'>
                    {merchant.name}
                  </h3>
                  <p className='text-muted-foreground text-xs'>
                    Premium Partner
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
