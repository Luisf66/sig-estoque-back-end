import { describe, it, expect, beforeEach } from "vitest";
import { DeleteSupplierService } from "./delete-supplier";
import { NoRecordsFoundError } from "../errors/no-records-found-error";
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

  async delete(id: string): Promise<Supplier | null> {
    const index = this.items.findIndex((supplier) => supplier.id === id);
    if (index === -1) {
      return null;
    }

    const [deleted] = this.items.splice(index, 1);
    return deleted;
  }
}

describe("DeleteSupplierService", () => {
  let supplierRepository: InMemorySupplierRepository;
  let sut: DeleteSupplierService;

  beforeEach(() => {
    supplierRepository = new InMemorySupplierRepository();
    sut = new DeleteSupplierService(supplierRepository as any);
  });

  it("deve deletar um fornecedor existente pelo ID", async () => {
    const supplier = await supplierRepository.create({
      social_name: "Fornecedor Teste",
      company_name: "Fornecedor LTDA",
      phone_number: "11999999999",
      cnpj: "12.345.678/0001-99",
    });

    await sut.execute({ id: supplier.id });

    expect(supplierRepository.items).toHaveLength(0);
  });

  it("deve lançar NoRecordsFoundError ao tentar deletar um fornecedor inexistente", async () => {
    await expect(
      sut.execute({ id: "supplier-inexistente" })
    ).rejects.toBeInstanceOf(NoRecordsFoundError);

    expect(supplierRepository.items).toHaveLength(0);
  });
});
