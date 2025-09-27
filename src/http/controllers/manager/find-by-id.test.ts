import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";
import { findManagerById } from "./find-by-id";
import { makeFindManagerByIdService } from "../../../services/factories/manager/make-find-manager-by-id-service";
import { NoRecordsFoundError } from "../../../services/errors/no-records-found-error";

vi.mock("../../../services/factories/manager/make-find-manager-by-id-service");

describe("findManagerById controller", () => {
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it("deve retornar 200 e o gerente encontrado", async () => {
    const mockManager = { id: "1", name: "Manager One", email: "m1@example.com" };

    const mockService = {
      execute: vi.fn().mockResolvedValueOnce({ manager: mockManager }),
    };
    (makeFindManagerByIdService as unknown as vi.Mock).mockReturnValue(mockService);

    const mockRequest = { params: { id: "1" } } as unknown as FastifyRequest;

    await findManagerById(mockRequest, mockReply as FastifyReply);

    expect(mockService.execute).toHaveBeenCalledWith({ id: "1" });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({ manager: mockManager });
  });

  it("deve retornar 404 se o gerente não for encontrado", async () => {
    const mockService = {
      execute: vi.fn().mockRejectedValueOnce(new NoRecordsFoundError()),
    };
    (makeFindManagerByIdService as unknown as vi.Mock).mockReturnValue(mockService);

    const mockRequest = { params: { id: "999" } } as unknown as FastifyRequest;

    await findManagerById(mockRequest, mockReply as FastifyReply);

    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "No records found.",
    });
  });

  it("deve lançar erro se o parâmetro id for inválido", async () => {
    // id não é string → Zod deve lançar; controller re-lança erros que não sejam NoRecordsFoundError
    const mockRequest = { params: { id: 123 } } as unknown as FastifyRequest;

    await expect(
      findManagerById(mockRequest, mockReply as FastifyReply)
    ).rejects.toThrow(); // ZodError

    expect(mockReply.status).not.toHaveBeenCalled();
  });
});
