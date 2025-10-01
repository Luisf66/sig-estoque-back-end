import { describe, it, expect, beforeEach } from "vitest";
import { FetchManySupplierBySocialNameService } from "./fetch-many-supplier-by-social-name";
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

  async findManyBySocialName(socialName: string): Promise<Supplier[]> {
    return this.items.filter((supplier) =>
      supplier.social_name.toLowerCase().includes(socialName.toLowerCase())
    );
  }
}

describe("FetchManySupplierBySocialNameService", () => {
  let supplierRepository: InMemorySupplierRepository;
  let sut: FetchManySupplierBySocialNameService;

  beforeEach(() => {
    supplierRepository = new InMemorySupplierRepository();
    sut = new FetchManySupplierBySocialNameService(supplierRepository as any);
  });

  it("deve retornar fornecedores que contenham parte do nome social", async () => {
    const supplier1 = await supplierRepository.create({
      social_name: "Fornecedor Alpha",
      company_name: "Empresa A",
      phone_number: "11999999999",
      cnpj: "12.345.678/0001-99",
    });

    const supplier2 = await supplierRepository.create({
      social_name: "Fornecedor Beta",
      company_name: "Empresa B",
      phone_number: "11888888888",
      cnpj: "98.765.432/0001-11",
    });

    const supplier3 = await supplierRepository.create({
      social_name: "Outro Nome",
      company_name: "Empresa C",
      phone_number: "11777777777",
      cnpj: "11.222.333/0001-55",
    });

    const result = await sut.execute({ socialName: "fornecedor" });

    expect(result.suppliers).toHaveLength(2);
    expect(result.suppliers).toEqual([supplier1, supplier2]);
  });

  it("deve lançar NoRecordsFoundError se nenhum fornecedor corresponder ao nome social", async () => {
    await supplierRepository.create({
      social_name: "Nome Existente",
      company_name: "Empresa X",
      phone_number: "11666666666",
      cnpj: "55.666.777/0001-00",
    });

    await expect(
      sut.execute({ socialName: "Inexistente" })
    ).rejects.toBeInstanceOf(NoRecordsFoundError);
  });
});
