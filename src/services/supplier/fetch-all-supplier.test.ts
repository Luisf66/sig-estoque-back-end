import { describe, it, expect, beforeEach } from "vitest";
import { FetchAllSupplierService } from "./fetch-all-supplier";
import { Supplier } from "@prisma/client";

// Repositório em memória simulado
class InMemorySupplierRepository {
  public items: Supplier[] = [];

  async create(data: Omit<Supplier, "id" | "createdAt" | "updatedAt">): Promise<Supplier> {
    const newSupplier: Supplier = {
      id: `supplier-${this.items.length + 1}`,
      social_name: data.social_name,
      company_name: data.company_name,
      phone_number: data.phone_number,
      cnpj: data.cnpj,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.push(newSupplier);
    return newSupplier;
  }

  async findMany(): Promise<Supplier[]> {
    return this.items;
  }
}

describe("FetchAllSupplierService", () => {
  let supplierRepository: InMemorySupplierRepository;
  let sut: FetchAllSupplierService;

  beforeEach(() => {
    supplierRepository = new InMemorySupplierRepository();
    sut = new FetchAllSupplierService(supplierRepository as any);
  });

  it("deve retornar uma lista de fornecedores cadastrados", async () => {
    const supplier1 = await supplierRepository.create({
      social_name: "Fornecedor A",
      company_name: "Fornecedor A LTDA",
      phone_number: "11999999999",
      cnpj: "12.345.678/0001-99",
    });

    const supplier2 = await supplierRepository.create({
      social_name: "Fornecedor B",
      company_name: "Fornecedor B LTDA",
      phone_number: "11888888888",
      cnpj: "98.765.432/0001-11",
    });

    const result = await sut.execute();

    expect(result.supplier).toHaveLength(2);
    expect(result.supplier).toEqual([supplier1, supplier2]);
  });

  it("deve retornar um array vazio se não houver fornecedores", async () => {
    const result = await sut.execute();

    expect(result.supplier).toEqual([]);
    expect(result.supplier).toHaveLength(0);
  });
});
