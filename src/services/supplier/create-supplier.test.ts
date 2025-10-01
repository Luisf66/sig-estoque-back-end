import { describe, it, expect, beforeEach } from "vitest";
import { CreateSupplierService } from "./create-supplier";
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
}

describe("CreateSupplierService", () => {
  let supplierRepository: InMemorySupplierRepository;
  let sut: CreateSupplierService;

  beforeEach(() => {
    supplierRepository = new InMemorySupplierRepository();
    sut = new CreateSupplierService(supplierRepository as any);
  });

  it("deve criar um novo fornecedor com os dados fornecidos", async () => {
    const supplierData = {
      social_name: "Fornecedor Social",
      company_name: "Fornecedor LTDA",
      phone_number: "11999999999",
      cnpj: "12.345.678/0001-99",
    };

    const { supplier } = await sut.handle(supplierData);

    expect(supplier).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        social_name: supplierData.social_name,
        company_name: supplierData.company_name,
        phone_number: supplierData.phone_number,
        cnpj: supplierData.cnpj,
      })
    );

    expect(supplierRepository.items).toHaveLength(1);
    expect(supplierRepository.items[0]).toEqual(supplier);
  });
});
