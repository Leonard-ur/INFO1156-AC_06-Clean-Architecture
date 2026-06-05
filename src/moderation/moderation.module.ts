import { Module } from "@nestjs/common"
import { ModerationController } from "@/moderation/moderation.controller"
import { ModerationService } from "@/moderation/moderation.service"
import { PrismaModule } from "@/shared/prisma.module"

@Module({
    imports: [PrismaModule],
    controllers: [ModerationController],
    providers: [ModerationService],
    exports: [ModerationService],
})
export class ModerationModule {}
