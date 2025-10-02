import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";
import { createManager } from "./create";
import { makeCreateManagerService } from "../../../services/factories/manager/make-create-manager-service";
import { UserAlreadyExistsError } from "../../../services/errors/user-already-exists-error";

vi.mock("../../../services/factories/manager/make-create-manager-service");

describe("createManager controller", () => {
  it("deve criar um gerente com sucesso", async () => {
    const mockRequest = {
      body: {
        name: "Admin",
        email: "admin@example.com",
        password: "securepass",
      },
    } as unknown as FastifyRequest;

    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    const mockService = {
      execute: vi.fn().mockResolvedValue(undefined),
    };

    (makeCreateManagerService as unknown as vi.Mock).mockReturnValue(mockService);

    await createManager(mockRequest, mockReply);

    expect(mockService.execute).toHaveBeenCalledWith({
      name: "Admin",
      email: "admin@example.com",
      password: "securepass",
    });

    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it("deve retornar 409 se o gerente já existir", async () => {
    const mockRequest = {
      body: {
        name: "Admin",
        email: "admin@example.com",
        password: "securepass",
      },
    } as unknown as FastifyRequest;

    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    const mockService = {
      execute: vi.fn().mockRejectedValue(new UserAlreadyExistsError()),
    };

    (makeCreateManagerService as unknown as vi.Mock).mockReturnValue(mockService);

    await createManager(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(409);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "E-mail already exists.",
    });
  });

  it("deve lançar erro se os dados forem inválidos", async () => {
    const mockRequest = {
      body: {
        name: "",
        email: "invalid-email",
        password: "123",
      },
    } as unknown as FastifyRequest;

    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    // Como o Zod lança antes do try/catch, esperamos um throw
    await expect(createManager(mockRequest, mockReply)).rejects.toThrow();

    expect(mockReply.status).not.toHaveBeenCalled();
  });
  it("deve relançar erros inesperados", async () => {
    const mockRequest = {
      body: {
        name: "Admin",
        email: "admin@example.com",
        password: "securepass",
      },
    } as unknown as FastifyRequest;

    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    const mockService = {
      execute: vi.fn().mockRejectedValue(new Error("Erro inesperado")),
    };

    (makeCreateManagerService as unknown as vi.Mock).mockReturnValue(mockService);

    await expect(createManager(mockRequest, mockReply)).rejects.toThrow("Erro inesperado");

    expect(mockReply.status).not.toHaveBeenCalled();
  });
});
