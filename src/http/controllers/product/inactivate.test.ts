import { describe, it, expect, vi } from "vitest";
import { inactivateProduct } from "./inactivate";
import { FastifyReply, FastifyRequest } from "fastify";
import { makeInactivateProductService } from "../../../services/factories/product/make-inactivate-product-service";
import { NoRecordsFoundError } from "../../../services/errors/no-records-found-error";

vi.mock("../../../services/factories/product/make-inactivate-product-service");

describe("inactivateProduct Controller", () => {
  it("deve inativar o produto com sucesso", async () => {
    const mockInactivateProductService = {
      execute: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(makeInactivateProductService).mockReturnValue(mockInactivateProductService);

    const request = {
      params: { id: "1" },
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await inactivateProduct(request, reply);

    expect(mockInactivateProductService.execute).toHaveBeenCalledWith({ productId: "1" });
    expect(reply.code).toHaveBeenCalledWith(204);
    expect(reply.send).toHaveBeenCalledWith();
  });

  it("deve retornar erro 404 se o produto não for encontrado", async () => {
    const mockInactivateProductService = {
      execute: vi.fn().mockRejectedValue(new NoRecordsFoundError()),
    };

    vi.mocked(makeInactivateProductService).mockReturnValue(mockInactivateProductService);

    const request = {
      params: { id: "99" },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await inactivateProduct(request, reply);

    expect(mockInactivateProductService.execute).toHaveBeenCalledWith({ productId: "99" });
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: 'No records found.' });
  });

  it("deve lançar erro de validação se o ID do produto for inválido", async () => {
    const request = {
      params: { id: 123 }, // ID inválido (não é string)
    } as unknown as FastifyRequest;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await expect(inactivateProduct(request, reply)).rejects.toThrowError();

    expect(reply.code).not.toHaveBeenCalledWith(204);
    expect(reply.send).not.toHaveBeenCalled();
  });
});
