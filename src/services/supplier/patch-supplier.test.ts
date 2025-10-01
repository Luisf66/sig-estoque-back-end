import { describe, it, expect, beforeEach } from "vitest";
import { PatchSupplierService } from "./patch-supplier";
import { NoRecordsFoundError } from "../errors/no-records-found-error";
import { SupplierRepository } from "../../repositories/supplier-repository";

class InMemorySupplierRepository implements SupplierRepository {
  public items: any[] = [];

  async create(data: any) {
    const supplier = { id: crypto.randomUUID(), ...data };
    this.items.push(supplier);
    return supplier;
  }

  async delete(id: string) {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return null;
    const [deleted] = this.items.splice(index, 1);
    return deleted;
  }

  async findMany() {
    return this.items;
  }

  async findManyByCompanyName(companyName: string) {
    return this.items.filter(item => item.company_name.includes(companyName));
  }

  async findManyBySocialName(socialName: string) {
    return this.items.filter(item => item.social_name.includes(socialName));
  }

  async findById(id: string) {
    return this.items.find(item => item.id === id) ?? null;
  }

  async patch(id: string, data: any) {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return null;
    this.items[index] = { ...this.items[index], ...data };
    return this.items[index];
  }
}

describe("PatchSupplierService", () => {
  let supplierRepository: InMemorySupplierRepository;
  let sut: PatchSupplierService;

  beforeEach(() => {
    supplierRepository = new InMemorySupplierRepository();
    sut = new PatchSupplierService(supplierRepository);
  });

  it("deve atualizar parcialmente os dados de um fornecedor existente", async () => {
    const createdSupplier = await supplierRepository.create({
      social_name: "Fornecedor Original",
      company_name: "Empresa Original LTDA",
      phone_number: "11999999999",
      cnpj: "12345678900000",
    });

    const { supplier } = await sut.handle({
      id: createdSupplier.id,
      data: {
        company_name: "Empresa Atualizada LTDA",
      },
    });

    expect(supplier).not.toBeNull();
    expect(supplier?.company_name).toBe("Empresa Atualizada LTDA");
    expect(supplier?.social_name).toBe("Fornecedor Original");
  });

  it("deve lançar NoRecordsFoundError ao tentar atualizar fornecedor inexistente", async () => {
    await expect(() =>
      sut.handle({
        id: "id-invalido",
        data: {
          company_name: "Novo Nome LTDA",
        },
      })
    ).rejects.toBeInstanceOf(NoRecordsFoundError);
  });
});
