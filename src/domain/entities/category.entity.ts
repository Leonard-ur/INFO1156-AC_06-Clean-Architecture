/**
 * Entidad de dominio: Category
 *
 * Representa una categoría del sistema (Tecnología, Arte, Ciencia, etc.).
 * Es una entidad pura: no importa ni conoce Prisma, NestJS ni ningún framework.
 * Los tipos de Prisma NO deben usarse aquí — solo tipos primitivos de TypeScript.
 */
export class Category {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: Date,
  ) {}

  /**
   * Crea una instancia de Category para ser persistida por primera vez.
   * El id será asignado por la capa de infraestructura (Prisma / cuid).
   */
  static create(name: string): Omit<Category, 'id' | 'createdAt'> {
    return { name };
  }
}
