// src/http/controllers/supplier/find-by-id.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { findSupplierById } from './find-by-id';
import * as makeFindSupplierByIdModule from '../../../services/factories/supplier/make-find-supplier-by-id-service';

describe('findSupplierById Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let codeMock: ReturnType<typeof vi.fn>;
  let sendMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    codeMock = vi.fn().mockReturnThis();
    sendMock = vi.fn().mockReturnThis();

    mockRequest = {};
    mockReply = {
      code: codeMock,
      send: sendMock,
    };
  });

  it('deve retornar 200 e os dados do fornecedor quando encontrado', async () => {
    const executeMock = vi.fn().mockResolvedValue({
      supplier: { id: '1', company_name: 'Empresa X' },
    });

    vi.spyOn(
      makeFindSupplierByIdModule,
      'makeFindSupplierByIdService'
    ).mockReturnValue({
      execute: executeMock,
    } as any);

    mockRequest.params = { id: '1' };

    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(executeMock).toHaveBeenCalledWith({ supplierId: '1' });
    expect(codeMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({
      supplier: { id: '1', company_name: 'Empresa X' },
    });
  });

  it('deve retornar 500 se ocorrer um erro no serviço', async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error('Erro interno'));

    vi.spyOn(
      makeFindSupplierByIdModule,
      'makeFindSupplierByIdService'
    ).mockReturnValue({
      execute: executeMock,
    } as any);

    mockRequest.params = { id: '1' };

    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(executeMock).toHaveBeenCalledWith({ supplierId: '1' });
    expect(codeMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching the supplier',
      statusCode: 500,
    });
  });

  it('deve retornar 500 se o parâmetro id estiver ausente', async () => {
    const executeMock = vi.fn();

    vi.spyOn(
      makeFindSupplierByIdModule,
      'makeFindSupplierByIdService'
    ).mockReturnValue({
      execute: executeMock,
    } as any);

    mockRequest.params = {}; // sem id

    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(codeMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching the supplier',
      statusCode: 500,
    });
  });
});
