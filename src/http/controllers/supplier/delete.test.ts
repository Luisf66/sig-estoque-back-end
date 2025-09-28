// src/http/controllers/supplier/delete.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { deleteSupplier } from './delete';
import * as makeDeleteSupplierServiceModule from '../../../services/factories/supplier/make-delete-supplier-service';

describe('deleteSupplier Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  const mockCode = vi.fn().mockReturnThis();
  const mockSend = vi.fn().mockReturnThis();

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      params: { id: 'supplier-123' },
    };

    mockReply = {
      code: mockCode,
      send: mockSend,
    };
  });

  it('deve deletar um fornecedor com sucesso e retornar 204', async () => {
    const executeMock = vi.fn().mockResolvedValue(undefined);

    vi.spyOn(makeDeleteSupplierServiceModule, 'makeDeleteSupplierService').mockReturnValue({
      execute: executeMock,
    } as any);

    await deleteSupplier(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(executeMock).toHaveBeenCalledWith({ id: 'supplier-123' });
    expect(mockCode).toHaveBeenCalledWith(204);
    expect(mockSend).toHaveBeenCalled();
  });

  it('deve lançar erro se o serviço falhar (erro interno)', async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error('Erro interno'));

    vi.spyOn(makeDeleteSupplierServiceModule, 'makeDeleteSupplierService').mockReturnValue({
      execute: executeMock,
    } as any);

    // Captura a exceção para evitar que o teste falhe
    await expect(
      deleteSupplier(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow('Erro interno');

    expect(executeMock).toHaveBeenCalledWith({ id: 'supplier-123' });
  });
});
