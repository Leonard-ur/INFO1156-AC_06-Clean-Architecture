import { Module } from "@nestjs/common"
import { ModerationController } from "@/moderation/moderation.controller"
import { ModerationService } from "@/moderation/moderation.service"

@Module({
    controllers: [ModerationController],
    providers: [ModerationService],
    exports: [ModerationService],
})
export class ModerationModule {}
