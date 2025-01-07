import { describe, it, expect, vi } from "vitest";
import { fetchAllManagers } from "./fetch-all";
import { FastifyRequest, FastifyReply } from "fastify";
import { makeFetchAllManagersService } from "../../../services/factories/manager/make-fetch-all-managers-serive";

vi.mock("../../../services/factories/manager/make-fetch-all-managers-serive");

describe("fetchAllManagers Controller", () => {
  it("deve retornar todos os gerentes com sucesso e status 200", async () => {
    // Mock do serviço
    const mockFetchAllManagersService = {
      execute: vi.fn().mockResolvedValue({
        managers: [
          { id: "1", name: "João", email: "joao@email.com" },
          { id: "2", name: "Maria", email: "maria@email.com" },
        ],
      }),
    };
    vi.mocked(makeFetchAllManagersService).mockReturnValue(mockFetchAllManagersService);

    // Mock do request e reply
    const request = {} as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchAllManagers(request, reply);

    expect(mockFetchAllManagersService.execute).toHaveBeenCalled();
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      managers: [
        { id: "1", name: "João", email: "joao@email.com" },
        { id: "2", name: "Maria", email: "maria@email.com" },
      ],
    });
  });

  it("deve retornar erro 500 em caso de falha no serviço", async () => {
    // Mock do serviço para lançar erro genérico
    const mockFetchAllManagersService = {
      execute: vi.fn().mockRejectedValue(new Error("Erro inesperado")),
    };
    vi.mocked(makeFetchAllManagersService).mockReturnValue(mockFetchAllManagersService);

    // Mock do request e reply
    const request = {} as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchAllManagers(request, reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });
});
