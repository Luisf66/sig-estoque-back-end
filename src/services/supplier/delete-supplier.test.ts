// tests/unit/delete-supplier-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteSupplierService } from '../../services/supplier/delete-supplier';
import { NoRecordsFoundError } from '../../services/errors/no-records-found-error';

describe('DeleteSupplierService', () => {
  const mockSupplierRepository = {
    delete: vi.fn(),
  };

  let deleteSupplierService: DeleteSupplierService;

  beforeEach(() => {
    vi.clearAllMocks();
    deleteSupplierService = new DeleteSupplierService(mockSupplierRepository);
  });

  it('should delete a supplier successfully', async () => {
    // Arrange
    const supplierId = '1';
    const mockDeletedSupplier = { id: supplierId };
    mockSupplierRepository.delete.mockResolvedValue(mockDeletedSupplier);

    // Act
    await deleteSupplierService.execute({ id: supplierId });

    // Assert
    expect(mockSupplierRepository.delete).toHaveBeenCalledWith(supplierId);
  });

  it('should throw NoRecordsFoundError when supplier does not exist', async () => {
    // Arrange
    const supplierId = 'non-existent-id';
    mockSupplierRepository.delete.mockResolvedValue(null);

    // Act & Assert
    await expect(deleteSupplierService.execute({ id: supplierId }))
      .rejects
      .toThrow(NoRecordsFoundError);
  });
});