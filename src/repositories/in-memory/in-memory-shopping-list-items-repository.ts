import { Prisma, ShoppingListItem } from '@prisma/client'
import { ShoppingListItemsRepository } from '../shopping-list-items-repository'
import { Decimal } from '@prisma/client/runtime/library'

export class InMemoryShoppingListItemsRepository
  implements ShoppingListItemsRepository
{
  public items: ShoppingListItem[] = []

  async create(data: Prisma.ShoppingListItemUncheckedCreateInput) {
    const item: ShoppingListItem = {
      id: this.items.length + 1,
      is_checked: data.is_checked ?? false,
      product_id: data.product_id,
      shopping_list_id: data.shopping_list_id,
      author_id: data.author_id,
      quantity: data.quantity ?? 1,
      unit_price: data.unit_price
        ? new Decimal(data.unit_price.toString())
        : null,
      created_at: new Date(),
      updated_at: new Date(),
    }

    this.items.push(item)

    return item
  }

  async findById(id: number) {
    const item = this.items.find((item) => item.id === id)

    return item || null
  }

  async save(data: ShoppingListItem) {
    const index = this.items.findIndex((item) => item.id === data.id)

    if (index >= 0) {
      this.items[index] = { ...data, updated_at: new Date() }
      return this.items[index]
    }

    this.items.push(data)
    return data
  }

  async findManyByIds(ids: number[]) {
    return this.items.filter((item) => ids.includes(item.id))
  }
}
