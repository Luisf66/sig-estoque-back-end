import { describe, it, expect, vi, beforeEach } from "vitest";
import { FetchAllSupplierService } from "./fetch-all-supplier";
import { SupplierRepository } from "../../repositories/supplier-repository";
import { Supplier } from "@prisma/client";

describe("FetchAllSupplierService", () => {
  let supplierRepository: SupplierRepository;
  let fetchAllSupplierService: FetchAllSupplierService;

  beforeEach(() => {
    supplierRepository = {
      findMany: vi.fn(),
    } as unknown as SupplierRepository;

    fetchAllSupplierService = new FetchAllSupplierService(supplierRepository);
  });

  it("deve retornar todos os fornecedores", async () => {
    const mockSuppliers: Supplier[] = [
      {
        id: "supplier-1",
        social_name: "Fornecedor 1",
        company_name: "Empresa 1",
        phone_number: "123456789",
        cnpj: "12345678000100",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "supplier-2",
        social_name: "Fornecedor 2",
        company_name: "Empresa 2",
        phone_number: "987654321",
        cnpj: "98765432000100",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.spyOn(supplierRepository, "findMany").mockResolvedValue(mockSuppliers);

    const response = await fetchAllSupplierService.execute();

    expect(supplierRepository.findMany).toHaveBeenCalledTimes(1);
    expect(response.supplier).toEqual(mockSuppliers);
  });

  it("deve retornar um array vazio se não houver fornecedores", async () => {
    vi.spyOn(supplierRepository, "findMany").mockResolvedValue([]);

    const response = await fetchAllSupplierService.execute();

    expect(supplierRepository.findMany).toHaveBeenCalledTimes(1);
    expect(response.supplier).toEqual([]);
  });
});
