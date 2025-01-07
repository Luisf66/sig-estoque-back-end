import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { findUserByid } from "./find-by-id";
import { makeGetUserByIdService } from "../../../services/factories/user/make-get-user-by-id";
import { ResourceNotFoundError } from "../../../services/errors/resource-not-found-error";
import { FastifyRequest, FastifyReply } from "fastify";

vi.mock("../../../services/factories/user/make-get-user-by-id");

describe("findUserByid Controller", () => {
  let mockGetUserByIdService: { execute: vi.Mock };

  beforeEach(() => {
    mockGetUserByIdService = {
      execute: vi.fn(),
    };

    vi.mocked(makeGetUserByIdService).mockReturnValue(mockGetUserByIdService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar o usuário encontrado com sucesso e status 200", async () => {
    const request = {
      params: { id: "user-1" },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      code: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    mockGetUserByIdService.execute.mockResolvedValue({
      user: { id: "user-1", name: "John Doe", email: "johndoe@example.com" },
    });

    await findUserByid(request, reply);

    expect(mockGetUserByIdService.execute).toHaveBeenCalledWith({ userId: "user-1" });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      user: { id: "user-1", name: "John Doe", email: "johndoe@example.com" },
    });
  });

  it("deve retornar erro 404 se o usuário não for encontrado", async () => {
    const request = {
      params: { id: "user-1" },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      code: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    mockGetUserByIdService.execute.mockResolvedValue({ user: null });

    await findUserByid(request, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("deve retornar erro 404 se for lançada a exceção ResourceNotFoundError", async () => {
    const request = {
      params: { id: "user-1" },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      code: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    mockGetUserByIdService.execute.mockRejectedValue(new ResourceNotFoundError())
    await findUserByid(request, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Resource not found" });
  });

  it("deve retornar erro 500 em caso de erro inesperado", async () => {
    const request = {
      params: { id: "user-1" },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      code: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    mockGetUserByIdService.execute.mockRejectedValue(new Error("Unexpected error"));

    await findUserByid(request, reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });
});
