import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { createPurchase } from './create'; // Ajuste o caminho conforme sua estrutura

// Mock da factory que cria o service
const createPurchaseServiceMock = {
  handle: vi.fn(),
};

vi.mock('../../../services/factories/purchase/make-create-purchase-service', () => {
  return {
    makeCreatePurchaseService: () => createPurchaseServiceMock,
  };
});

describe('Create Purchase Controller', () => {
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

  it('should create a purchase successfully and return status 201', async () => {
    // Arrange
    const purchaseData = {
      nf_number: 'NF-12345',
      supplierId: 'supplier-01',
      userId: 'user-01',
      items: [
        { productId: 'prod-01', quantity: 10, value: 15.5 },
        { productId: 'prod-02', quantity: 5, value: 100.0 },
      ],
    };
    request.body = purchaseData;

    createPurchaseServiceMock.handle.mockResolvedValue(undefined);

    // Act
    await createPurchase(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(createPurchaseServiceMock.handle).toHaveBeenCalledWith(purchaseData);
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalled();
  });

  it('should throw an error if body is invalid', async () => {
    // Arrange
    request.body = {
      nf_number: 'NF-12345',
      // Missing other required fields
    };

    // Act & Assert
    await expect(
      createPurchase(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow();
  });

  it('should throw an error when the service fails', async () => {
    // Arrange
    const purchaseData = {
      nf_number: 'NF-12345',
      supplierId: 'supplier-01',
      userId: 'user-01',
      items: [{ productId: 'prod-01', quantity: 10, value: 15.5 }],
    };
    request.body = purchaseData;

    const serviceError = new Error('Insufficient stock for product');
    createPurchaseServiceMock.handle.mockRejectedValue(serviceError);

    // Act & Assert
    await expect(
      createPurchase(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow(serviceError);
  });
});