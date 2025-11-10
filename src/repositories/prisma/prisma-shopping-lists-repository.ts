import { prisma } from '@/lib/prisma'
import { Prisma, ShoppingList } from '@prisma/client'
import {
  ShoppingListsRepository,
  ShoppingListWithAveragePrice,
} from '../shopping-lists-repository'

export class PrismaShoppingListsRepository implements ShoppingListsRepository {
  async create(
    data: Prisma.ShoppingListUncheckedCreateInput,
  ): Promise<ShoppingList> {
    const shoppingList = await prisma.shoppingList.create({
      data,
    })

    return shoppingList
  }

  async listByCoupleId(coupleId: number): Promise<ShoppingList[]> {
    const shoppingLists = await prisma.shoppingList.findMany({
      where: {
        couple_id: coupleId,
      },
      include: {
        ShoppingListItem: true,
        author: {
          select: {
            name: true,
            gender: true,
            avatar_url: true,
          },
        },
      },
    })

    return shoppingLists
  }

  async findById(id: number): Promise<ShoppingListWithAveragePrice | null> {
    const shoppingList = await prisma.shoppingList.findUnique({
      where: {
        id,
      },
      include: {
        ShoppingListItem: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!shoppingList) {
      return null
    }

    // Obter todos os product_ids únicos da lista
    const productIds = [
      ...new Set(shoppingList.ShoppingListItem.map((item) => item.product_id)),
    ]

    // Buscar todos os itens com preços para esses produtos de uma vez
    const allProductItems = await prisma.shoppingListItem.findMany({
      where: {
        product_id: {
          in: productIds,
        },
        unit_price: {
          not: null,
        },
      },
      select: {
        product_id: true,
        unit_price: true,
      },
    })

    // Calcular médias por produto
    const averagePricesByProduct = new Map<number, Prisma.Decimal>()

    productIds.forEach((productId) => {
      const productItems = allProductItems.filter(
        (item) => item.product_id === productId,
      )

      if (productItems.length > 0) {
        const total = productItems.reduce(
          (sum, item) => sum + (item.unit_price?.toNumber() || 0),
          0,
        )
        averagePricesByProduct.set(
          productId,
          new Prisma.Decimal(total / productItems.length),
        )
      }
    })

    // Adicionar preço médio a cada item
    const itemsWithAveragePrice = shoppingList.ShoppingListItem.map((item) => {
      return {
        ...item,
        average_price: averagePricesByProduct.get(item.product_id) || null,
      }
    })

    return {
      ...shoppingList,
      ShoppingListItem: itemsWithAveragePrice,
    }
  }

  async update(
    id: number,
    data: Prisma.ShoppingListUncheckedUpdateInput,
  ): Promise<ShoppingList> {
    const shoppingList = await prisma.shoppingList.update({
      where: {
        id,
      },
      data,
    })

    return shoppingList
  }

  async deleteById(id: number): Promise<void> {
    await prisma.$transaction([
      // Deleta todos os ShoppingListItem
      prisma.shoppingListItem.deleteMany({ where: { shopping_list_id: id } }),
      // Deleta a ShoppingList
      prisma.shoppingList.delete({ where: { id } }),
    ])
  }
}
