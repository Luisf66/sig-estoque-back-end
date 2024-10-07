import { FastifyReply, FastifyRequest } from 'fastify';
import { makeFindPurchaseByIdService } from '../../../services/factories/purchase/make-find-purchase-by-id-service';

export async function findPurchaseById(request: FastifyRequest, reply: FastifyReply) {
  const findPurchaseByIdService = makeFindPurchaseByIdService();

  const { id } = request.params as { id: string };

  try {
    const { purchase } = await findPurchaseByIdService.execute({
      purchaseId: id,
    });

    reply.code(200).send({
      purchase,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Resource not found') {
      reply.code(404).send({
        error: 'Not Found',
        message: 'Resource not found',
        statusCode: 404,
      });
    } else {
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500,
      });
    }
  }
}
