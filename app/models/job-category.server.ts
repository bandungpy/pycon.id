import type { jobCategory as JobCategory } from "@prisma/client"
import { prisma } from "~/db.server"

export const fields = {
  public: {
    symbol: true,
    name: true,
  },
}

export const query = {
  getAll() {
    return prisma.jobCategory.findMany({
      select: fields.public,
    })
  },
  getBySymbol({ symbol }: { symbol: JobCategory["symbol"] }) {
    return prisma.jobCategory.findFirst({
      where: { symbol },
    })
  },
}

export const jobCategory = { query }
