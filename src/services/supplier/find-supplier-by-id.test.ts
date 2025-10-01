import { describe, it, expect, beforeEach } from "vitest";
import { FindSupplierByIdService } from "./find-supplier-by-id";
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
}

describe("FindSupplierByIdService", () => {
  let supplierRepository: InMemorySupplierRepository;
  let sut: FindSupplierByIdService;

  beforeEach(() => {
    supplierRepository = new InMemorySupplierRepository();
    sut = new FindSupplierByIdService(supplierRepository);
  });

  it("deve retornar um fornecedor ao buscar por ID válido", async () => {
    const createdSupplier = await supplierRepository.create({
      social_name: "Fornecedor Social",
      company_name: "Empresa Fornecedor LTDA",
      phone_number: "11999999999",
      cnpj: "12345678900000",
    });

    const { supplier } = await sut.execute({ supplierId: createdSupplier.id });

    expect(supplier).toEqual(createdSupplier);
  });

  it("deve lançar NoRecordsFoundError ao buscar um ID inexistente", async () => {
    await expect(() =>
      sut.execute({ supplierId: "id-invalido" })
    ).rejects.toBeInstanceOf(NoRecordsFoundError);
  });
});
