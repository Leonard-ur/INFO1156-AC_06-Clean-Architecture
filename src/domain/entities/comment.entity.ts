/**
 * Entidad de dominio: Comment
 *
 * Representa un comentario hecho sobre una publicación.
 * No importa Prisma — es un tipo puro del negocio.
 */
export class Comment {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly postId: string,
    public readonly createdAt: Date,
  ) {}

  static create(
    content: string,
    postId: string,
  ): Pick<Comment, 'content' | 'postId'> {
    return { content, postId };
  }
}
