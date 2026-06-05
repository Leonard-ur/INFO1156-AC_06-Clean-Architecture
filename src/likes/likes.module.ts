import { Module } from "@nestjs/common"
import { LikesController } from "@/likes/likes.controller"
import { LikesService } from "@/likes/likes.service"
import { PrismaModule } from "@/shared/prisma.module"

@Module({
    imports: [PrismaModule],
    controllers: [LikesController],
    providers: [LikesService],
})
export class LikesModule {}
