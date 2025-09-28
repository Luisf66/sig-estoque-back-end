// src/http/controllers/supplier/fetch-many-by-social-name.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { fetchManyBySocialName } from './fetch-many-by-social-name';
import * as makeFetchManySupplierBySocialNameModule from '../../../services/factories/supplier/make-fetch-many-by-social-name';

describe('fetchManyBySocialName Controller', () => {
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

  it('deve retornar 200 e os fornecedores filtrados pelo socialName', async () => {
    const executeMock = vi.fn().mockResolvedValue({
      supplier: [
        { id: '1', social_name: 'Social A' },
        { id: '2', social_name: 'Social A' },
      ],
    });

    vi.spyOn(
      makeFetchManySupplierBySocialNameModule,
      'makeFetchManySupplierBySocialNameService'
    ).mockReturnValue({
      execute: executeMock,
    } as any);

    mockRequest.params = { socialName: 'Social A' };

    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(executeMock).toHaveBeenCalledWith({ socialName: 'Social A' });
    expect(codeMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({
      supplier: [
        { id: '1', social_name: 'Social A' },
        { id: '2', social_name: 'Social A' },
      ],
    });
  });

  it('deve retornar 500 se ocorrer um erro no serviço', async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error('Erro interno'));

    vi.spyOn(
      makeFetchManySupplierBySocialNameModule,
      'makeFetchManySupplierBySocialNameService'
    ).mockReturnValue({
      execute: executeMock,
    } as any);

    mockRequest.params = { socialName: 'Social A' };

    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(executeMock).toHaveBeenCalledWith({ socialName: 'Social A' });
    expect(codeMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching suppliers',
      statusCode: 500,
    });
  });
});
