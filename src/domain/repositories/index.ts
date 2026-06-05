import { Post } from '../entities/post.entity';
import { Comment } from '../entities/comment.entity';
import { Like } from '../entities/like.entity';
import { Category } from '../entities/category.entity';
import { ReactionType } from '../value-objects/reaction-type.vo';

// ─── Tokens de inyección ────────────────────────────────────────────────────
// Se usan como tokens en el sistema de inyección de dependencias de NestJS.
// Esto permite que la capa de aplicación dependa de la interfaz (dominio)
// y no de la implementación concreta (infraestructura/Prisma).

export const POST_REPOSITORY = Symbol('IPostRepository');
export const COMMENT_REPOSITORY = Symbol('ICommentRepository');
export const LIKE_REPOSITORY = Symbol('ILikeRepository');
export const CATEGORY_REPOSITORY = Symbol('ICategoryRepository');

// ─── Interfaces de repositorio ───────────────────────────────────────────────

/**
 * IPostRepository
 *
 * Contrato que cualquier implementación de repositorio de posts debe cumplir.
 * La capa de aplicación (use cases) depende de esta interfaz, no de Prisma.
 *
 * PROBLEMA que resuelve:
 *   En el código original, los servicios hacen `this.prisma.post.findMany()`
 *   directamente. Si se cambia la base de datos, hay que modificar los servicios.
 *
 * SOLUCIÓN:
 *   Los servicios pasan a depender de esta interfaz. Solo la infraestructura
 *   (PrismaPostRepository) sabe cómo hablar con la base de datos.
 */
export interface IPostRepository {
  findAll(options?: { categoryId?: string }): Promise<Post[]>;
  findById(id: string): Promise<Post | null>;
  create(data: Pick<Post, 'title' | 'content' | 'categoryId' | 'imageUrl'>): Promise<Post>;
  update(id: string, data: Partial<Pick<Post, 'title' | 'content' | 'imageUrl'>>): Promise<Post>;
  delete(id: string): Promise<void>;
}

/**
 * ICommentRepository
 */
export interface ICommentRepository {
  findByPostId(postId: string): Promise<Comment[]>;
  create(data: Pick<Comment, 'content' | 'postId'>): Promise<Comment>;
  delete(id: string): Promise<void>;
}

/**
 * ILikeRepository
 */
export interface ILikeRepository {
  findByPostId(postId: string): Promise<Like[]>;
  create(data: Pick<Like, 'postId' | 'reactionType'>): Promise<Like>;
  countByPostId(postId: string): Promise<number>;
  getReactionSummary(postId: string): Promise<Record<ReactionType, number>>;
}

/**
 * ICategoryRepository
 */
export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  create(data: Pick<Category, 'name'>): Promise<Category>;
}
