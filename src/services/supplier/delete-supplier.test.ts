import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteSupplierService } from "./delete-supplier";
import { SupplierRepository } from "../../repositories/supplier-repository";
import { NoRecordsFoundError } from "../errors/no-records-found-error";

describe("DeleteSupplierService", () => {
  let mockSupplierRepository: SupplierRepository;
  let deleteSupplierService: DeleteSupplierService;

  beforeEach(() => {
    mockSupplierRepository = {
      delete: vi.fn(),
    } as unknown as SupplierRepository;

    deleteSupplierService = new DeleteSupplierService(mockSupplierRepository);
  });

  it("deve deletar o fornecedor quando o ID for válido", async () => {
    const supplierId = "supplier-1";

    vi.spyOn(mockSupplierRepository, "delete").mockResolvedValue({ id: supplierId });

    await deleteSupplierService.execute({ id: supplierId });

    expect(mockSupplierRepository.delete).toHaveBeenCalledWith(supplierId);
  });

  it("deve lançar NoRecordsFoundError quando o fornecedor não for encontrado", async () => {
    const supplierId = "invalid-supplier";

    vi.spyOn(mockSupplierRepository, "delete").mockResolvedValue(null);

    await expect(deleteSupplierService.execute({ id: supplierId })).rejects.toThrow(NoRecordsFoundError);
    expect(mockSupplierRepository.delete).toHaveBeenCalledWith(supplierId);
  });
});
