import type { Metadata } from "next"
import { VendorList } from "./_components/vendor-list"

export const metadata: Metadata = {
  title: "Our Partners | Qatering Go",
  description: "Browse our network of premium catering partners.",
}

export default function VendorPage() {
  return (
    <div className='min-h-screen bg-studio-50 pb-20'>
      {/* Header */}
      <div className='bg-slate-900 py-16 text-center text-white'>
        <h1 className='font-bold text-4xl tracking-tight'>
          Our Catering Partners
        </h1>
        <p className='mt-2 text-slate-300'>
          Trusted professionals for your every event need
        </p>
      </div>

      {/* List */}
      <VendorList />
    </div>
  )
}
