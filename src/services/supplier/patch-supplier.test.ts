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

  it("deve cobrir métodos auxiliares do InMemorySupplierRepository", async () => {
    const s1 = await supplierRepository.create({
      social_name: "Fornecedor Social 1",
      company_name: "Empresa 1 LTDA",
      phone_number: "1111111111",
      cnpj: "11111111111111",
    });

    const s2 = await supplierRepository.create({
      social_name: "Fornecedor Social 2",
      company_name: "Empresa 2 LTDA",
      phone_number: "2222222222",
      cnpj: "22222222222222",
    });

    // findMany
    const all = await supplierRepository.findMany();
    expect(all.length).toBe(2);

    // findManyByCompanyName
    const byCompany = await supplierRepository.findManyByCompanyName("Empresa 1");
    expect(byCompany).toContainEqual(s1);

    // findManyBySocialName
    const bySocial = await supplierRepository.findManyBySocialName("Social 2");
    expect(bySocial).toContainEqual(s2);

    // findById
    const found = await supplierRepository.findById(s2.id);
    expect(found).toEqual(s2);

    // patch
    const patched = await supplierRepository.patch(s1.id, { phone_number: "9999999999" });
    expect(patched?.phone_number).toBe("9999999999");

    // delete
    const deleted = await supplierRepository.delete(s1.id);
    expect(deleted?.id).toBe(s1.id);
  });
});
