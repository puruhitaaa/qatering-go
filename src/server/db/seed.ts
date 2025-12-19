import { randomUUID } from "crypto"
import { db } from "@/server/db"
import { menuItem, user, vendor } from "@/server/db/schema"

async function main() {
  console.log("🌱 Starting seed...")

  const vendorsData = [
    {
      name: "Warung Nano Banana",
      email: "vendor1@example.com",
      phone: "081234567890",
      image: "/images/nano_banana_pro.png",
      description:
        "Authentic Indonesian cuisine powered by Nano Banana technology.",
    },
    {
      name: "Resto Pisang Pro",
      email: "vendor2@example.com",
      phone: "081234567891",
      image: "/images/nano_banana_pro.png",
      description: "Modern fusion food with a touch of Banana Pro innovation.",
    },
  ]

  const mealsData = [
    {
      itemName: "Nasi Goreng Special",
      description:
        "Fried rice with egg, chicken satay, and crackers. Typical Indonesian favorite.",
      unitPrice: "25000.00",
      imageUrl: "/images/nasi_goreng.png",
    },
    {
      itemName: "Beef Rendang",
      description:
        "Slow-cooked beef in coconut milk and spices. Rich and tender.",
      unitPrice: "45000.00",
      imageUrl: "/images/beef_rendang.png",
    },
    {
      itemName: "Sate Ayam Madura",
      description:
        "Grilled chicken skewers with peanut sauce and sweet soy sauce.",
      unitPrice: "30000.00",
      imageUrl: "/images/sate_ayam.png",
    },
  ]

  for (const vData of vendorsData) {
    // 1. Create User
    const userId = randomUUID()
    console.log(`Creating user for ${vData.name}...`)

    // Check if user exists (skip if email exists to avoid crash on re-run)
    const existingUser = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.email, vData.email),
    })

    let activeUserId = existingUser?.id

    if (!existingUser) {
      await db.insert(user).values({
        id: userId,
        name: vData.name,
        email: vData.email,
        emailVerified: true,
        image: vData.image,
        role: "vendor",
        phoneNumber: vData.phone,
      })
      activeUserId = userId
    } else {
      console.log(`User ${vData.email} already exists, using existing ID.`)
    }

    // 2. Create Vendor
    // Check if vendor exists
    const existingVendor = await db.query.vendor.findFirst({
      where: (v, { eq }) => eq(v.userId, activeUserId!),
    })

    let vendorId = existingVendor?.id

    if (!existingVendor) {
      console.log(`Creating vendor profile for ${vData.name}...`)
      const [newVendor] = await db
        .insert(vendor)
        .values({
          userId: activeUserId!,
          businessName: vData.name,
          businessDescription: vData.description,
          supportPhone: vData.phone,
          status: "active",
        })
        .returning({ id: vendor.id })

      if (!newVendor) {
        console.error("Failed to create vendor")
        continue
      }
      vendorId = newVendor.id
    } else {
      console.log(`Vendor profile for ${vData.name} already exists.`)
    }

    // 3. Create Menu Items
    console.log(`Seeding menu items for ${vData.name}...`)
    for (const meal of mealsData) {
      await db.insert(menuItem).values({
        vendorId: vendorId!,
        itemName: meal.itemName,
        description: meal.description,
        unitPrice: meal.unitPrice,
        isAvailable: true,
        imageUrl: meal.imageUrl,
      })
    }
  }

  console.log("✅ Seeding complete!")
  console.log(
    "\nNOTE: Please ensure the following images are present in your public/images folder:"
  )
  console.log("- nano_banana_pro.png")
  console.log("- nasi_goreng.png")
  console.log("- beef_rendang.png")
  console.log("- sate_ayam.png")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    // db connection close handled by script exit usually, but good practice if needed
    process.exit(0)
  })
