import { Module } from "@nestjs/common"
import { LikesController } from "@/likes/likes.controller"
import { LikesService } from "@/likes/likes.service"
import { PostsModule } from "@/posts/posts.module"

@Module({
    imports: [PostsModule],
    controllers: [LikesController],
    providers: [LikesService],
})
export class LikesModule {}
