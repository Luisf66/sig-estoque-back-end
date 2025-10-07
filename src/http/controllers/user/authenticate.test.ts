import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { authenticateUser } from './authenticate'; // Ajuste o caminho
import { InvalidCredentialError } from '../../../services/errors/invalid-credential-error';

// Mock da factory que cria o service
const authenticateUserServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/user/make-user-authenticate-service', () => {
  return {
    makeUserAuthenticateService: () => authenticateUserServiceMock,
  };
});

describe('Authenticate User Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      body: {
        email: 'john.doe@example.com',
        password: 'password123',
      },
    };
    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      // Mock da função de assinar o token JWT
      jwtSign: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should authenticate a user and return a token', async () => {
    // Arrange
    const userData = { id: 'user-01', role: 'EMPLOYEE' };
    const fakeToken = 'fake-jwt-token';
    authenticateUserServiceMock.execute.mockResolvedValue({ user: userData });
    (reply.jwtSign as vi.Mock).mockResolvedValue(fakeToken);

    // Act
    await authenticateUser(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(authenticateUserServiceMock.execute).toHaveBeenCalledWith({
      email: 'john.doe@example.com',
      password: 'password123',
    });
    expect(reply.jwtSign).toHaveBeenCalledWith({ role: userData.role }, { sign: { sub: userData.id } });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
        id: userData.id,
        role: userData.role,
        token: fakeToken
    });
  });

  it('should return status 400 for invalid credentials', async () => {
    // Arrange
    const serviceError = new InvalidCredentialError();
    authenticateUserServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await authenticateUser(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: serviceError.message });
  });

  it('should re-throw other errors', async () => {
    // Arrange
    const unexpectedError = new Error('Database is down');
    authenticateUserServiceMock.execute.mockRejectedValue(unexpectedError);

    // Act & Assert
    await expect(
        authenticateUser(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow(unexpectedError);
  });
});