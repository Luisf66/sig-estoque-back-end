import { describe, it, expect, vi, beforeEach } from "vitest";
import { PatchSupplierService } from "./patch-supplier";
import { SupplierRepository } from "../../repositories/supplier-repository";
import { NoRecordsFoundError } from "../errors/no-records-found-error";
import { Supplier } from "@prisma/client";

describe("PatchSupplierService", () => {
  let supplierRepository: SupplierRepository;
  let patchSupplierService: PatchSupplierService;

  beforeEach(() => {
    supplierRepository = {
      findById: vi.fn(),
      patch: vi.fn(),
    } as unknown as SupplierRepository;

    patchSupplierService = new PatchSupplierService(supplierRepository);
  });

  it("deve atualizar e retornar o fornecedor quando encontrado", async () => {
    const mockSupplier: Supplier = {
      id: "supplier-1",
      social_name: "Fornecedor Atualizado",
      company_name: "Empresa Y",
      phone_number: "987654321",
      cnpj: "12345678000100",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateData = {
      social_name: "Fornecedor Atualizado",
    };

    vi.spyOn(supplierRepository, "findById").mockResolvedValue(mockSupplier);
    vi.spyOn(supplierRepository, "patch").mockResolvedValue(mockSupplier);

    const response = await patchSupplierService.handle({
      id: "supplier-1",
      data: updateData,
    });

    expect(supplierRepository.findById).toHaveBeenCalledTimes(1);
    expect(supplierRepository.findById).toHaveBeenCalledWith("supplier-1");

    expect(supplierRepository.patch).toHaveBeenCalledTimes(1);
    expect(supplierRepository.patch).toHaveBeenCalledWith("supplier-1", updateData);

    expect(response.supplier).toEqual(mockSupplier);
  });

  it("deve lançar um erro se o fornecedor não for encontrado", async () => {
    vi.spyOn(supplierRepository, "findById").mockResolvedValue(null);

    await expect(
      patchSupplierService.handle({
        id: "supplier-2",
        data: { social_name: "Fornecedor Não Encontrado" },
      })
    ).rejects.toBeInstanceOf(NoRecordsFoundError);

    expect(supplierRepository.findById).toHaveBeenCalledTimes(1);
    expect(supplierRepository.findById).toHaveBeenCalledWith("supplier-2");

    expect(supplierRepository.patch).not.toHaveBeenCalled();
  });
});
