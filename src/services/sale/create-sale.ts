import { Sale, Item } from "@prisma/client";
import { SaleRepository } from "../../repositories/sale-repository";
import { ItemRepository } from "../../repositories/item-repository";
import { ProductRepository } from "../../repositories/product-repository";
interface CreateSaleServiceRequest {
    nf_number: string;
    userId: string;
    items: {
        productId: string;
        quantity: number;
        value: number;
    }[];
}

interface CreateSaleServiceResponse {
    newSale: Sale;
    items: Item[];
}

export class CreateSaleService {
    constructor(
        private saleRepository: SaleRepository,
        private itemRepository: ItemRepository,
        private productRepository: ProductRepository
    ) { }

    async handle({
        nf_number,
        userId,
        items
    }: CreateSaleServiceRequest): Promise<CreateSaleServiceResponse> {
        const sale = await this.saleRepository.create({
            nf_number,
            user: {
                connect: { id: userId }
            }
        });

        const productsIds = items.map((item) => item.productId);

        // Buscar todos os produtos, incluindo inativos
        const products = await this.productRepository.findManyByIds(productsIds);

        // Verificar se todos os produtos foram encontrados
        const notFoundProducts = productsIds.filter(id => !products.find(product => product.id === id));
        if (notFoundProducts.length > 0) {
            throw new Error('Product not found' + { productsIds });
        }

        // Verificar se os produtos estão ativos e se há estoque suficiente
        for (const product of products) {
            const correspondingItem = items.find(item => item.productId === product.id);

            if (!product.is_active) {
                throw new Error(`Product ${product.name} is inactive`);
            }

            if (product.quantity_in_stock == null) {
                throw new Error(`Stock quantity for product ${product.name} is undefined`);
            }

            if (product.quantity_in_stock < correspondingItem!.quantity) {
                throw new Error(`Insufficient stock for product ${product.name}`);
            }
        }

        const createdItems = await Promise.all(
            items.map(async (item) => {
                await this.productRepository.reduceStock(item.productId, item.quantity);

                return this.itemRepository.create({
                    sale: { connect: { id: sale.id } },
                    quantity: item.quantity,
                    value: item.value,
                    product: {
                        connect: { id: item.productId }
                    },
                });
            })
        );

        const subTotal = createdItems.reduce((acc, item) => {
            return acc + item.value * item.quantity;
        }, 0);

        const newSale = await this.saleRepository.updateSubTotal(sale.id, subTotal);

        return {
            newSale,
            items: createdItems
        };
    }
}    