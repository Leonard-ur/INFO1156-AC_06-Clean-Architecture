import { Module } from "@nestjs/common"

/**
 * CommentsModule: Módulo vacío mantenido para compatibilidad
 * 
 * NOTA:
 * - CommentsService está deprecated (usar use cases en application layer)
 * - CommentsController está deprecated (usar HttpModule)
 * - Lógica de negocio está en src/application/use-cases/comments/
 * - CreateCommentUseCase
 * - ListCommentsUseCase
 */
@Module({})
export class CommentsModule {}
