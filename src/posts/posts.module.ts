import { Module } from "@nestjs/common"
import { FeedRankingStrategyFactory } from "@/posts/feed-ranking.strategy"
import { ModerationModule } from "@/moderation/moderation.module"
import { PostsService } from "@/posts/posts.service"
import { PrismaModule } from "@/shared/prisma.module"

@Module({
    imports: [ModerationModule, PrismaModule],
    providers: [PostsService, FeedRankingStrategyFactory],
    exports: [PostsService, FeedRankingStrategyFactory],
})
export class PostsModule {}
