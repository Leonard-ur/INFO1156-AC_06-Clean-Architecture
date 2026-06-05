import { Module } from "@nestjs/common"
import { PostsController } from "@/http/controllers/posts.controller"
import { CommentsController } from "@/http/controllers/comments.controller"
import { ApplicationModule } from "@/application/application.module"
import { PostsModule } from "@/posts/posts.module"

/**
 * HttpModule: Capa de presentación HTTP
 * 
 * Importa:
 * - ApplicationModule: para inyectar use cases
 * - PostsModule: para acceso a FeedRankingStrategyFactory
 */
@Module({
    imports: [ApplicationModule, PostsModule],
    controllers: [PostsController, CommentsController],
})
export class HttpModule {}
