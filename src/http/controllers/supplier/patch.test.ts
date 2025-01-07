import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { patchSupplier } from "./patch";
import { makePatchSupplierService } from "../../../services/factories/supplier/make-patch-supplier-service";
import { FastifyRequest, FastifyReply } from "fastify";

vi.mock("../../../services/factories/supplier/make-patch-supplier-service");

describe("patchSupplier Controller", () => {
  let mockPatchSupplierService: { handle: vi.Mock };

  beforeEach(() => {
    mockPatchSupplierService = {
      handle: vi.fn().mockResolvedValue({
        supplier: {
          id: "supplier-1",
          social_name: "Updated Social Name",
          company_name: "Updated Company Name",
          phone_number: "987654321",
          cnpj: "11111111000111",
        },
      }),
    };

    vi.mocked(makePatchSupplierService).mockReturnValue(mockPatchSupplierService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve atualizar um fornecedor com sucesso e retornar status 200", async () => {
    const request = {
      params: { id: "supplier-1" },
      body: {
        social_name: "Updated Social Name",
        company_name: "Updated Company Name",
        phone_number: "987654321",
        cnpj: "11111111000111",
      },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await patchSupplier(request, reply);

    expect(mockPatchSupplierService.handle).toHaveBeenCalledWith({
      id: "supplier-1",
      data: {
        social_name: "Updated Social Name",
        company_name: "Updated Company Name",
        phone_number: "987654321",
        cnpj: "11111111000111",
      },
    });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      supplier: {
        id: "supplier-1",
        social_name: "Updated Social Name",
        company_name: "Updated Company Name",
        phone_number: "987654321",
        cnpj: "11111111000111",
      },
    });
  });

  it("deve retornar erro 400 para dados de entrada inválidos", async () => {
    const request = {
      params: { id: "supplier-1" },
      body: {
        social_name: 123, // Dado inválido
      },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await patchSupplier(request, reply);

    expect(reply.code).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      statusCode: 400,
      error: "Bad Request",
      message: "Invalid input",
    });
  });

  it("deve retornar erro 500 em caso de falha no serviço", async () => {
    mockPatchSupplierService.handle.mockRejectedValue(new Error("Erro ao atualizar fornecedor"));

    const request = {
      params: { id: "supplier-1" },
      body: {
        social_name: "Updated Social Name",
        company_name: "Updated Company Name",
        phone_number: "987654321",
        cnpj: "11111111000111",
      },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await patchSupplier(request, reply);

    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An error occurred while updating the supplier",
    });
  });
});
