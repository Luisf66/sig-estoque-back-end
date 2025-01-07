import { describe, it, expect, vi } from "vitest";
import { fetchAllPurchase } from "./fetch-all";
import { FastifyReply, FastifyRequest } from "fastify";
import { makeFetchAllPurchaseService } from "../../../services/factories/purchase/make-fetch-all-purchase-service";

vi.mock("../../../services/factories/purchase/make-fetch-all-purchase-service");

describe("fetchAllPurchase Controller", () => {
  it("deve retornar todas as compras", async () => {
    const mockFetchAllPurchaseService = {
      execute: vi.fn().mockResolvedValue({
        purchase: [
          { id: "purchase-1", nf_number: "NF123", userId: "user-1" },
          { id: "purchase-2", nf_number: "NF124", userId: "user-2" },
        ],
      }),
    };

    vi.mocked(makeFetchAllPurchaseService).mockReturnValue(mockFetchAllPurchaseService);

    const request = {} as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchAllPurchase(request, reply);

    expect(mockFetchAllPurchaseService.execute).toHaveBeenCalled();
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      purchase: [
        { id: "purchase-1", nf_number: "NF123", userId: "user-1" },
        { id: "purchase-2", nf_number: "NF124", userId: "user-2" },
      ],
    });
  });

  it("deve lidar com erros inesperados", async () => {
    const mockFetchAllPurchaseService = {
      execute: vi.fn().mockRejectedValue(new Error("Erro inesperado")),
    };

    vi.mocked(makeFetchAllPurchaseService).mockReturnValue(mockFetchAllPurchaseService);

    const request = {} as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await expect(fetchAllPurchase(request, reply)).rejects.toThrowError("Erro inesperado");

    expect(mockFetchAllPurchaseService.execute).toHaveBeenCalled();
    expect(reply.code).not.toHaveBeenCalledWith(200);
    expect(reply.send).not.toHaveBeenCalled();
  });
});
