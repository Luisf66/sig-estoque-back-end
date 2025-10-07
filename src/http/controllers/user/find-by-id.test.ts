import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { findUserByid } from './find-by-id'; // Ajuste o caminho
import { ResourceNotFoundError } from '../../../services/errors/resource-not-found-error';

// Mock da factory que cria o service
const getUserByIdServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/user/make-get-user-by-id', () => {
  return {
    makeGetUserByIdService: () => getUserByIdServiceMock,
  };
});

describe('Find User By Id Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  const userIdToFind = 'user-01';

  beforeEach(() => {
    request = {
      params: { id: userIdToFind },
    };
    reply = {
      status: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return a user and status 200', async () => {
    // Arrange
    const user = { id: userIdToFind, name: 'John Doe' };
    getUserByIdServiceMock.execute.mockResolvedValue({ user });

    // Act
    await findUserByid(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(getUserByIdServiceMock.execute).toHaveBeenCalledWith({ userId: userIdToFind });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ user });
  });

  it('should return status 404 if user is not found by service return', async () => {
    // Arrange
    getUserByIdServiceMock.execute.mockResolvedValue({ user: null });

    // Act
    await findUserByid(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "User not found" });
  });

  it('should return status 404 if service throws ResourceNotFoundError', async () => {
    // Arrange
    const serviceError = new ResourceNotFoundError();
    getUserByIdServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await findUserByid(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: serviceError.message });
  });

  it('should return status 500 for other errors', async () => {
    // Arrange
    const unexpectedError = new Error('Internal service error');
    getUserByIdServiceMock.execute.mockRejectedValue(unexpectedError);

    // Act
    await findUserByid(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});