/**
 * Value object: PostScore
 *
 * Encapsula la lógica de cálculo de la puntuación de relevancia de un post.
 *
 * PROBLEMA que resuelve:
 *   En el código original, el cálculo de relevancia estaba dentro del servicio
 *   de posts, mezclado con la lógica de acceso a datos. Esto significa que la
 *   regla de negocio "cómo se calcula la relevancia" estaba acoplada a Prisma.
 *
 * SOLUCIÓN:
 *   La fórmula vive aquí, en el dominio. No importa nada externo.
 *   Cualquier capa puede calcular un score pasando solo datos primitivos.
 */
export class PostScore {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  /**
   * Calcula la puntuación de relevancia de un post.
   *
   * Fórmula:
   *   score = likes * 2 + comments * 1.5 - hoursOld * 0.1
   *
   * - Los likes tienen más peso que los comentarios.
   * - La antigüedad penaliza el score (los posts recientes son más relevantes).
   * - El mínimo es 0 (un post nunca tiene score negativo).
   */
  static calculate(params: {
    likesCount: number;
    commentsCount: number;
    createdAt: Date;
  }): PostScore {
    const hoursOld =
      (Date.now() - params.createdAt.getTime()) / (1000 * 60 * 60);

    const raw =
      params.likesCount * 2 + params.commentsCount * 1.5 - hoursOld * 0.1;

    return new PostScore(Math.max(0, Math.round(raw * 100) / 100));
  }
}
