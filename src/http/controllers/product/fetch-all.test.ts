import { describe, it, expect, vi } from "vitest";
import { fetchAllProduct } from "./fetch-all";
import { FastifyReply, FastifyRequest } from "fastify";
import { makeFetchAllProductService } from "../../../services/factories/product/make-fetch-all-product-service";

vi.mock("../../../services/factories/product/make-fetch-all-product-service");

describe("fetchAllProduct Controller", () => {
  it("deve retornar todos os produtos com sucesso", async () => {
    const mockFetchAllProductService = {
      execute: vi.fn().mockResolvedValue({
        product: [
          {
            id: "1",
            name: "Produto A",
            description: "Descrição do Produto A",
            price: 100.0,
            quantity_in_stock: 10,
            batch: "BATCH01",
          },
          {
            id: "2",
            name: "Produto B",
            description: "Descrição do Produto B",
            price: 200.0,
            quantity_in_stock: 20,
            batch: "BATCH02",
          },
        ],
      }),
    };

    vi.mocked(makeFetchAllProductService).mockReturnValue(mockFetchAllProductService);

    const request = {} as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchAllProduct(request, reply);

    expect(mockFetchAllProductService.execute).toHaveBeenCalled();
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      product: [
        {
          id: "1",
          name: "Produto A",
          description: "Descrição do Produto A",
          price: 100.0,
          quantity_in_stock: 10,
          batch: "BATCH01",
        },
        {
          id: "2",
          name: "Produto B",
          description: "Descrição do Produto B",
          price: 200.0,
          quantity_in_stock: 20,
          batch: "BATCH02",
        },
      ],
    });
  });

  it("deve retornar erro interno do servidor em caso de falha no serviço", async () => {
    const mockFetchAllProductService = {
      execute: vi.fn().mockRejectedValue(new Error("Erro no serviço")),
    };

    vi.mocked(makeFetchAllProductService).mockReturnValue(mockFetchAllProductService);

    const request = {} as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await expect(fetchAllProduct(request, reply)).rejects.toThrowError("Erro no serviço");

    expect(mockFetchAllProductService.execute).toHaveBeenCalled();
    expect(reply.code).not.toHaveBeenCalledWith(200);
    expect(reply.send).not.toHaveBeenCalledWith({
      product: expect.anything(),
    });
  });
});
