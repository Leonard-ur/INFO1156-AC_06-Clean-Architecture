import { Category } from './category.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';

/**
 * Entidad de dominio: Post
 *
 * Representa una publicación del feed. Es la entidad central del sistema.
 *
 * PROBLEMA que resuelve:
 *   En el código original, los servicios trabajan directamente con el tipo
 *   `Post` generado por Prisma (`import { Post } from '@prisma/client'`).
 *   Esto acopla el negocio a la base de datos: si se cambia el ORM o el esquema,
 *   hay que modificar la lógica de negocio.
 *
 * SOLUCIÓN:
 *   Esta clase representa el concepto de "publicación" desde el punto de vista
 *   del negocio, sin ninguna dependencia externa. La capa de infraestructura
 *   (PrismaPostRepository) será responsable de convertir entre este tipo y el
 *   tipo de Prisma mediante un mapper.
 */
export class Post {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly content: string,
    public readonly imageUrl: string | null,
    public readonly categoryId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    // Relaciones opcionales: solo presentes cuando se cargan explícitamente
    public readonly category?: Category,
    public readonly comments?: Comment[],
    public readonly likes?: Like[],
  ) {}

  /**
   * Crea los datos necesarios para persistir una nueva publicación.
   * No asigna id ni fechas — eso corresponde a la infraestructura.
   */
  static create(
    title: string,
    content: string,
    categoryId: string,
    imageUrl?: string,
  ): Pick<Post, 'title' | 'content' | 'categoryId' | 'imageUrl'> {
    return { title, content, categoryId, imageUrl: imageUrl ?? null };
  }
}
