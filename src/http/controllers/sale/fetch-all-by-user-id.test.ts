import { describe, it, expect, vi } from "vitest";
import { fetchAllSaleByUserId } from "./fetch-all-by-user-id";
import { FastifyRequest, FastifyReply } from "fastify";
import { makeFetchAllSaleByUserIdService } from "../../../services/factories/sale/make-fetch-all-sale-by-user-id";

vi.mock("../../../services/factories/sale/make-fetch-all-sale-by-user-id");

describe("fetchAllSaleByUserId Controller", () => {
  it("deve retornar todas as vendas de um usuário com sucesso", async () => {
    const mockFetchAllSaleByUserIdService = {
      execute: vi.fn().mockResolvedValue({
        sales: [
          { id: "sale-1", nf_number: "NF123", userId: "user-1" },
          { id: "sale-2", nf_number: "NF124", userId: "user-1" },
        ],
      }),
    };

    vi.mocked(makeFetchAllSaleByUserIdService).mockReturnValue(mockFetchAllSaleByUserIdService);

    const request = {
      params: {
        userId: "user-1",
      },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchAllSaleByUserId(request, reply);

    expect(mockFetchAllSaleByUserIdService.execute).toHaveBeenCalledWith({
      userId: "user-1",
    });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      sales: [
        { id: "sale-1", nf_number: "NF123", userId: "user-1" },
        { id: "sale-2", nf_number: "NF124", userId: "user-1" },
      ],
    });
  });

  it("deve retornar erro 500 em caso de erro inesperado", async () => {
    const mockFetchAllSaleByUserIdService = {
      execute: vi.fn().mockRejectedValue(new Error("Erro inesperado")),
    };

    vi.mocked(makeFetchAllSaleByUserIdService).mockReturnValue(mockFetchAllSaleByUserIdService);

    const request = {
      params: {
        userId: "user-1",
      },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchAllSaleByUserId(request, reply);

    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it("deve retornar erro 500 se o parâmetro userId estiver ausente", async () => {
    const mockFetchAllSaleByUserIdService = {
      execute: vi.fn().mockImplementation(({ userId }) => {
        if (!userId) {
          throw new Error("Parâmetro userId ausente");
        }
      }),
    };
  
    vi.mocked(makeFetchAllSaleByUserIdService).mockReturnValue(mockFetchAllSaleByUserIdService);
  
    const request = {
      params: {}, // Parâmetro userId ausente
    } as unknown as FastifyRequest;
  
    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;
  
    await fetchAllSaleByUserId(request, reply);
  
    // Garantir que o serviço foi chamado apenas com userId definido
    expect(mockFetchAllSaleByUserIdService.execute).toHaveBeenCalledTimes(1);
    expect(mockFetchAllSaleByUserIdService.execute).toHaveBeenCalledWith({
      userId: undefined, // Verifica se foi chamado com undefined
    });
  
    // Validar o retorno do erro
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });
  
});
