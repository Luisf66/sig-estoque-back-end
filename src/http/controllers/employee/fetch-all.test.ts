import { describe, it, expect, vi } from "vitest";
import { fetchAllEmployees } from "./fetch-all";
import { FastifyRequest, FastifyReply } from "fastify";
import { makeFetchAllEmployeesService } from "../../../services/factories/employee/make-fetch-all-employees-service";

vi.mock("../../../services/factories/employee/make-fetch-all-employees-service");

describe("fetchAllEmployees Controller", () => {
  it("deve retornar uma lista de funcionários e status 200", async () => {
    // Mock do serviço
    const mockFetchAllEmployeesService = {
      execute: vi.fn().mockResolvedValue({
        employee: [
          { id: "1", name: "João", email: "joao@email.com" },
          { id: "2", name: "Maria", email: "maria@email.com" },
        ],
      }),
    };
    vi.mocked(makeFetchAllEmployeesService).mockReturnValue(mockFetchAllEmployeesService);

    // Mock do request e reply
    const request = {} as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchAllEmployees(request, reply);

    expect(mockFetchAllEmployeesService.execute).toHaveBeenCalled();
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      employee: [
        { id: "1", name: "João", email: "joao@email.com" },
        { id: "2", name: "Maria", email: "maria@email.com" },
      ],
    });
  });

  it("deve retornar erro 500 em caso de erro inesperado", async () => {
    // Mock do serviço para lançar erro
    const mockFetchAllEmployeesService = {
      execute: vi.fn().mockRejectedValue(new Error("Erro inesperado")),
    };
    vi.mocked(makeFetchAllEmployeesService).mockReturnValue(mockFetchAllEmployeesService);

    const request = {} as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchAllEmployees(request, reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });
});
