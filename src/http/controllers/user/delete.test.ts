import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { deleteUser } from "./delete";
import { makeDeleteUserService } from "../../../services/factories/user/make-delete-user-service";
import { ResourceNotFoundError } from "../../../services/errors/resource-not-found-error";
import { FastifyRequest, FastifyReply } from "fastify";

vi.mock("../../../services/factories/user/make-delete-user-service");

describe("deleteUser Controller", () => {
  let mockDeleteUserService: { execute: vi.Mock };

  beforeEach(() => {
    mockDeleteUserService = {
      execute: vi.fn(),
    };

    vi.mocked(makeDeleteUserService).mockReturnValue(mockDeleteUserService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve deletar o usuário e retornar status 200 com mensagem de sucesso", async () => {
    mockDeleteUserService.execute.mockResolvedValueOnce();

    const request = {
      params: {
        id: "user-1",
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await deleteUser(request, reply);

    expect(mockDeleteUserService.execute).toHaveBeenCalledWith({ id: "user-1" });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ message: "User successfully deleted." });
  });

  it("deve retornar erro 404 quando o usuário não for encontrado", async () => {
    mockDeleteUserService.execute.mockRejectedValueOnce(new ResourceNotFoundError());

    const request = {
      params: {
        id: "non-existent-user",
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await deleteUser(request, reply);

    expect(mockDeleteUserService.execute).toHaveBeenCalledWith({ id: "non-existent-user" });
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("deve retornar erro 500 para erros inesperados", async () => {
    mockDeleteUserService.execute.mockRejectedValueOnce(new Error("Unexpected error"));

    const request = {
      params: {
        id: "user-1",
      },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await deleteUser(request, reply);

    expect(mockDeleteUserService.execute).toHaveBeenCalledWith({ id: "user-1" });
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });
});
