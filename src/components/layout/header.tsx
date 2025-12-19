"use client"

import { Bell, Menu, Search, User } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { authClient } from "@/server/better-auth/client"
import { Skeleton } from "../ui/skeleton"

export function Header() {
  const { data: session, isPending, isRefetching } = authClient.useSession()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const isLoadingAuth = isPending || isRefetching

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged out successfully")
        },
        onError: () => {
          toast.error("Failed to log out")
        },
      },
    })
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "border-b bg-white/80 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/60"
          : "border-transparent border-b bg-transparent"
      )}
    >
      <div className='container mx-auto flex h-20 items-center justify-between px-4 md:px-6'>
        {/* Logo */}
        <div className='flex items-center gap-8'>
          <Link className='flex items-center gap-2' href='/'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md'>
              <span className='font-bold text-white text-xl'>Q</span>
            </div>
            <span
              className={cn(
                "hidden font-bold text-xl tracking-tight md:inline-block",
                isScrolled ? "text-gray-900" : "text-gray-900"
              )}
            >
              QateringGo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className='hidden md:flex'>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href='/menu-items'>Menu</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Search Bar - Center/Right Aligned */}
        <div className='hidden max-w-lg flex-1 items-center justify-center px-8 lg:flex'>
          <div className='group relative w-full'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-hover:text-orange-500' />
            <Input
              className='w-full rounded-full border-transparent bg-slate-100/80 pl-10 shadow-sm transition-all hover:shadow-md focus-visible:bg-white focus-visible:ring-orange-500/50 focus-visible:ring-offset-0'
              placeholder='Search for food, merchants...'
              type='search'
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className='flex items-center gap-1 md:gap-2'>
          {/* Mobile Search Trigger */}
          <Button
            className='text-gray-600 lg:hidden'
            size='icon'
            variant='ghost'
          >
            <Search className='h-5 w-5' />
          </Button>

          <Button
            aria-label='Notifications'
            className='relative text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-600'
            size='icon'
            variant='ghost'
          >
            <Bell className='h-5 w-5' />
            <span className='absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white' />
          </Button>

          <div className='ml-2 hidden items-center gap-3 border-gray-200 border-l pl-4 md:flex'>
            {!isLoadingAuth ? (
              !session ? (
                <>
                  <Button
                    asChild
                    className='font-semibold text-gray-600 hover:text-orange-600'
                    variant='ghost'
                  >
                    <Link href='/login'>Log In</Link>
                  </Button>
                  <Button
                    asChild
                    className='rounded-full bg-gray-900 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-xl'
                  >
                    <Link href='/signup'>Sign Up</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className='text-base' variant='ghost'>
                    <Link href='/profile'>
                      <User className='mr-2 h-4 w-4' /> Profile
                    </Link>
                  </Button>
                  <Button
                    className='bg-destructive text-destructive-foreground shadow-md'
                    onClick={handleLogout}
                    type='button'
                  >
                    Logout
                  </Button>
                </>
              )
            ) : (
              <>
                <Skeleton className='h-8 w-20 rounded-full' />
                <Skeleton className='h-8 w-20 rounded-full' />
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className='flex md:hidden'>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  className='-mr-2 text-gray-600'
                  size='icon'
                  variant='ghost'
                >
                  <Menu className='h-6 w-6' />
                  <span className='sr-only'>Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                className='w-[300px] border-orange-500 border-l-2 p-4 sm:w-[400px]'
                side='right'
              >
                <div className='mt-6 flex flex-col gap-6'>
                  <Link className='flex items-center gap-2' href='/'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-md'>
                      <span className='font-bold text-white text-xl'>Q</span>
                    </div>
                    <span className='font-bold text-xl'>QateringGo</span>
                  </Link>

                  <div className='relative'>
                    <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500' />
                    <Input
                      className='w-full rounded-full bg-slate-100 pl-10'
                      placeholder='Search...'
                      type='search'
                    />
                  </div>

                  <nav className='flex flex-col gap-2'>
                    <Link
                      className='flex items-center justify-between rounded-lg px-4 py-3 font-medium text-gray-700 text-lg transition-colors hover:bg-orange-50 hover:text-orange-600'
                      href='#'
                    >
                      Home
                    </Link>
                    <Link
                      className='flex items-center justify-between rounded-lg px-4 py-3 font-medium text-gray-700 text-lg transition-colors hover:bg-orange-50 hover:text-orange-600'
                      href='#'
                    >
                      Menu
                    </Link>
                    <Link
                      className='flex items-center justify-between rounded-lg px-4 py-3 font-medium text-gray-700 text-lg transition-colors hover:bg-orange-50 hover:text-orange-600'
                      href='#'
                    >
                      Services
                    </Link>
                    <Link
                      className='flex items-center justify-between rounded-lg px-4 py-3 font-medium text-gray-700 text-lg transition-colors hover:bg-orange-50 hover:text-orange-600'
                      href='#'
                    >
                      Orders
                    </Link>
                  </nav>

                  <Separator />

                  <div className='flex flex-col gap-3'>
                    {isLoadingAuth ? (
                      <>
                        <Skeleton className='h-8 w-full rounded-full' />
                        <Skeleton className='h-8 w-full rounded-full' />
                      </>
                    ) : !session ? (
                      <>
                        <Button
                          asChild
                          className='w-full justify-start text-base'
                          variant='ghost'
                        >
                          <Link href='/login'>
                            <User className='mr-2 h-4 w-4' /> Log In
                          </Link>
                        </Button>
                        <Button
                          asChild
                          className='w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                        >
                          <Link href='/signup'>Sign Up Now</Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          asChild
                          className='w-full justify-start text-base'
                          variant='ghost'
                        >
                          <Link href='/profile'>
                            <User className='mr-2 h-4 w-4' /> Profile
                          </Link>
                        </Button>
                        <Button
                          className='w-full bg-destructive text-destructive-foreground shadow-md'
                          onClick={handleLogout}
                          type='button'
                        >
                          Logout
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

const ListItem = React.forwardRef<
  React.ComponentRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-orange-50 hover:text-orange-600 focus:bg-orange-50 focus:text-orange-600",
            className
          )}
          ref={ref}
          {...props}
        >
          <div className='font-medium text-sm leading-none'>{title}</div>
          <p className='line-clamp-2 text-muted-foreground text-sm leading-snug'>
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
