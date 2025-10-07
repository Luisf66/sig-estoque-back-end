import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { fetchAllUsers } from './fetch-all'; // Ajuste o caminho

// Mock da factory que cria o service
const getAllUsersServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/user/make-get-all-users-service', () => {
  return {
    makeGetAllUsersService: () => getAllUsersServiceMock,
  };
});

describe('Fetch All Users Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {}; // Não precisa de params ou body para este controller
    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return a list of users and status 200', async () => {
    // Arrange
    const usersList = [
      { id: 'user-01', name: 'John Doe' },
      { id: 'user-02', name: 'Jane Doe' },
    ];
    getAllUsersServiceMock.execute.mockResolvedValue({ users: usersList });

    // Act
    await fetchAllUsers(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(getAllUsersServiceMock.execute).toHaveBeenCalled();
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ users: usersList });
  });

  it('should return status 500 if the service fails', async () => {
    // Arrange
    const serviceError = new Error('Database connection failed');
    getAllUsersServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await fetchAllUsers(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });
});