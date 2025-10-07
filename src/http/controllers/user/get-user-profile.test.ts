import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { profile } from './get-user-profile'; // Ajuste o caminho
import { ResourceNotFoundError } from '../../../services/errors/resource-not-found-error';

// Mock das factories que criam os services
const getUserProfileServiceMock = {
  execute: vi.fn(),
};

const findManagerByUserIdServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/user/make-get-user-profile-service', () => ({
  makeGetUserProfileService: () => getUserProfileServiceMock,
}));

vi.mock('../../../services/factories/manager/make-find-manager-by-user-id-service', () => ({
  makeFindManagerByUserIdService: () => findManagerByUserIdServiceMock,
}));


describe('Get User Profile Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      // Mock da verificação JWT e do usuário decodificado
      jwtVerify: vi.fn().mockResolvedValue(undefined),
      user: {
        sub: 'user-01',
        role: 'MANAGER' // Role padrão para os testes
      },
    };
    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return user and manager profile for a MANAGER role', async () => {
    // Arrange
    const user = { id: 'user-01', name: 'John Doe', role: 'MANAGER' };
    const managerProfile = { manager: { id: 'manager-01', userId: 'user-01' } };
    
    getUserProfileServiceMock.execute.mockResolvedValue({ user });
    findManagerByUserIdServiceMock.execute.mockResolvedValue(managerProfile);

    // Act
    await profile(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(request.jwtVerify).toHaveBeenCalled();
    expect(getUserProfileServiceMock.execute).toHaveBeenCalledWith({ userId: 'user-01' });
    expect(findManagerByUserIdServiceMock.execute).toHaveBeenCalledWith({ userId: 'user-01' });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ user, switchedUser: managerProfile });
  });

  it('should return 404 if user is not found', async () => {
    // Arrange
    const serviceError = new ResourceNotFoundError();
    getUserProfileServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await profile(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: serviceError.message });
  });

  it('should return 404 for an unsupported user role', async () => {
    // Arrange
    const user = { id: 'user-01', name: 'John Doe', role: 'ADMIN' }; // Role não tratada no switch
    getUserProfileServiceMock.execute.mockResolvedValue({ user });

    // Act
    await profile(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: expect.any(String) });
  });

  it('should return 500 for other unexpected errors', async () => {
    // Arrange
    const unexpectedError = new Error('Internal service error');
    getUserProfileServiceMock.execute.mockRejectedValue(unexpectedError);

    // Act
    await profile(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});