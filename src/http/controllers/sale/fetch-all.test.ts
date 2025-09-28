import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { fetchAllSale } from './fetch-all';
import { makeFetchAllSaleService } from '../../../services/factories/sale/make-fetch-all-sale-service';

vi.mock('../../../services/factories/sale/make-fetch-all-sale-service', () => {
  return {
    makeFetchAllSaleService: vi.fn(),
  };
});

describe('FetchAllSale Controller', () => {
  let codeMock: ReturnType<typeof vi.fn>;
  let sendMock: ReturnType<typeof vi.fn>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
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

  it('deve retornar todas as vendas com sucesso (200)', async () => {
    const executeMock = vi.fn().mockResolvedValue({
      sale: [
        { id: 'sale-1', nf_number: '12345', userId: 'user-1' },
        { id: 'sale-2', nf_number: '67890', userId: 'user-2' },
      ],
    });

    (makeFetchAllSaleService as unknown as vi.Mock).mockReturnValue({
      execute: executeMock,
    });

    await fetchAllSale({} as FastifyRequest, mockReply as FastifyReply);

    expect(executeMock).toHaveBeenCalled();
    expect(codeMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({
      sale: [
        { id: 'sale-1', nf_number: '12345', userId: 'user-1' },
        { id: 'sale-2', nf_number: '67890', userId: 'user-2' },
      ],
    });
  });

  it('deve retornar 500 em caso de erro inesperado', async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error('Erro inesperado'));

    (makeFetchAllSaleService as unknown as vi.Mock).mockReturnValue({
      execute: executeMock,
    });

    await fetchAllSale({} as FastifyRequest, mockReply as FastifyReply);

    expect(executeMock).toHaveBeenCalled();
    expect(codeMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});
