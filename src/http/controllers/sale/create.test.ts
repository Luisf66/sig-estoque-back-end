import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { createSale } from './create'; // Ajuste o caminho

// Mock da factory que cria o service
const createSaleServiceMock = {
  handle: vi.fn(),
};

vi.mock('../../../services/factories/sale/make-create-sale-service', () => {
  return {
    makeCreateSaleService: () => createSaleServiceMock,
  };
});

describe('Create Sale Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      body: {},
    };

    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a sale and return status 201', async () => {
    // Arrange
    request.body = {
      nf_number: 'NF-SALE-001',
      userId: 'user-id-123',
      items: [
        {
          productId: 'prod-id-01',
          quantity: 2,
          value: 50.0,
        },
      ],
    };
    createSaleServiceMock.handle.mockResolvedValue(undefined);

    // Act
    await createSale(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(createSaleServiceMock.handle).toHaveBeenCalledWith(request.body);
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalled();
  });

  it('should return status 400 if the body is invalid', async () => {
    // Arrange
    request.body = {
      // nf_number is missing
      userId: 'user-id-123',
      items: [],
    };

    // Act
    await createSale(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Invalid request payload' });
  });

  it('should return status 500 if the service fails', async () => {
    // Arrange
    request.body = {
      nf_number: 'NF-SALE-002',
      userId: 'user-id-456',
      items: [
        {
          productId: 'prod-id-02',
          quantity: 1,
          value: 100.0,
        },
      ],
    };
    const serviceError = new Error('Insufficient stock');
    createSaleServiceMock.handle.mockRejectedValue(serviceError);

    // Act
    await createSale(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});
