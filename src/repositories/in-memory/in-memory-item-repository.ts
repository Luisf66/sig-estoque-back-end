import { ItemRepository } from "../item-repository";
import { Item, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

export class InMemoryItemRepository implements ItemRepository {
  private items: Item[] = [];

  async create(data: Prisma.ItemCreateInput): Promise<Item> {
    // Verifica se o productId está presente
    if (!data.product.connect?.id) {
      throw new Error("productId is required.");
    }

    const item: Item = {
      id: randomUUID(),
      quantity: data.quantity,
      value: data.value,
      saleId: data.sale?.connect?.id ?? null,
      purchaseId: data.purchase?.connect?.id ?? null,
      productId: data.product.connect.id, // Aqui é garantido que o productId não é undefined
    };

    this.items.push(item);

    return item;
  }

  async delete(id: string): Promise<Item | null> {
    const itemIndex = this.items.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return null;
    }

    const deletedItem = this.items[itemIndex];
    this.items.splice(itemIndex, 1);

    return deletedItem;
  }
}
