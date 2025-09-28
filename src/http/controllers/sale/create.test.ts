// src/http/controllers/sale/create.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { createSale } from './create';
import { makeCreateSaleService } from '../../../services/factories/sale/make-create-sale-service';
import { ZodError } from 'zod';

vi.mock('../../../services/factories/sale/make-create-sale-service', () => {
  return {
    makeCreateSaleService: vi.fn(),
  };
});

describe('CreateSale Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let codeMock: ReturnType<typeof vi.fn>;
  let sendMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {};
    codeMock = vi.fn().mockReturnThis();
    sendMock = vi.fn().mockReturnThis();
    statusMock = vi.fn().mockReturnThis();

    mockReply = {
      code: codeMock,
      send: sendMock,
      status: statusMock,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deve criar uma venda com sucesso (201)', async () => {
    const handleMock = vi.fn().mockResolvedValue(undefined);

    (makeCreateSaleService as unknown as vi.Mock).mockReturnValue({
      handle: handleMock,
    });

    mockRequest.body = {
      nf_number: '12345',
      userId: 'user-1',
      items: [
        { productId: 'p1', quantity: 2, value: 100 },
        { productId: 'p2', quantity: 1, value: 50 },
      ],
    };

    await createSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(handleMock).toHaveBeenCalledWith({
      nf_number: '12345',
      userId: 'user-1',
      items: [
        { productId: 'p1', quantity: 2, value: 100 },
        { productId: 'p2', quantity: 1, value: 50 },
      ],
    });

    expect(statusMock).toHaveBeenCalledWith(201);
    expect(sendMock).toHaveBeenCalled();
  });

  it('deve retornar 400 se o corpo da requisição for inválido', async () => {
    mockRequest.body = {
      nf_number: 12345, // deveria ser string
      userId: 'user-1',
      items: 'não é um array',
    };

    await createSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(sendMock).toHaveBeenCalledWith({ message: 'Invalid request payload' });
  });

  it('deve retornar 500 em caso de erro inesperado', async () => {
    const handleMock = vi.fn().mockRejectedValue(new Error('Erro inesperado'));

    (makeCreateSaleService as unknown as vi.Mock).mockReturnValue({
      handle: handleMock,
    });

    mockRequest.body = {
      nf_number: '12345',
      userId: 'user-1',
      items: [
        { productId: 'p1', quantity: 2, value: 100 },
      ],
    };

    await createSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});
