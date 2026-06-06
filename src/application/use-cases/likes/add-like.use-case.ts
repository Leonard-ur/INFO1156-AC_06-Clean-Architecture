import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { AddLikeInput } from "@/application/types"
import {
    LIKE_REPOSITORY,
    ILikeRepository,
    POST_REPOSITORY,
    IPostRepository,
} from "@/domain/repositories"
import { ReactionType } from "@/domain/value-objects/reaction-type.vo"

/**
 * AddLikeUseCase
 *
 * Registra una reacción (like) sobre un post existente.
 *
 * NUEVO use case: el módulo `likes` solo tenía LikesService que inyectaba
 * PrismaService directamente. Este use case reemplaza esa lógica siguiendo
 * el mismo patrón que posts y comments.
 *
 * Usa el value object ReactionType del dominio en lugar del tipo de Prisma.
 */
@Injectable()
export class AddLikeUseCase {
    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepository: IPostRepository,

        @Inject(LIKE_REPOSITORY)
        private readonly likeRepository: ILikeRepository,
    ) {}

    async execute(postId: string, data: AddLikeInput): Promise<unknown> {
        const post = await this.postRepository.findById(postId)
        if (!post) {
            throw new NotFoundException("Post no encontrado")
        }

        const weight = data.weight ?? 1
        if (weight < 1) {
            throw new BadRequestException("El peso debe ser al menos 1")
        }

        const reactionType = this.resolveReactionType(data.reactionType)

        return this.likeRepository.create({
            postId,
            reactionType,
        })
    }

    private resolveReactionType(raw?: string): ReactionType {
        const normalized = raw?.toUpperCase()
        if (normalized && normalized in ReactionType) {
            return ReactionType[normalized as keyof typeof ReactionType]
        }
        return ReactionType.LIKE
    }
}
