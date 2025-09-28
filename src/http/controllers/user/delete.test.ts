import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { deleteUser } from "./delete";
import * as makeDeleteUserServiceModule from "../../../services/factories/user/make-delete-user-service";
import { ResourceNotFoundError } from "../../../services/errors/resource-not-found-error";
import { FastifyReply, FastifyRequest } from "fastify";

describe("deleteUser controller", () => {
  let mockExecute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockExecute = vi.fn();

    vi.spyOn(makeDeleteUserServiceModule, "makeDeleteUserService").mockReturnValue({
      execute: mockExecute,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve deletar o usuário com sucesso e retornar status 200", async () => {
    const fakeId = "user-123";
    mockExecute.mockResolvedValueOnce(undefined);

    const request = {
      params: { id: fakeId },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await deleteUser(request, reply);

    expect(mockExecute).toHaveBeenCalledWith({ id: fakeId });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ message: "User successfully deleted." });
  });

  it("deve retornar 404 se o usuário não for encontrado", async () => {
    const fakeId = "user-404";
    mockExecute.mockRejectedValueOnce(new ResourceNotFoundError());

    const request = {
      params: { id: fakeId },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await deleteUser(request, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("deve retornar 500 em caso de erro inesperado", async () => {
    const fakeId = "user-500";
    mockExecute.mockRejectedValueOnce(new Error("DB connection failed"));

    const request = {
      params: { id: fakeId },
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await deleteUser(request, reply);

    expect(consoleSpy).toHaveBeenCalled();
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: "Internal Server Error" });

    consoleSpy.mockRestore();
  });

  it("deve retornar 500 se os parâmetros forem inválidos", async () => {
    // Observação: como o parse está dentro do try/catch do controller,
    // o ZodError é capturado e o controller retorna 500 (não rejeita).
    const request = {
      params: { id: 123 }, // id inválido (não é string)
    } as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await deleteUser(request, reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });
});
