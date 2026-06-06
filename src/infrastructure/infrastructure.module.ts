import { Module } from "@nestjs/common"
import { PrismaModule } from "@/shared/prisma.module"
import { ModerationModule } from "@/moderation/moderation.module"
import { CategoriesModule } from "@/categories/categories.module"
import { LikesModule } from "@/likes/likes.module"

// Tokens del Dominio
import {
    POST_REPOSITORY,
    COMMENT_REPOSITORY,
    LIKE_REPOSITORY,
    CATEGORY_REPOSITORY,
} from "@/domain/repositories"
import { MODERATION_SERVICE } from "@/domain/services/moderation.service.interface"

// Implementaciones de Infraestructura
import { PrismaPostRepository } from "./persistence/repositories/post.repository"
import { PrismaCommentRepository } from "./persistence/repositories/comment.repository"
import { PrismaLikeRepository } from "./persistence/repositories/like.repository"
import { PrismaCategoryRepository } from "./persistence/repositories/category.repository"
import { ModerationService } from "@/moderation/moderation.service"

@Module({
    imports: [
        PrismaModule,
        ModerationModule,
        CategoriesModule,
        LikesModule,
    ],
    providers: [
        {
            provide: POST_REPOSITORY,
            useClass: PrismaPostRepository,
        },
        {
            provide: COMMENT_REPOSITORY,
            useClass: PrismaCommentRepository,
        },
        {
            provide: LIKE_REPOSITORY,
            useClass: PrismaLikeRepository,
        },
        {
            provide: CATEGORY_REPOSITORY,
            useClass: PrismaCategoryRepository,
        },
        {
            provide: MODERATION_SERVICE,
            useExisting: ModerationService, // useExisting porque ModerationModule ya lo instancia
        },
    ],
    exports: [
        PrismaModule,
        ModerationModule,
        CategoriesModule,
        LikesModule,
        // Exportamos los tokens para que ApplicationModule pueda inyectarlos
        POST_REPOSITORY,
        COMMENT_REPOSITORY,
        LIKE_REPOSITORY,
        CATEGORY_REPOSITORY,
        MODERATION_SERVICE,
    ],
})
export class InfrastructureModule {}