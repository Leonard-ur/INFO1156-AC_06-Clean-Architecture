import { Inject, Injectable } from "@nestjs/common"
import { GetFeedPostsInput } from "@/application/types"
import {
    POST_REPOSITORY,
    IPostRepository,
    LIKE_REPOSITORY,
    ILikeRepository,
    COMMENT_REPOSITORY,
    ICommentRepository,
} from "@/domain/repositories"
import {
    FeedRankingStrategyFactory,
    FeedOrderMode,
} from "@/domain/services/feed-ranking.strategy"

export interface FeedPostOutput {
    id: string
    title: string
    description: string
    imageUrl: string | null
    categoryId: string
    category: string | null
    createdAt: Date
    updatedAt: Date
    likesCount: number
    commentsCount: number
    relevanceScore: number
}

/**
 * GetFeedPostsUseCase
 *
 * Obtiene el feed de posts enriquecido con métricas y ordenado por estrategia.
 *
 * CAMBIO vs versión original:
 *   Antes: una sola query Prisma con includes (comments, likes, category).
 *   Ahora: tres repositorios independientes + estrategia de ranking del dominio.
 *
 * Beneficio: la lógica de ranking (PostScore, FeedRankingStrategy) ya estaba
 * en el dominio pero no se usaba. Ahora sí se aplica correctamente desde
 * el use case, sin que ninguna capa de infraestructura sepa de este cálculo.
 */
@Injectable()
export class GetFeedPostsUseCase {
    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepository: IPostRepository,

        @Inject(LIKE_REPOSITORY)
        private readonly likeRepository: ILikeRepository,

        @Inject(COMMENT_REPOSITORY)
        private readonly commentRepository: ICommentRepository,
    ) {}

    async execute(
        input: GetFeedPostsInput & { orderBy?: FeedOrderMode },
    ): Promise<FeedPostOutput[]> {
        const posts = await this.postRepository.findAll(
            input.categoryId ? { categoryId: input.categoryId } : undefined,
        )

        const enriched = await Promise.all(
            posts.map(async (post) => {
                const [likes, comments] = await Promise.all([
                    this.likeRepository.findByPostId(post.id),
                    this.commentRepository.findByPostId(post.id),
                ])

                const likesCount = likes.reduce((sum, l) => sum + 1, 0)
                const commentsCount = comments.length

                return {
                    id: post.id,
                    title: post.title,
                    description: post.content,
                    imageUrl: post.imageUrl,
                    categoryId: post.categoryId,
                    category: post.category?.name ?? null,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                    likesCount,
                    commentsCount,
                    score: 0,
                    relevanceScore: 0,
                }
            }),
        )

        const strategy = FeedRankingStrategyFactory.create(
            input.orderBy ?? "recent",
        )
        const ranked = strategy.rank(enriched)

        return ranked.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            imageUrl: p.imageUrl,
            categoryId: p.categoryId,
            category: p.category,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            likesCount: p.likesCount,
            commentsCount: p.commentsCount,
            relevanceScore: p.score,
        }))
    }
}
