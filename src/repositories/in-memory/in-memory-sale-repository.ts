import { SaleRepository } from "../sale-repository";
import { Sale, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

export class InMemorySaleRepository implements SaleRepository {
  private items: Sale[] = [];

  async create(data: Prisma.SaleCreateInput): Promise<Sale> {
    const now = new Date();

    // Criação de um novo objeto Sale baseado no SaleCreateInput
    const sale: Sale = {
      id: randomUUID(),
      sale_date: data.sale_date instanceof Date ? data.sale_date : now,
      nf_number: data.nf_number,
      subTotal: data.subTotal ?? 0,
      userId: data.user?.connect?.id ?? "", // Obtém o ID do usuário vinculado
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(sale);

    return sale;
  }

  async findById(id: string): Promise<Sale | null> {
    return this.items.find((sale) => sale.id === id) ?? null;
  }

  async findManyByUserId(userId: string): Promise<Sale[]> {
    return this.items.filter((sale) => sale.userId === userId);
  }

  async findMany(): Promise<Sale[]> {
    return this.items;
  }

  async updateSubTotal(id: string, newSubTotal: number): Promise<Sale> {
    const saleIndex = this.items.findIndex((sale) => sale.id === id);

    if (saleIndex === -1) {
      throw new Error("Sale not found");
    }

    // Atualiza o subTotal e updatedAt
    this.items[saleIndex] = {
      ...this.items[saleIndex],
      subTotal: newSubTotal,
      updatedAt: new Date(),
    };

    return this.items[saleIndex];
  }
}
