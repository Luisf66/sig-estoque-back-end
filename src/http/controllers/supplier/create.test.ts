import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createSupplier } from "./create";
import { makeCreateSupplierService } from "../../../services/factories/supplier/make-create-supplier-service";
import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod"; // Importar o Zod para simular o erro

vi.mock("../../../services/factories/supplier/make-create-supplier-service");

describe("createSupplier Controller", () => {
  let mockCreateSupplierService: { handle: vi.Mock };

  beforeEach(() => {
    mockCreateSupplierService = {
      handle: vi.fn().mockResolvedValue({
        supplier: {
          id: "supplier-1",
          social_name: "Supplier Social Name",
          company_name: "Supplier Company Name",
          phone_number: "123456789",
          cnpj: "12345678000100",
        },
      }),
    };

    vi.mocked(makeCreateSupplierService).mockReturnValue(mockCreateSupplierService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  it("deve retornar erro 400 quando os dados da requisição forem inválidos", async () => {
    // Mock do objeto FastifyRequest com dados inválidos
    const request = {
      body: {
        social_name: "", // Nome social vazio (inválido)
        company_name: "Supplier Company Name",
        phone_number: "123456789",
        cnpj: "12345678000100",
      },
    } as unknown as FastifyRequest;
  
    // Mock do FastifyReply
    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;
  
    // Simular um erro de validação do Zod
    mockCreateSupplierService.handle.mockRejectedValueOnce(new z.ZodError([]));
  
    // Chamar a função do controlador
    await createSupplier(request, reply);
  
    // Garantir que o erro de validação foi tratado corretamente
    expect(reply.code).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "Invalid request data" });
  });
  
  it("deve retornar erro 500 para erros inesperados", async () => {
    // Mock do objeto FastifyRequest com dados válidos
    const request = {
      body: {
        social_name: "Supplier Social Name",
        company_name: "Supplier Company Name",
        phone_number: "123456789",
        cnpj: "12345678000100",
      },
    } as unknown as FastifyRequest;
  
    // Mock do FastifyReply
    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;
  
    // Simular um erro genérico no serviço
    mockCreateSupplierService.handle.mockRejectedValueOnce(new Error("Unexpected error"));
  
    // Chamar a função do controlador
    await createSupplier(request, reply);
  
    // Garantir que o erro inesperado foi tratado corretamente
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });

  it("deve criar um fornecedor e retornar status 201 com os dados do fornecedor", async () => {
    // Mock do objeto FastifyRequest com dados válidos
    const request = {
      body: {
        social_name: "Supplier Social Name",
        company_name: "Supplier Company Name",
        phone_number: "123456789",
        cnpj: "12345678000100",
      },
    } as unknown as FastifyRequest;

    // Mock do objeto FastifyReply
    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    // Chamar a função do controlador
    await createSupplier(request, reply);

    // Garantir que o serviço foi chamado com os dados corretos
    expect(mockCreateSupplierService.handle).toHaveBeenCalledWith({
      social_name: "Supplier Social Name",
      company_name: "Supplier Company Name",
      phone_number: "123456789",
      cnpj: "12345678000100",
    });

    // Garantir que a resposta foi 201
    expect(reply.code).toHaveBeenCalledWith(201);

    // Garantir que a resposta contém os dados do fornecedor criado
    expect(reply.send).toHaveBeenCalledWith({
      supplier: {
        id: "supplier-1",
        social_name: "Supplier Social Name",
        company_name: "Supplier Company Name",
        phone_number: "123456789",
        cnpj: "12345678000100",
      },
    });
  });
});
