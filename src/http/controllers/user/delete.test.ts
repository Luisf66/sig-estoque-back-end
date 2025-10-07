import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { deleteUser } from './delete'; // Ajuste o caminho
import { ResourceNotFoundError } from '../../../services/errors/resource-not-found-error';

// Mock da factory que cria o service
const deleteUserServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/user/make-delete-user-service', () => {
  return {
    makeDeleteUserService: () => deleteUserServiceMock,
  };
});

describe('Delete User Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  const userIdToDelete = 'user-01';

  beforeEach(() => {
    request = {
      params: { id: userIdToDelete },
    };
    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should delete a user and return status 200', async () => {
    // Arrange
    deleteUserServiceMock.execute.mockResolvedValue(undefined);

    // Act
    await deleteUser(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(deleteUserServiceMock.execute).toHaveBeenCalledWith({ id: userIdToDelete });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ message: "User successfully deleted." });
  });

  it('should return status 404 if user is not found', async () => {
    // Arrange
    const serviceError = new ResourceNotFoundError();
    deleteUserServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await deleteUser(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "User not found" });
  });

  it('should return status 500 for other errors', async () => {
    // Arrange
    const unexpectedError = new Error('Internal service error');
    deleteUserServiceMock.execute.mockRejectedValue(unexpectedError);

    // Act
    await deleteUser(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });

  it('should return status 500 for invalid params', async () => {
    // Arrange
    // Força um erro de validação do Zod, que será capturado pelo catch genérico
    request.params = { id: undefined }; 

    // Act
    await deleteUser(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});