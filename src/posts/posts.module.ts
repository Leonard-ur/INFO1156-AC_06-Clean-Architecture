import { Module } from "@nestjs/common"
import { FeedRankingStrategyFactory } from "@/posts/feed-ranking.strategy"

/**
 * PostsModule: Proporciona solo la estrategia de feed ranking
 * 
 * NOTA: 
 * - PostsService está deprecated (usar use cases en application layer)
 * - PostsController está deprecated (usar HttpModule)
 * - Lógica de negocio está en src/application/use-cases/posts/
 */
@Module({
    providers: [FeedRankingStrategyFactory],
    exports: [FeedRankingStrategyFactory],
})
export class PostsModule {}
