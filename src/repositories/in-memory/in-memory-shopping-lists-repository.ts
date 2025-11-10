import { Prisma, ShoppingList } from '@prisma/client'
import {
  ShoppingListsRepository,
  ShoppingListWithAveragePrice,
} from '../shopping-lists-repository'
import { Decimal } from '@prisma/client/runtime/library'

export class InMemoryShoppingListsRepository
  implements ShoppingListsRepository
{
  public items: ShoppingList[] = []
  public shoppingListItems: Array<{
    id: number
    shopping_list_id: number
    product_id: number
    product: {
      id: number
      name: string
      unit_of_measure: string
      couple_id: number
    }
    quantity: number
    unit_price: Decimal | null
    is_checked: boolean
    author_id: number
    created_at: Date
    updated_at: Date
  }> = []

  async create(data: Prisma.ShoppingListUncheckedCreateInput) {
    const list: ShoppingList = {
      id: this.items.length + 1,
      name: data.name ?? null,
      couple_id: data.couple_id,
      author_id: data.author_id,
      created_at: new Date(),
      updated_at: new Date(),
      closed_at: null,
    }

    this.items.push(list)

    return list
  }

  async listByCoupleId(coupleId: number) {
    return this.items.filter((item) => item.couple_id === coupleId)
  }

  async findById(id: number) {
    const list = this.items.find((item) => item.id === id)

    if (!list) {
      return null
    }

    const items = this.shoppingListItems
      .filter((item) => item.shopping_list_id === id)
      .map((item) => ({
        ...item,
        average_price: item.unit_price,
      }))

    return {
      ...list,
      ShoppingListItem: items,
    } as ShoppingListWithAveragePrice
  }

  async update(id: number, data: Prisma.ShoppingListUncheckedUpdateInput) {
    const index = this.items.findIndex((item) => item.id === id)

    if (index === -1) {
      throw new Error('Shopping list not found')
    }

    const currentList = this.items[index]

    const updatedList: ShoppingList = {
      ...currentList,
      name:
        data.name !== undefined
          ? (data.name as string | null)
          : currentList.name,
      closed_at:
        data.closed_at !== undefined
          ? data.closed_at
            ? new Date(data.closed_at as Date)
            : null
          : currentList.closed_at,
      updated_at: new Date(),
    }

    this.items[index] = updatedList

    return updatedList
  }

  async deleteById(id: number) {
    const index = this.items.findIndex((item) => item.id === id)

    if (index >= 0) {
      this.items.splice(index, 1)
    }
  }
}
