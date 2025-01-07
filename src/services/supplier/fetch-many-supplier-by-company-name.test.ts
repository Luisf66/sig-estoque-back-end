import { describe, it, expect, vi, beforeEach } from "vitest";
import { FetchManySupplierByCompanyNameService } from "./fetch-many-supplier-by-company-name";
import { SupplierRepository } from "../../repositories/supplier-repository";
import { Supplier } from "@prisma/client";

describe("FetchManySupplierByCompanyNameService", () => {
  let supplierRepository: SupplierRepository;
  let fetchManySupplierByCompanyNameService: FetchManySupplierByCompanyNameService;

  beforeEach(() => {
    supplierRepository = {
      findManyByCompanyName: vi.fn(),
    } as unknown as SupplierRepository;

    fetchManySupplierByCompanyNameService = new FetchManySupplierByCompanyNameService(supplierRepository);
  });

  it("deve retornar fornecedores correspondentes ao nome da empresa", async () => {
    const mockSuppliers: Supplier[] = [
      {
        id: "supplier-1",
        social_name: "Fornecedor 1",
        company_name: "Empresa Alvo",
        phone_number: "123456789",
        cnpj: "12345678000100",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "supplier-2",
        social_name: "Fornecedor 2",
        company_name: "Empresa Alvo",
        phone_number: "987654321",
        cnpj: "98765432000100",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.spyOn(supplierRepository, "findManyByCompanyName").mockResolvedValue(mockSuppliers);

    const response = await fetchManySupplierByCompanyNameService.execute({ companyName: "Empresa Alvo" });

    expect(supplierRepository.findManyByCompanyName).toHaveBeenCalledTimes(1);
    expect(supplierRepository.findManyByCompanyName).toHaveBeenCalledWith("Empresa Alvo");
    expect(response.supplier).toEqual(mockSuppliers);
  });

  it("deve retornar um array vazio se nenhum fornecedor for encontrado", async () => {
    vi.spyOn(supplierRepository, "findManyByCompanyName").mockResolvedValue([]);

    const response = await fetchManySupplierByCompanyNameService.execute({ companyName: "Empresa Inexistente" });

    expect(supplierRepository.findManyByCompanyName).toHaveBeenCalledTimes(1);
    expect(supplierRepository.findManyByCompanyName).toHaveBeenCalledWith("Empresa Inexistente");
    expect(response.supplier).toEqual([]);
  });
});
