import { describe, it, expect, vi } from "vitest";
import { findManagerById } from "./find-by-id";
import { FastifyRequest, FastifyReply } from "fastify";
import { makeFindManagerByIdService } from "../../../services/factories/manager/make-find-manager-by-id-service";
import { NoRecordsFoundError } from "../../../services/errors/no-records-found-error";

vi.mock("../../../services/factories/manager/make-find-manager-by-id-service");

describe("findManagerById Controller", () => {
  it("deve retornar o gerente correspondente ao ID e status 200", async () => {
    // Mock do serviço
    const mockFindManagerByIdService = {
      execute: vi.fn().mockResolvedValue({
        manager: { id: "1", name: "João", email: "joao@email.com" },
      }),
    };
    vi.mocked(makeFindManagerByIdService).mockReturnValue(mockFindManagerByIdService);

    // Mock do request e reply
    const request = {
      params: {
        id: "1",
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await findManagerById(request, reply);

    expect(mockFindManagerByIdService.execute).toHaveBeenCalledWith({ id: "1" });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      manager: { id: "1", name: "João", email: "joao@email.com" },
    });
  });

  it("deve retornar erro 404 quando nenhum gerente for encontrado", async () => {
    // Mock do serviço para lançar NoRecordsFoundError
    const mockFindManagerByIdService = {
      execute: vi.fn().mockRejectedValue(new NoRecordsFoundError()),
    };
    vi.mocked(makeFindManagerByIdService).mockReturnValue(mockFindManagerByIdService);

    const request = {
      params: {
        id: "2",
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await findManagerById(request, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      message: "No records found.",
    });
  });

  it("deve lançar erro de validação para ID inválido", async () => {
    // Mock do serviço
    const mockFindManagerByIdService = {
      execute: vi.fn(),
    };
    vi.mocked(makeFindManagerByIdService).mockReturnValue(mockFindManagerByIdService);

    const request = {
      params: {
        id: 123, // ID inválido (não é uma string)
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await expect(findManagerById(request, reply)).rejects.toThrowError();
    expect(mockFindManagerByIdService.execute).not.toHaveBeenCalled();
  });
});
