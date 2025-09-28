import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchAllUsers } from "./fetch-all";
import * as makeGetAllUsersServiceModule from "../../../services/factories/user/make-get-all-users-service";
import { FastifyReply, FastifyRequest } from "fastify";

describe("fetchAllUsers controller", () => {
  let mockExecute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockExecute = vi.fn();

    vi.spyOn(makeGetAllUsersServiceModule, "makeGetAllUsersService").mockReturnValue({
      execute: mockExecute,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar 200 e a lista de usuários com sucesso", async () => {
    const fakeUsers = [
      { id: "1", name: "User One", email: "one@example.com" },
      { id: "2", name: "User Two", email: "two@example.com" },
    ];

    mockExecute.mockResolvedValueOnce({ users: fakeUsers });

    const request = {} as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchAllUsers(request, reply);

    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ users: fakeUsers });
  });

  it("deve retornar 500 em caso de erro inesperado", async () => {
    mockExecute.mockRejectedValueOnce(new Error("DB connection failed"));

    const request = {} as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await fetchAllUsers(request, reply);

    expect(consoleSpy).toHaveBeenCalled();
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: "Internal Server Error" });

    consoleSpy.mockRestore();
  });
});
