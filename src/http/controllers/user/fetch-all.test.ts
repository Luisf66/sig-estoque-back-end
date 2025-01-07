import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fetchAllUsers } from "./fetch-all";
import { makeGetAllUsersService } from "../../../services/factories/user/make-get-all-users-service";
import { FastifyRequest, FastifyReply } from "fastify";

vi.mock("../../../services/factories/user/make-get-all-users-service");

describe("fetchAllUsers Controller", () => {
  let mockGetAllUsersService: { execute: vi.Mock };

  beforeEach(() => {
    mockGetAllUsersService = {
      execute: vi.fn().mockResolvedValue({
        users: [
          { id: "user-1", name: "User One", email: "userone@example.com" },
          { id: "user-2", name: "User Two", email: "usertwo@example.com" },
        ],
      }),
    };

    vi.mocked(makeGetAllUsersService).mockReturnValue(mockGetAllUsersService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar todos os usuários com sucesso e status 200", async () => {
    const request = {} as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchAllUsers(request, reply);

    expect(mockGetAllUsersService.execute).toHaveBeenCalled();
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      users: [
        { id: "user-1", name: "User One", email: "userone@example.com" },
        { id: "user-2", name: "User Two", email: "usertwo@example.com" },
      ],
    });
  });

  it("deve retornar erro 500 em caso de erro interno", async () => {
    mockGetAllUsersService.execute.mockRejectedValue(new Error("Unexpected error"));

    const request = {} as unknown as FastifyRequest;

    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    await fetchAllUsers(request, reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });
});
