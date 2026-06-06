import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { CreatePostDto, FeedQueryDto } from "@/http/dtos"
import { CreatePostUseCase, GetAllPostsUseCase, GetFeedPostsUseCase } from "@/application/use-cases/posts"
import { FeedOrderMode } from "@/domain/services/feed-ranking.strategy"

@Controller("api/posts")
export class PostsController {
    constructor(
        private readonly createPostUseCase: CreatePostUseCase,
        private readonly getAllPostsUseCase: GetAllPostsUseCase,
        private readonly getFeedPostsUseCase: GetFeedPostsUseCase,
    ) {}

    @Post()
    async create(@Body() body: CreatePostDto) {
        const created: any = await this.createPostUseCase.execute({
            title: body.title,
            description: body.description,
            imageUrl: body.imageUrl,
            categoryId: body.categoryId,
        })

        // CORRECCIÓN: Mapeamos la entidad de dominio al contrato HTTP que esperan los tests
        return {
            ok: true,
            payload: {
                id: created.id,
                title: created.title,
                description: created.content, // Dominio 'content' -> HTTP 'description'
                imageUrl: created.imageUrl,
                categoryId: created.categoryId === "" ? null : created.categoryId, // HTTP espera null
                createdAt: created.createdAt,
                updatedAt: created.updatedAt
            },
        }
    }

    @Get()
    async findAll() {
        const posts = await this.getAllPostsUseCase.execute()

        return {
            total: Array.isArray(posts) ? posts.length : 0,
            items: posts,
        }
    }

    @Get("feed")
    async getFeed(@Query() query: FeedQueryDto) {
        const modeMap: Record<string, FeedOrderMode> = {
            latest: "recent",
            mostLiked: "popular",
            mostCommented: "most-commented",
            relevance: "relevance",
        }
        
        const domainMode = modeMap[query.mode ?? "latest"] ?? "recent"
        
        const feedPosts = await this.getFeedPostsUseCase.execute({
            categoryId: query.categoryId,
            orderBy: domainMode,
        })

        return {
            mode: query.mode ?? "latest",
            count: feedPosts.length,
            rows: feedPosts,
        }
    }
}