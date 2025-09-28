import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";
import { createSupplier } from "./create";
import { makeCreateSupplierService } from "../../../services/factories/supplier/make-create-supplier-service";
import { z } from "zod";

vi.mock("../../../services/factories/supplier/make-create-supplier-service", () => {
  return {
    makeCreateSupplierService: vi.fn(),
  };
});

describe("CreateSupplier Controller", () => {
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

  it("deve criar um fornecedor com sucesso (201)", async () => {
    const mockHandle = vi.fn().mockResolvedValue({
      supplier: {
        id: "sup-1",
        social_name: "Fornecedor LTDA",
        company_name: "Fornecedor Comércio",
        phone_number: "11999999999",
        cnpj: "12345678000199",
      },
    });

    (makeCreateSupplierService as unknown as vi.Mock).mockReturnValue({
      handle: mockHandle,
    });

    const mockRequest = {
      body: {
        social_name: "Fornecedor LTDA",
        company_name: "Fornecedor Comércio",
        phone_number: "11999999999",
        cnpj: "12345678000199",
      },
    } as Partial<FastifyRequest>;

    await createSupplier(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockHandle).toHaveBeenCalledWith({
      social_name: "Fornecedor LTDA",
      company_name: "Fornecedor Comércio",
      phone_number: "11999999999",
      cnpj: "12345678000199",
    });
    expect(codeMock).toHaveBeenCalledWith(201);
    expect(sendMock).toHaveBeenCalledWith({
      supplier: expect.objectContaining({
        id: "sup-1",
        social_name: "Fornecedor LTDA",
      }),
    });
  });

  it("deve retornar 400 se os dados forem inválidos (ZodError)", async () => {
    const mockRequest = {
      body: {
        // faltando campos obrigatórios
        social_name: 123, // tipo errado
      },
    } as Partial<FastifyRequest>;

    await createSupplier(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(codeMock).toHaveBeenCalledWith(400);
    expect(sendMock).toHaveBeenCalledWith({ message: "Invalid request data" });
  });

  it("deve retornar 500 se ocorrer um erro inesperado", async () => {
    const mockHandle = vi.fn().mockRejectedValue(new Error("Erro inesperado"));

    (makeCreateSupplierService as unknown as vi.Mock).mockReturnValue({
      handle: mockHandle,
    });

    const mockRequest = {
      body: {
        social_name: "Fornecedor LTDA",
        company_name: "Fornecedor Comércio",
        phone_number: "11999999999",
        cnpj: "12345678000199",
      },
    } as Partial<FastifyRequest>;

    await createSupplier(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(codeMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });
});
