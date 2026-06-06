import { Module } from "@nestjs/common"

// Posts
import { CreatePostUseCase } from "@/application/use-cases/posts/create-post.use-case"
import { GetAllPostsUseCase } from "@/application/use-cases/posts/get-all-posts.use-case"
import { GetFeedPostsUseCase } from "@/application/use-cases/posts/get-feed-posts.use-case"

// Comments
import { CreateCommentUseCase } from "@/application/use-cases/comments/create-comment.use-case"
import { ListCommentsUseCase } from "@/application/use-cases/comments/list-comments.use-case"

// Likes
import { AddLikeUseCase } from "@/application/use-cases/likes/add-like.use-case"

// Categories
import { GetCategoriesUseCase } from "@/application/use-cases/categories/get-categories.use-case"

// InfrastructureModule provee los providers con los tokens del dominio:
// POST_REPOSITORY, COMMENT_REPOSITORY, LIKE_REPOSITORY, CATEGORY_REPOSITORY, MODERATION_SERVICE
import { InfrastructureModule } from "@/infrastructure/infrastructure.module"

/**
 * ApplicationModule
 *
 * Registra todos los use cases de la capa de aplicación.
 *
 * CAMBIO vs versión original:
 *   Antes importaba PrismaModule y ModerationModule directamente,
 *   lo que acoplaba la capa de aplicación a la infraestructura.
 *   Ahora solo importa InfrastructureModule, que provee todas las
 *   implementaciones concretas mapeadas a los tokens del dominio.
 *
 * Los use cases dependen de interfaces (tokens Symbol), nunca de clases concretas.
 */
@Module({
    imports: [InfrastructureModule],
    providers: [
        // Posts
        CreatePostUseCase,
        GetAllPostsUseCase,
        GetFeedPostsUseCase,
        // Comments
        CreateCommentUseCase,
        ListCommentsUseCase,
        // Likes
        AddLikeUseCase,
        // Categories
        GetCategoriesUseCase,
    ],
    exports: [
        CreatePostUseCase,
        GetAllPostsUseCase,
        GetFeedPostsUseCase,
        CreateCommentUseCase,
        ListCommentsUseCase,
        AddLikeUseCase,
        GetCategoriesUseCase,
    ],
})
export class ApplicationModule {}
