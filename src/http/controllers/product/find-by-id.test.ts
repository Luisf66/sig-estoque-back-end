import { describe, it, expect, vi } from "vitest";
import { findProductById } from "./find-by-id";
import { FastifyReply, FastifyRequest } from "fastify";
import { makeFindProductByIdService } from "../../../services/factories/product/make-find-product-by-id-service";
import { NoRecordsFoundError } from "../../../services/errors/no-records-found-error";

vi.mock("../../../services/factories/product/make-find-product-by-id-service");

describe("findProductById Controller", () => {
  it("deve retornar o produto pelo ID com sucesso", async () => {
    const mockFindProductByIdService = {
      execute: vi.fn().mockResolvedValue({
        product: {
          id: "1",
          name: "Produto A",
          description: "Descrição do Produto A",
          price: 100.0,
          quantity_in_stock: 10,
          batch: "BATCH01",
        },
      }),
    };

    vi.mocked(makeFindProductByIdService).mockReturnValue(mockFindProductByIdService);

    const request = {
      params: { id: "1" },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await findProductById(request, reply);

    expect(mockFindProductByIdService.execute).toHaveBeenCalledWith({ productId: "1" });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      product: {
        id: "1",
        name: "Produto A",
        description: "Descrição do Produto A",
        price: 100.0,
        quantity_in_stock: 10,
        batch: "BATCH01",
      },
    });
  });

  it("deve retornar erro 404 se o produto não for encontrado", async () => {
    const mockFindProductByIdService = {
      execute: vi.fn().mockRejectedValue(new NoRecordsFoundError()),
    };

    vi.mocked(makeFindProductByIdService).mockReturnValue(mockFindProductByIdService);

    const request = {
      params: { id: "99" },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await findProductById(request, reply);

    expect(mockFindProductByIdService.execute).toHaveBeenCalledWith({ productId: "99" });
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: 'No records found.' });
  });

  it("deve lançar erro de validação para dados inválidos", async () => {
    const request = {
      params: { id: 123 }, // ID inválido (não é string)
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await expect(findProductById(request, reply)).rejects.toThrowError();

    expect(reply.status).not.toHaveBeenCalledWith(200);
    expect(reply.send).not.toHaveBeenCalledWith(expect.anything());
  });
});
