import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { findSupplierById } from "./find-by-id";
import { makeFindSupplierByIdService } from "../../../services/factories/supplier/make-find-supplier-by-id-service";
import { FastifyRequest, FastifyReply } from "fastify";

vi.mock("../../../services/factories/supplier/make-find-supplier-by-id-service");

describe("findSupplierById Controller", () => {
  let mockFindSupplierByIdService: { execute: vi.Mock };

  beforeEach(() => {
    mockFindSupplierByIdService = {
      execute: vi.fn().mockResolvedValue({
        supplier: {
          id: "supplier-1",
          social_name: "Social Name",
          company_name: "Company Name",
          phone_number: "123456789",
          cnpj: "11111111000111",
        },
      }),
    };

    vi.mocked(makeFindSupplierByIdService).mockReturnValue(mockFindSupplierByIdService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar o fornecedor pelo ID com status 200", async () => {
    const request = {
      params: { id: "supplier-1" },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await findSupplierById(request, reply);

    expect(mockFindSupplierByIdService.execute).toHaveBeenCalledWith({
      supplierId: "supplier-1",
    });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      supplier: {
        id: "supplier-1",
        social_name: "Social Name",
        company_name: "Company Name",
        phone_number: "123456789",
        cnpj: "11111111000111",
      },
    });
  });

  it("deve retornar erro 500 em caso de falha", async () => {
    mockFindSupplierByIdService.execute.mockRejectedValue(new Error("Erro ao buscar fornecedor"));

    const request = {
      params: { id: "supplier-1" },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await findSupplierById(request, reply);

    expect(mockFindSupplierByIdService.execute).toHaveBeenCalledWith({
      supplierId: "supplier-1",
    });
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      error: "Internal Server Error",
      message: "An error occurred while fetching the supplier",
      statusCode: 500,
    });
  });
});
