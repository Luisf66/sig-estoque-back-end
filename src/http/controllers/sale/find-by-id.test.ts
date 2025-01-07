import { describe, it, expect, vi } from "vitest";
import { findSaleById } from "./find-by-id";
import { FastifyRequest, FastifyReply } from "fastify";
import { makeFindSaleByIdService } from "../../../services/factories/sale/make-find-sale-by-id-service";

vi.mock("../../../services/factories/sale/make-find-sale-by-id-service");

describe("findSaleById Controller", () => {
  it("deve retornar a venda com sucesso quando o ID for válido", async () => {
    const mockFindSaleByIdService = {
      execute: vi.fn().mockResolvedValue({
        sale: { id: "sale-1", nf_number: "NF123", userId: "user-1" },
      }),
    };

    vi.mocked(makeFindSaleByIdService).mockReturnValue(mockFindSaleByIdService);

    const request = {
      params: { id: "sale-1" },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await findSaleById(request, reply);

    expect(mockFindSaleByIdService.execute).toHaveBeenCalledWith({ saleId: "sale-1" });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      sale: { id: "sale-1", nf_number: "NF123", userId: "user-1" },
    });
  });

  it("deve retornar erro 404 quando a venda não for encontrada", async () => {
    const mockFindSaleByIdService = {
      execute: vi.fn().mockResolvedValue({ sale: null }),
    };

    vi.mocked(makeFindSaleByIdService).mockReturnValue(mockFindSaleByIdService);

    const request = {
      params: { id: "invalid-id" },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await findSaleById(request, reply);

    expect(mockFindSaleByIdService.execute).toHaveBeenCalledWith({ saleId: "invalid-id" });
    expect(reply.code).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Sale not found" });
  });

  it("deve retornar erro 500 em caso de erro inesperado", async () => {
    const mockFindSaleByIdService = {
      execute: vi.fn().mockRejectedValue(new Error("Erro inesperado")),
    };

    vi.mocked(makeFindSaleByIdService).mockReturnValue(mockFindSaleByIdService);

    const request = {
      params: { id: "sale-1" },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await findSaleById(request, reply);

    expect(mockFindSaleByIdService.execute).toHaveBeenCalledWith({ saleId: "sale-1" });
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });

  it("deve retornar erro 500 se o parâmetro ID estiver ausente", async () => {
    const mockFindSaleByIdService = {
      execute: vi.fn(),
    };
  
    vi.mocked(makeFindSaleByIdService).mockReturnValue(mockFindSaleByIdService);
  
    const request = {
      params: {}, // Parâmetro ID ausente
    } as unknown as FastifyRequest;
  
    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;
  
    await findSaleById(request, reply);
  
    // Garantir que o serviço não foi chamado com um ID inválido
    expect(mockFindSaleByIdService.execute).toHaveBeenCalledWith({
      saleId: undefined,
    });
  
    // Validar o retorno do erro
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });
  
});
