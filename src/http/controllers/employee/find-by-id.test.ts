import { describe, it, expect, vi } from "vitest";
import { findEmployeeById } from "./find-by-id";
import { FastifyRequest, FastifyReply } from "fastify";
import { makeFindEmployeeByIdService } from "../../../services/factories/employee/make-find-employee-by-id-service";
import { NoRecordsFoundError } from "../../../services/errors/no-records-found-error";

vi.mock("../../../services/factories/employee/make-find-employee-by-id-service");

describe("findEmployeeById Controller", () => {
  it("deve retornar um funcionário pelo ID e status 200", async () => {
    // Mock do serviço
    const mockFindEmployeeByIdService = {
      execute: vi.fn().mockResolvedValue({
        employee: { id: "1", name: "João", email: "joao@email.com" },
      }),
    };
    vi.mocked(makeFindEmployeeByIdService).mockReturnValue(mockFindEmployeeByIdService);

    // Mock do request e reply
    const request = {
      params: { id: "1" },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await findEmployeeById(request, reply);

    expect(mockFindEmployeeByIdService.execute).toHaveBeenCalledWith({ id: "1" });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      employee: { id: "1", name: "João", email: "joao@email.com" },
    });
  });

  it("deve retornar erro 404 quando nenhum funcionário é encontrado", async () => {
    // Mock do serviço para lançar NoRecordsFoundError
    const mockFindEmployeeByIdService = {
      execute: vi.fn().mockRejectedValue(new NoRecordsFoundError()),
    };
    vi.mocked(makeFindEmployeeByIdService).mockReturnValue(mockFindEmployeeByIdService);

    const request = {
      params: { id: "2" },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await findEmployeeById(request, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      message: "No records found.",
    });
  });

  it("deve lançar erro inesperado", async () => {
    // Mock do serviço para lançar erro genérico
    const mockFindEmployeeByIdService = {
      execute: vi.fn().mockRejectedValue(new Error("Erro inesperado")),
    };
    vi.mocked(makeFindEmployeeByIdService).mockReturnValue(mockFindEmployeeByIdService);

    const request = {
      params: { id: "3" },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await expect(findEmployeeById(request, reply)).rejects.toThrow("Erro inesperado");
  });
});
