import { Module } from "@nestjs/common"
import { PostsController } from "@/http/controllers/posts.controller"
import { CommentsController } from "@/http/controllers/comments.controller"
import { ApplicationModule } from "@/application/application.module"
import { FeedRankingStrategyFactory } from "@/posts/feed-ranking.strategy"

@Module({
    imports: [ApplicationModule],
    controllers: [PostsController, CommentsController],
    providers: [FeedRankingStrategyFactory],
})
export class HttpModule {}
