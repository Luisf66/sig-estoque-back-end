import { describe, it, expect, vi } from "vitest";
import { createEmployee } from "./create";
import { FastifyRequest, FastifyReply } from "fastify";
import { UserAlreadyExistsError } from "../../../services/errors/user-already-exists-error";
import { makeCreateEmployeeService } from "../../../services/factories/employee/make-create-employee-service";

vi.mock("../../../services/factories/employee/make-create-employee-service");

describe("createEmployee Controller", () => {
  it("deve criar um novo funcionário e retornar status 201", async () => {
    // Mock do serviço
    const mockCreateEmployeeService = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(makeCreateEmployeeService).mockReturnValue(mockCreateEmployeeService);

    // Mock do request e reply
    const request = {
      body: {
        name: "João",
        email: "joao@email.com",
        password: "123456",
      },
    } as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await createEmployee(request, reply);

    expect(mockCreateEmployeeService.execute).toHaveBeenCalledWith({
      name: "João",
      email: "joao@email.com",
      password: "123456",
    });

    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalled();
  });

  it("deve retornar erro 409 se o email já existir", async () => {
    // Mock do serviço para lançar erro
    const mockCreateEmployeeService = {
      execute: vi.fn().mockRejectedValue(new UserAlreadyExistsError()),
    };
    vi.mocked(makeCreateEmployeeService).mockReturnValue(mockCreateEmployeeService);

    const request = {
      body: {
        name: "João",
        email: "joao@email.com",
        password: "123456",
      },
    } as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await createEmployee(request, reply);

    expect(reply.status).toHaveBeenCalledWith(409);
    expect(reply.send).toHaveBeenCalledWith({
      message: "E-mail already exists.",
    });
  });

  it("deve lançar um erro inesperado se outro erro ocorrer", async () => {
    const mockCreateEmployeeService = {
      execute: vi.fn().mockRejectedValue(new Error("Erro inesperado")),
    };
    vi.mocked(makeCreateEmployeeService).mockReturnValue(mockCreateEmployeeService);

    const request = {
      body: {
        name: "João",
        email: "joao@email.com",
        password: "123456",
      },
    } as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await expect(createEmployee(request, reply)).rejects.toThrow("Erro inesperado");
  });
});
