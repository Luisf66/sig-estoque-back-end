import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { deleteSupplier } from './delete'; // Ajuste o caminho

// Mock da factory que cria o service
const deleteSupplierServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/supplier/make-delete-supplier-service', () => {
  return {
    makeDeleteSupplierService: () => deleteSupplierServiceMock,
  };
});

describe('Delete Supplier Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  const supplierId = 'supplier-id-123';

  beforeEach(() => {
    request = {
      params: { id: supplierId },
    };

    reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should delete a supplier and return status 204', async () => {
    // Arrange
    deleteSupplierServiceMock.execute.mockResolvedValue(undefined);

    // Act
    await deleteSupplier(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(deleteSupplierServiceMock.execute).toHaveBeenCalledWith({ id: supplierId });
    expect(reply.code).toHaveBeenCalledWith(204);
    expect(reply.send).toHaveBeenCalled();
  });

  it('should throw an error if the service fails', async () => {
    // Arrange
    const serviceError = new Error('Supplier not found');
    deleteSupplierServiceMock.execute.mockRejectedValue(serviceError);

    // Act & Assert
    // Verifica se a chamada ao controller rejeita a promessa com o erro esperado
    await expect(
      deleteSupplier(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow('Supplier not found');
  });
});