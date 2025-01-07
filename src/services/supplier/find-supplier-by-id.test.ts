import { describe, it, expect, vi, beforeEach } from "vitest";
import { FindSupplierByIdService } from "./find-supplier-by-id";
import { SupplierRepository } from "../../repositories/supplier-repository";
import { NoRecordsFoundError } from "../errors/no-records-found-error";
import { Supplier } from "@prisma/client";

describe("FindSupplierByIdService", () => {
  let supplierRepository: SupplierRepository;
  let findSupplierByIdService: FindSupplierByIdService;

  beforeEach(() => {
    supplierRepository = {
      findById: vi.fn(),
    } as unknown as SupplierRepository;

    findSupplierByIdService = new FindSupplierByIdService(supplierRepository);
  });

  it("deve retornar um fornecedor quando encontrado pelo ID", async () => {
    const mockSupplier: Supplier = {
      id: "supplier-1",
      social_name: "Fornecedor Social",
      company_name: "Empresa X",
      phone_number: "123456789",
      cnpj: "12345678000100",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(supplierRepository, "findById").mockResolvedValue(mockSupplier);

    const response = await findSupplierByIdService.execute({ supplierId: "supplier-1" });

    expect(supplierRepository.findById).toHaveBeenCalledTimes(1);
    expect(supplierRepository.findById).toHaveBeenCalledWith("supplier-1");
    expect(response.supplier).toEqual(mockSupplier);
  });

  it("deve lançar um erro se o fornecedor não for encontrado", async () => {
    vi.spyOn(supplierRepository, "findById").mockResolvedValue(null);

    await expect(
      findSupplierByIdService.execute({ supplierId: "supplier-2" })
    ).rejects.toBeInstanceOf(NoRecordsFoundError);

    expect(supplierRepository.findById).toHaveBeenCalledTimes(1);
    expect(supplierRepository.findById).toHaveBeenCalledWith("supplier-2");
  });
});
