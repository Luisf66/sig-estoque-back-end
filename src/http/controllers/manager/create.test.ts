import { describe, it, expect, vi } from "vitest";
import { createManager } from "./create";
import { FastifyRequest, FastifyReply } from "fastify";
import { makeCreateManagerService } from "../../../services/factories/manager/make-create-manager-service";
import { UserAlreadyExistsError } from "../../../services/errors/user-already-exists-error";

vi.mock("../../../services/factories/manager/make-create-manager-service");

describe("createManager Controller", () => {
  it("deve criar um gerente com sucesso e retornar status 201", async () => {
    const mockCreateManagerService = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(makeCreateManagerService).mockReturnValue(mockCreateManagerService);

    const request = {
      body: {
        name: "João",
        email: "joao@email.com",
        password: "password123",
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await createManager(request, reply);

    expect(mockCreateManagerService.execute).toHaveBeenCalledWith({
      name: "João",
      email: "joao@email.com",
      password: "password123",
    });
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalled();
  });

  it("deve retornar erro 409 se o email já estiver em uso", async () => {
    const mockCreateManagerService = {
      execute: vi.fn().mockRejectedValue(new UserAlreadyExistsError()),
    };
    vi.mocked(makeCreateManagerService).mockReturnValue(mockCreateManagerService);

    const request = {
      body: {
        name: "João",
        email: "joao@email.com",
        password: "password123",
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await createManager(request, reply);

    expect(reply.status).toHaveBeenCalledWith(409);
    expect(reply.send).toHaveBeenCalledWith({
      message: "E-mail already exists.",
    });
  });

  it("deve lançar erro de validação ao receber dados inválidos", async () => {
    const mockCreateManagerService = {
      execute: vi.fn(),
    };
    vi.mocked(makeCreateManagerService).mockReturnValue(mockCreateManagerService);

    const request = {
      body: {
        name: "",
        email: "email-invalido",
        password: "123",
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await expect(createManager(request, reply)).rejects.toThrowError(/Invalid/);

    expect(mockCreateManagerService.execute).not.toHaveBeenCalled();
    expect(reply.status).not.toHaveBeenCalled();
    expect(reply.send).not.toHaveBeenCalled();
  });

  it("deve capturar erros inesperados e lançar novamente", async () => {
    const mockCreateManagerService = {
      execute: vi.fn().mockRejectedValue(new Error("Erro inesperado")),
    };
    vi.mocked(makeCreateManagerService).mockReturnValue(mockCreateManagerService);

    const request = {
      body: {
        name: "João",
        email: "joao@email.com",
        password: "password123",
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await expect(createManager(request, reply)).rejects.toThrow("Erro inesperado");

    expect(mockCreateManagerService.execute).toHaveBeenCalledWith({
      name: "João",
      email: "joao@email.com",
      password: "password123",
    });

    expect(reply.status).not.toHaveBeenCalled();
    expect(reply.send).not.toHaveBeenCalled();
  });
});
