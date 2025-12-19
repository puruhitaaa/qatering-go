import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"

export const productRouter = createTRPCRouter({
  getRecommendations: publicProcedure.query(() => {
    return [
      {
        id: 1,
        name: "Ayam Bakar Komplit",
        price: "Rp. 25,000",
        image: "/food/ayam-bakar.jpg",
      },
      {
        id: 2,
        name: "Indomie Ayam Geprek",
        price: "Rp. 15,000",
        image: "/food/indomie.jpg",
      },
      {
        id: 3,
        name: "Soto Betawi",
        price: "Rp. 20,000",
        image: "/food/soto.jpg",
      },
      {
        id: 4,
        name: "Nasi Ayam Rica",
        price: "Rp. 23,000",
        image: "/food/rica.jpg",
      },
      {
        id: 5,
        name: "Nasi Goreng Spesial",
        price: "Rp. 22,000",
        image: "/food/nasigoreng.jpg",
      },
    ]
  }),
})
