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
    PostWithMetrics,
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

// Extendemos PostWithMetrics para incluir la categoría sin romper el contrato del dominio
interface EnrichedPost extends PostWithMetrics {
    categoryName: string | null
}

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

        const enriched: EnrichedPost[] = await Promise.all(
            posts.map(async (post) => {
                const [likesCount, comments] = await Promise.all([
                    this.likeRepository.countByPostId(post.id),
                    this.commentRepository.findByPostId(post.id),
                ])

                return {
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    imageUrl: post.imageUrl,
                    categoryId: post.categoryId,
                    categoryName: post.category?.name ?? null,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                    likesCount,
                    commentsCount: comments.length,
                    score: 0,
                }
            }),
        )

        const strategy = FeedRankingStrategyFactory.create(
            input.orderBy ?? "recent",
        )
        const ranked = strategy.rank<EnrichedPost>(enriched)

        return ranked.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.content, // CORRECCIÓN: El dominio usa 'content', la salida HTTP usa 'description'
            imageUrl: p.imageUrl,
            categoryId: p.categoryId,
            category: p.categoryName,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            likesCount: p.likesCount,
            commentsCount: p.commentsCount,
            relevanceScore: p.score,
        }))
    }
}