import { Module } from "@nestjs/common"
import { PrismaModule } from "@/shared/prisma.module"
import { ModerationModule } from "@/moderation/moderation.module"
import { CategoriesModule } from "@/categories/categories.module"
import { LikesModule } from "@/likes/likes.module"

/**
 * InfrastructureModule: Agrupa todos los módulos de infraestructura
 * - Acceso a datos (Prisma)
 * - Servicios externos (Moderación)
 * - Módulos de base de datos (Categorías, Likes)
 */
@Module({
    imports: [
        PrismaModule,
        ModerationModule,
        CategoriesModule,
        LikesModule,
    ],
    exports: [
        PrismaModule,
        ModerationModule,
        CategoriesModule,
        LikesModule,
    ],
})
export class InfrastructureModule {}
