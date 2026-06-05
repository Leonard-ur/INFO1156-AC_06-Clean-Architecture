import { ReactionType } from '../value-objects/reaction-type.vo';

/**
 * Entidad de dominio: Like
 *
 * Representa una reacción (like, love, etc.) sobre una publicación.
 * Usa el value object `ReactionType` definido en el dominio,
 * no el enum de Prisma.
 */
export class Like {
  constructor(
    public readonly id: string,
    public readonly postId: string,
    public readonly reactionType: ReactionType,
    public readonly createdAt: Date,
  ) {}

  static create(
    postId: string,
    reactionType: ReactionType,
  ): Pick<Like, 'postId' | 'reactionType'> {
    return { postId, reactionType };
  }
}
