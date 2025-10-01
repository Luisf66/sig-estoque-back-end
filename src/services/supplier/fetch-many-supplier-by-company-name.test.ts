import { describe, it, expect, beforeEach } from "vitest";
import { FetchManySupplierByCompanyNameService } from "./fetch-many-supplier-by-company-name";
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

  async findManyByCompanyName(companyName: string): Promise<Supplier[]> {
    return this.items.filter((supplier) =>
      supplier.company_name.toLowerCase().includes(companyName.toLowerCase())
    );
  }
}

describe("FetchManySupplierByCompanyNameService", () => {
  let supplierRepository: InMemorySupplierRepository;
  let sut: FetchManySupplierByCompanyNameService;

  beforeEach(() => {
    supplierRepository = new InMemorySupplierRepository();
    sut = new FetchManySupplierByCompanyNameService(supplierRepository as any);
  });

  it("deve retornar fornecedores que contenham parte do nome da empresa", async () => {
    const supplier1 = await supplierRepository.create({
      social_name: "Fornecedor A",
      company_name: "Empresa Alpha LTDA",
      phone_number: "11999999999",
      cnpj: "12.345.678/0001-99",
    });

    const supplier2 = await supplierRepository.create({
      social_name: "Fornecedor B",
      company_name: "Empresa Beta LTDA",
      phone_number: "11888888888",
      cnpj: "98.765.432/0001-11",
    });

    const supplier3 = await supplierRepository.create({
      social_name: "Fornecedor C",
      company_name: "Gamma Indústria",
      phone_number: "11777777777",
      cnpj: "11.222.333/0001-55",
    });

    const result = await sut.execute({ companyName: "empresa" });

    expect(result.supplier).toHaveLength(2);
    expect(result.supplier).toEqual([supplier1, supplier2]);
  });

  it("deve retornar um array vazio se nenhum fornecedor corresponder", async () => {
    await supplierRepository.create({
      social_name: "Fornecedor X",
      company_name: "Outra Companhia",
      phone_number: "11666666666",
      cnpj: "55.666.777/0001-00",
    });

    const result = await sut.execute({ companyName: "Inexistente" });

    expect(result.supplier).toEqual([]);
    expect(result.supplier).toHaveLength(0);
  });
});
