// src/http/controllers/sale/fetch-all-by-user-id.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { fetchAllSaleByUserId } from './fetch-all-by-user-id';
import { makeFetchAllSaleByUserIdService } from '../../../services/factories/sale/make-fetch-all-sale-by-user-id';

vi.mock('../../../services/factories/sale/make-fetch-all-sale-by-user-id', () => {
  return {
    makeFetchAllSaleByUserIdService: vi.fn(),
  };
});

describe('FetchAllSaleByUserId Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let codeMock: ReturnType<typeof vi.fn>;
  let sendMock: ReturnType<typeof vi.fn>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {};
    codeMock = vi.fn().mockReturnThis();
    sendMock = vi.fn().mockReturnThis();

    mockReply = {
      code: codeMock,
      send: sendMock,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar todas as vendas de um usuário com sucesso (200)', async () => {
    const executeMock = vi.fn().mockResolvedValue({
      sales: [
        { id: 'sale-1', nf_number: '12345', userId: 'user-1' },
        { id: 'sale-2', nf_number: '67890', userId: 'user-1' },
      ],
    });

    (makeFetchAllSaleByUserIdService as unknown as vi.Mock).mockReturnValue({
      execute: executeMock,
    });

    mockRequest.params = { userId: 'user-1' };

    await fetchAllSaleByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(executeMock).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(codeMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({
      sales: [
        { id: 'sale-1', nf_number: '12345', userId: 'user-1' },
        { id: 'sale-2', nf_number: '67890', userId: 'user-1' },
      ],
    });
  });

  it('deve retornar 500 em caso de erro inesperado', async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error('Erro inesperado'));

    (makeFetchAllSaleByUserIdService as unknown as vi.Mock).mockReturnValue({
      execute: executeMock,
    });

    mockRequest.params = { userId: 'user-1' };

    await fetchAllSaleByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(executeMock).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(codeMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });

  it('deve retornar 500 se o userId estiver ausente', async () => {
    const mockRequest = {
      params: {}, // sem userId
    } as any;

    const mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await fetchAllSaleByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});
