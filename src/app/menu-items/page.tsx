import type { Metadata } from "next"
import { MenuItemsList } from "./_components/menu-items-list"

export const metadata: Metadata = {
  title: "Menu Items | Qatering Go",
  description: "Explore our diverse selection of catering menus.",
}

export default function MenuItemsPage() {
  return (
    <div className='min-h-screen bg-studio-50 pb-20'>
      {/* Header */}
      <div className='bg-slate-900 py-16 text-center text-white'>
        <h1 className='font-bold text-4xl tracking-tight'>Our Menu</h1>
        <p className='mt-2 text-slate-300'>
          Discover the perfect dishes for your event
        </p>
      </div>

      {/* List */}
      <MenuItemsList />
    </div>
  )
}
