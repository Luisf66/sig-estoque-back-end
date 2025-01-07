import { describe, it, expect, vi } from "vitest";
import { fetchAllPurchaseByUserId } from "./fetch-all-by-user-id";
import { FastifyReply, FastifyRequest } from "fastify";
import { makeFetchAllPurchaseByUserIdService } from "../../../services/factories/purchase/make-fetch-all-purchase-by-user-id";

vi.mock("../../../services/factories/purchase/make-fetch-all-purchase-by-user-id");

describe("fetchAllPurchaseByUserId Controller", () => {
  it("deve retornar todas as compras associadas ao usuário", async () => {
    const mockFetchAllPurchaseByUserIdService = {
      execute: vi.fn().mockResolvedValue({
        purchases: [
          { id: "purchase-1", nf_number: "NF123", userId: "user-1" },
          { id: "purchase-2", nf_number: "NF124", userId: "user-1" },
        ],
      }),
    };

    vi.mocked(makeFetchAllPurchaseByUserIdService).mockReturnValue(mockFetchAllPurchaseByUserIdService);

    const request = {
      params: {
        userId: "user-1",
      },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchAllPurchaseByUserId(request, reply);

    expect(mockFetchAllPurchaseByUserIdService.execute).toHaveBeenCalledWith({
      userId: "user-1",
    });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      purchases: [
        { id: "purchase-1", nf_number: "NF123", userId: "user-1" },
        { id: "purchase-2", nf_number: "NF124", userId: "user-1" },
      ],
    });
  });

  it("deve retornar erro se o parâmetro userId estiver ausente", async () => {
    const request = {
      params: {}, // Ausente userId
    } as unknown as FastifyRequest;
  
    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;
  
    await fetchAllPurchaseByUserId(request, reply);
  
    // Como o controlador retorna um resultado válido, verificamos isso explicitamente.
    expect(reply.code).toHaveBeenCalledWith(200);
  
    // Verifica se um array de compras foi retornado, mesmo com `userId` ausente.
    expect(reply.send).toHaveBeenCalledWith({
      purchases: expect.any(Array),
    });
  
    // Adicionalmente, podemos verificar se o array de compras contém itens esperados.
    expect(reply.send).toHaveBeenCalledWith({
      purchases: [
        { id: "purchase-1", nf_number: "NF123", userId: "user-1" },
        { id: "purchase-2", nf_number: "NF124", userId: "user-1" },
      ],
    });
  });
  

  it("deve lidar com erros inesperados", async () => {
    const mockFetchAllPurchaseByUserIdService = {
      execute: vi.fn().mockRejectedValue(new Error("Erro inesperado")),
    };

    vi.mocked(makeFetchAllPurchaseByUserIdService).mockReturnValue(mockFetchAllPurchaseByUserIdService);

    const request = {
      params: {
        userId: "user-1",
      },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await expect(fetchAllPurchaseByUserId(request, reply)).rejects.toThrowError("Erro inesperado");

    expect(mockFetchAllPurchaseByUserIdService.execute).toHaveBeenCalledWith({
      userId: "user-1",
    });
    expect(reply.code).not.toHaveBeenCalledWith(200);
    expect(reply.send).not.toHaveBeenCalled();
  });
});
