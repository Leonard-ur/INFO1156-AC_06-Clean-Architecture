import { Inject, Injectable } from "@nestjs/common"
import { CATEGORY_REPOSITORY, ICategoryRepository } from "@/domain/repositories"

/**
 * GetCategoriesUseCase
 *
 * Retorna todas las categorías disponibles en el sistema.
 *
 * NUEVO use case: CategoriesService inyectaba PrismaService directamente.
 * Este use case reemplaza esa lógica usando ICategoryRepository del dominio.
 */
@Injectable()
export class GetCategoriesUseCase {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: ICategoryRepository,
    ) {}

    async execute(): Promise<unknown> {
        return this.categoryRepository.findAll()
    }
}
