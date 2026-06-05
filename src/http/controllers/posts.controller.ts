import { Body, Controller, Get, Post, Query } from "@nestjs/common"

import { FeedRankingStrategyFactory } from "@/posts/feed-ranking.strategy"
import { CreatePostDto, FeedQueryDto } from "@/posts/posts.dtos"
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
        const created = await this.createPostUseCase.execute(body)

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
        const feedPosts = await this.getFeedPostsUseCase.execute(query.categoryId)
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
