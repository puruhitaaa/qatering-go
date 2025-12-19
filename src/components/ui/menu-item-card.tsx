import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Helper to format currency
const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(parseFloat(amount))
}

// Infer type or define manually.
// Since we might not want to infer from entire Router output in a UI component to avoid circular deps or complex types,
// we can define an interface that matches what we need.
interface MenuItemProps {
  item: {
    id: number
    itemName: string
    description: string | null
    unitPrice: string
    imageUrl: string | null
    isAvailable: boolean
  }
}

export function MenuItemCard({ item }: MenuItemProps) {
  return (
    <Card className='group h-full overflow-hidden rounded-2xl border-none bg-white pt-0 shadow-md ring-1 ring-slate-100 transition-all duration-300 hover:shadow-xl'>
      <CardHeader className='p-0'>
        <Link href={`/menu-items/${item.id}`}>
          <div className='relative aspect-[4/3] w-full overflow-hidden bg-gray-100'>
            <Image
              alt={item.itemName}
              className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
              height={400}
              onError={(e) => {
                // Simple fallback could be handled here if needed
              }}
              src={item.imageUrl || "/placeholder-food.jpg"}
              width={500}
            />
            {item.isAvailable && (
              // Example badge, maybe we only show "Recommended" if passed as prop?
              // For now matching homepage "Recommended" badge style essentially.
              // Or generic badge. Let's make it generic or stick to design.
              // The homepage hardcoded "Recommended".
              // We can check availability.
              <div className='absolute top-3 left-3'>
                <Badge className='bg-white/90 font-bold text-orange-600 shadow-sm backdrop-blur-sm hover:bg-white'>
                  Available
                </Badge>
              </div>
            )}
          </div>
        </Link>
      </CardHeader>
      <CardContent className='flex-1 space-y-3 p-5'>
        <div className='flex items-start justify-between'>
          <CardTitle className='line-clamp-1 font-bold text-lg text-slate-800 transition-colors group-hover:text-orange-600'>
            {item.itemName}
          </CardTitle>
          {item.isAvailable ? (
            <Badge className='border-none bg-green-100 text-green-700 shadow-none hover:bg-green-200'>
              Available
            </Badge>
          ) : (
            <Badge className='border-none bg-red-100 text-red-700 shadow-none hover:bg-red-200'>
              Sold Out
            </Badge>
          )}
        </div>
        <p className='line-clamp-2 text-muted-foreground text-sm'>
          {item.description || "No description available."}
        </p>
        <p className='font-bold text-slate-900 text-xl'>
          {formatCurrency(item.unitPrice)}
        </p>
      </CardContent>
      <CardFooter className='p-5 pt-0'>
        <Button className='h-11 w-full rounded-xl bg-slate-900 font-semibold text-white shadow-lg shadow-slate-900/10 transition-colors hover:bg-orange-500'>
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
