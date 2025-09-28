// src/http/controllers/supplier/fetch-many-by-company-name.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { fetchManyByCompanyName } from './fetch-many-by-company-name';
import * as makeFetchManySupplierByCompanyNameModule from '../../../services/factories/supplier/make-fetch-many-by-company-name';

describe('fetchManyByCompanyName Controller', () => {
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

  it('deve retornar 200 e os fornecedores filtrados pelo companyName', async () => {
    const executeMock = vi.fn().mockResolvedValue({
      supplier: [
        { id: '1', company_name: 'Empresa A' },
        { id: '2', company_name: 'Empresa A' },
      ],
    });

    vi.spyOn(
      makeFetchManySupplierByCompanyNameModule,
      'makeFetchManySupplierByCompanyNameService'
    ).mockReturnValue({
      execute: executeMock,
    } as any);

    mockRequest.params = { companyName: 'Empresa A' };

    await fetchManyByCompanyName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(executeMock).toHaveBeenCalledWith({ companyName: 'Empresa A' });
    expect(codeMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({
      supplier: [
        { id: '1', company_name: 'Empresa A' },
        { id: '2', company_name: 'Empresa A' },
      ],
    });
  });

  it('deve retornar 500 se ocorrer um erro no serviço', async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error('Erro interno'));

    vi.spyOn(
      makeFetchManySupplierByCompanyNameModule,
      'makeFetchManySupplierByCompanyNameService'
    ).mockReturnValue({
      execute: executeMock,
    } as any);

    mockRequest.params = { companyName: 'Empresa A' };

    await fetchManyByCompanyName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(executeMock).toHaveBeenCalledWith({ companyName: 'Empresa A' });
    expect(codeMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching suppliers',
      statusCode: 500,
    });
  });
});
