import { Module } from "@nestjs/common"
import { CategoriesModule } from "@/categories/categories.module"
import { CommentsModule } from "@/comments/comments.module"
import { LikesModule } from "@/likes/likes.module"
import { ModerationModule } from "@/moderation/moderation.module"
import { PostsModule } from "@/posts/posts.module"
import { PrismaModule } from "@/shared/prisma.module"

@Module({
    imports: [
        PrismaModule,
        CategoriesModule,
        PostsModule,
        CommentsModule,
        LikesModule,
        ModerationModule,
    ],
})
export class AppModule {}
