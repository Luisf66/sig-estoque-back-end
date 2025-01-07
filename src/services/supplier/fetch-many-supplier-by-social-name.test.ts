import { describe, it, expect, vi, beforeEach } from "vitest";
import { FetchManySupplierBySocialNameService } from "./fetch-many-supplier-by-social-name";
import { SupplierRepository } from "../../repositories/supplier-repository";
import { NoRecordsFoundError } from "../errors/no-records-found-error";
import { Supplier } from "@prisma/client";

describe("FetchManySupplierBySocialNameService", () => {
  let supplierRepository: SupplierRepository;
  let fetchManySupplierBySocialNameService: FetchManySupplierBySocialNameService;

  beforeEach(() => {
    supplierRepository = {
      findManyBySocialName: vi.fn(),
    } as unknown as SupplierRepository;

    fetchManySupplierBySocialNameService = new FetchManySupplierBySocialNameService(supplierRepository);
  });

  it("deve retornar fornecedores correspondentes ao nome social", async () => {
    const mockSuppliers: Supplier[] = [
      {
        id: "supplier-1",
        social_name: "Fornecedor Social",
        company_name: "Empresa X",
        phone_number: "123456789",
        cnpj: "12345678000100",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "supplier-2",
        social_name: "Fornecedor Social",
        company_name: "Empresa Y",
        phone_number: "987654321",
        cnpj: "98765432000100",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.spyOn(supplierRepository, "findManyBySocialName").mockResolvedValue(mockSuppliers);

    const response = await fetchManySupplierBySocialNameService.execute({ socialName: "Fornecedor Social" });

    expect(supplierRepository.findManyBySocialName).toHaveBeenCalledTimes(1);
    expect(supplierRepository.findManyBySocialName).toHaveBeenCalledWith("Fornecedor Social");
    expect(response.suppliers).toEqual(mockSuppliers);
  });

  it("deve lançar um erro se nenhum fornecedor for encontrado", async () => {
    vi.spyOn(supplierRepository, "findManyBySocialName").mockResolvedValue([]);

    await expect(
      fetchManySupplierBySocialNameService.execute({ socialName: "Nome Inexistente" })
    ).rejects.toBeInstanceOf(NoRecordsFoundError);

    expect(supplierRepository.findManyBySocialName).toHaveBeenCalledTimes(1);
    expect(supplierRepository.findManyBySocialName).toHaveBeenCalledWith("Nome Inexistente");
  });
});
