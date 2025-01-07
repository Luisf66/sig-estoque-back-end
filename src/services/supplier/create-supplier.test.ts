import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateSupplierService } from "./create-supplier";
import { SupplierRepository } from "../../repositories/supplier-repository";

describe("CreateSupplierService", () => {
  let mockSupplierRepository: SupplierRepository;
  let createSupplierService: CreateSupplierService;

  beforeEach(() => {
    mockSupplierRepository = {
      create: vi.fn(),
    } as unknown as SupplierRepository;

    createSupplierService = new CreateSupplierService(mockSupplierRepository);
  });

  it("deve criar um novo fornecedor com os dados fornecidos", async () => {
    const mockSupplier = {
      id: "supplier-1",
      social_name: "Fornecedor Social",
      company_name: "Fornecedor Ltda",
      phone_number: "123456789",
      cnpj: "12345678000190",
    };

    vi.spyOn(mockSupplierRepository, "create").mockResolvedValue(mockSupplier);

    const result = await createSupplierService.handle({
      social_name: "Fornecedor Social",
      company_name: "Fornecedor Ltda",
      phone_number: "123456789",
      cnpj: "12345678000190",
    });

    expect(mockSupplierRepository.create).toHaveBeenCalledWith({
      social_name: "Fornecedor Social",
      company_name: "Fornecedor Ltda",
      phone_number: "123456789",
      cnpj: "12345678000190",
    });
    expect(result).toEqual({ supplier: mockSupplier });
  });
});
