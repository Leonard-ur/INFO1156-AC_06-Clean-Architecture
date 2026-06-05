import { Body, Controller, Get, Post, Query } from "@nestjs/common"

import { FeedRankingStrategyFactory } from "@/posts/feed-ranking.strategy"
import { CreatePostDto, FeedQueryDto } from "@/http/dtos"
import { CreatePostUseCase, GetAllPostsUseCase, GetFeedPostsUseCase } from "@/application/use-cases/posts"

@Controller("api/posts")
export class PostsController {
    constructor(
        private readonly createPostUseCase: CreatePostUseCase,
        private readonly getAllPostsUseCase: GetAllPostsUseCase,
        private readonly getFeedPostsUseCase: GetFeedPostsUseCase,
        private readonly feedRankingFactory: FeedRankingStrategyFactory,
    ) {}

    @Post()
    async create(@Body() body: CreatePostDto) {
        // Transformar DTO → tipo de aplicación
        const created = await this.createPostUseCase.execute({
            title: body.title,
            description: body.description,
            imageUrl: body.imageUrl,
            categoryId: body.categoryId,
        })

        return {
            ok: true,
            payload: created,
        }
    }

    @Get()
    async findAll() {
        const posts = await this.getAllPostsUseCase.execute()

        return {
            total: posts.length,
            items: posts,
        }
    }

    @Get("feed")
    async getFeed(@Query() query: FeedQueryDto) {
        const mode = query.mode ?? "latest"
        
        // Transformar DTO → tipo de aplicación
        const feedPosts = await this.getFeedPostsUseCase.execute({
            categoryId: query.categoryId,
        })
        
        const rankedPosts = this.feedRankingFactory
            .forMode(mode)
            .rank(feedPosts)

        return {
            mode,
            count: rankedPosts.length,
            rows: rankedPosts,
        }
    }
}
