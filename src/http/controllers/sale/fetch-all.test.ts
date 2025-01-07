import { describe, it, expect, vi } from "vitest";
import { fetchAllSale } from "./fetch-all";
import { FastifyRequest, FastifyReply } from "fastify";
import { makeFetchAllSaleService } from "../../../services/factories/sale/make-fetch-all-sale-service";

vi.mock("../../../services/factories/sale/make-fetch-all-sale-service");

describe("fetchAllSale Controller", () => {
  it("deve retornar todas as vendas com sucesso", async () => {
    const mockFetchAllSaleService = {
      execute: vi.fn().mockResolvedValue({
        sale: [
          { id: "sale-1", nf_number: "NF123", userId: "user-1" },
          { id: "sale-2", nf_number: "NF124", userId: "user-2" },
        ],
      }),
    };

    vi.mocked(makeFetchAllSaleService).mockReturnValue(mockFetchAllSaleService);

    const request = {} as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchAllSale(request, reply);

    expect(mockFetchAllSaleService.execute).toHaveBeenCalled();
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      sale: [
        { id: "sale-1", nf_number: "NF123", userId: "user-1" },
        { id: "sale-2", nf_number: "NF124", userId: "user-2" },
      ],
    });
  });

  it("deve retornar erro 500 em caso de erro inesperado", async () => {
    const mockFetchAllSaleService = {
      execute: vi.fn().mockRejectedValue(new Error("Erro inesperado")),
    };

    vi.mocked(makeFetchAllSaleService).mockReturnValue(mockFetchAllSaleService);

    const request = {} as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchAllSale(request, reply);

    expect(mockFetchAllSaleService.execute).toHaveBeenCalled();
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });
});
