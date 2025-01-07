import { describe, it, expect, vi } from "vitest";
import { createManager } from "./create";
import { FastifyRequest, FastifyReply } from "fastify";
import { makeCreateManagerService } from "../../../services/factories/manager/make-create-manager-service";
import { UserAlreadyExistsError } from "../../../services/errors/user-already-exists-error";

vi.mock("../../../services/factories/manager/make-create-manager-service");

describe("createManager Controller", () => {
  it("deve criar um gerente com sucesso e retornar status 201", async () => {
    // Mock do serviço
    const mockCreateManagerService = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(makeCreateManagerService).mockReturnValue(mockCreateManagerService);

    // Mock do request e reply
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
    // Mock do serviço para lançar UserAlreadyExistsError
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
    // Mock do serviço
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

    try {
      await createManager(request, reply);
      throw new Error("O controlador deveria ter lançado um erro de validação.");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain("Invalid");
      expect(mockCreateManagerService.execute).not.toHaveBeenCalled();
    }
  });
});
