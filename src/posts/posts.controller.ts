import { Body, Controller, Get, Post, Query } from "@nestjs/common"

import { PostsService } from "@/posts/posts.service"
import { FeedRankingStrategyFactory } from "@/posts/feed-ranking.strategy"
import { CreatePostDto, FeedQueryDto } from "@/posts/posts.dtos"

@Controller("api/posts")
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly feedRankingFactory: FeedRankingStrategyFactory,
    ) {}

    @Post()
    async create(@Body() body: CreatePostDto) {
        const created = await this.postsService.create(body)

        return {
            ok: true,
            payload: created,
        }
    }

    @Get()
    async findAll() {
        const posts = await this.postsService.findAll()

        return {
            total: posts.length,
            items: posts,
        }
    }

    @Get("feed")
    async getFeed(@Query() query: FeedQueryDto) {
        const mode = query.mode ?? "latest"
        const feedPosts = await this.postsService.getFeedPosts(query.categoryId)
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
