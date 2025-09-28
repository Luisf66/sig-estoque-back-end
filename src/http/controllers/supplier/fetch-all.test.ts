// src/http/controllers/supplier/fetch-all.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { fetchAllSupplier } from './fetch-all';
import * as makeFetchAllSupplierServiceModule from '../../../services/factories/supplier/make-fetch-all-supplier-service';

describe('fetchAllSupplier Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  const codeMock = vi.fn().mockReturnThis();
  const sendMock = vi.fn().mockReturnThis();

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {};

    mockReply = {
      code: codeMock,
      send: sendMock,
    };
  });

  it('deve retornar 200 e a lista de fornecedores com sucesso', async () => {
    const executeMock = vi.fn().mockResolvedValue({
      supplier: [
        { id: '1', social_name: 'Fornecedor A' },
        { id: '2', social_name: 'Fornecedor B' },
      ],
    });

    vi.spyOn(makeFetchAllSupplierServiceModule, 'makeFetchAllSupplierService').mockReturnValue({
      execute: executeMock,
    } as any);

    await fetchAllSupplier(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(executeMock).toHaveBeenCalled();
    expect(codeMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({
      supplier: [
        { id: '1', social_name: 'Fornecedor A' },
        { id: '2', social_name: 'Fornecedor B' },
      ],
    });
  });

  it('deve lançar erro se o serviço falhar', async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error('Erro interno'));

    vi.spyOn(makeFetchAllSupplierServiceModule, 'makeFetchAllSupplierService').mockReturnValue({
      execute: executeMock,
    } as any);

    await expect(
      fetchAllSupplier(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow('Erro interno');

    expect(executeMock).toHaveBeenCalled();
  });
});
