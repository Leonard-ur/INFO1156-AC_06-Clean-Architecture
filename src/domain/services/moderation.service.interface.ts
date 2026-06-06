/**
 * IModerationService
 *
 * Interfaz del dominio para el servicio de moderación de contenido.
 *
 * PROBLEMA que resuelve:
 *   Los use cases (CreatePostUseCase, CreateCommentUseCase) inyectaban
 *   ModerationService directamente → dependencia de la capa de infraestructura.
 *   ModerationService a su vez inyecta PrismaService, lo que significa que
 *   el use case tenía una dependencia transitiva en Prisma.
 *
 * SOLUCIÓN:
 *   El use case depende de esta interfaz (dominio).
 *   ModerationService implementa esta interfaz (infraestructura).
 *   La inversión de dependencia queda completa.
 */
export const MODERATION_SERVICE = Symbol("IModerationService")

export interface ModerationResult {
    approved: boolean
    reason?: string
    category?: string
}

export interface IModerationService {
    moderate(text: string): Promise<ModerationResult>
}
