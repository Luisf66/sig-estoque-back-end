import { Purchase } from "@prisma/client";
import { PurchaseRepository } from "../purchase-repository";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

export class InMemoryPurchaseRepository implements PurchaseRepository {
  private purchases: Purchase[] = [];

  async create(data: Prisma.PurchaseCreateInput): Promise<Purchase> {
    const purchase: Purchase = {
      id: randomUUID(), // Use randomUUID para garantir um id único
      nf_number: data.nf_number,
      subTotal: data.subTotal ?? 0,
      userId: data.user.connect?.id ?? "", // use user.connect para pegar o ID do usuário
      supplierId: data.supplier.connect?.id ?? randomUUID(), // use supplier.connect para pegar o ID do fornecedor
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.purchases.push(purchase);
    return purchase;
  }

  async findById(id: string): Promise<Purchase | null> {
    const purchase = this.purchases.find((p) => p.id === id);
    return purchase ?? null;
  }

  async findManyByUserId(userId: string): Promise<Purchase[]> {
    return this.purchases.filter((p) => p.userId === userId);
  }

  async findManyBySupplierId(supplierId: string): Promise<Purchase[]> {
    return this.purchases.filter((p) => p.supplierId === supplierId);
  }

  async findMany(): Promise<Purchase[]> {
    return this.purchases;
  }
  

  async updateSubTotal(id: string, newSubTotal: number): Promise<Purchase> {
    const purchaseIndex = this.purchases.findIndex((p) => p.id === id);
    if (purchaseIndex === -1) {
      throw new Error("Purchase not found");
    }

    const updatedPurchase = {
      ...this.purchases[purchaseIndex],
      subTotal: newSubTotal,
      updatedAt: new Date(),
    };

    this.purchases[purchaseIndex] = updatedPurchase;
    return updatedPurchase;
  }
}
