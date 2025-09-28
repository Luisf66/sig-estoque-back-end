import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { authenticateUser } from "./authenticate";
import { InvalidCredentialError } from "../../../services/errors/invalid-credential-error";
import * as makeUserAuthenticateServiceModule from "../../../services/factories/user/make-user-authenticate-service";
import { FastifyReply, FastifyRequest } from "fastify";

describe("authenticateUser controller", () => {
  let mockExecute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();

    mockExecute = vi.fn();

    vi.spyOn(makeUserAuthenticateServiceModule, "makeUserAuthenticateService")
      .mockReturnValue({
        execute: mockExecute
      } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve autenticar o usuário com sucesso e retornar token", async () => {
    const fakeUser = { id: "user-123", role: "ADMIN" };

    mockExecute.mockResolvedValueOnce({ user: fakeUser });

    const fakeToken = "fake-jwt-token";

    // Mock do request
    const request = {
      body: {
        email: "test@example.com",
        password: "123456"
      }
    } as unknown as FastifyRequest;

    // Mock do reply
    const reply = {
      jwtSign: vi.fn().mockResolvedValue(fakeToken),
      status: vi.fn().mockReturnThis(),
      send: vi.fn()
    } as unknown as FastifyReply;

    await authenticateUser(request, reply);

    expect(reply.jwtSign).toHaveBeenCalledWith(
      { role: fakeUser.role },
      { sign: { sub: fakeUser.id } }
    );

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      id: fakeUser.id,
      role: fakeUser.role,
      token: fakeToken
    });
  });

  it("deve retornar 400 se as credenciais forem inválidas", async () => {
    mockExecute.mockRejectedValueOnce(new InvalidCredentialError());

    const request = {
      body: {
        email: "invalid@example.com",
        password: "wrongpass"
      }
    } as unknown as FastifyRequest;

    const reply = {
      jwtSign: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn()
    } as unknown as FastifyReply;

    await authenticateUser(request, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Invalid credentials."
    });
  });

  it("deve lançar erro se o corpo da requisição for inválido", async () => {
    const request = {
      body: {
        email: "not-an-email",
        password: "123"
      }
    } as unknown as FastifyRequest;

    const reply = {
      jwtSign: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn()
    } as unknown as FastifyReply;

    await expect(authenticateUser(request, reply)).rejects.toThrowError();
  });
});
