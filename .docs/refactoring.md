# Refactorización: Aplicación de Clean Architecture

## Problema que resuelve

### Estado Anterior
1. **Lógica de negocio en controllers**: Los controllers (`PostsController`, `CommentsController`) tenían responsabilidades de orquestación directa sin abstracción.
2. **Acceso directo a Prisma en servicios**: Los servicios (`PostsService`, `CommentsService`) accedían directamente a `PrismaService` sin separación de capas.
3. **Estructura de módulos desordenada**: El `AppModule` importaba todos los módulos sin orden lógico por capas arquitectónicas.
4. **Falta de capa de aplicación**: No existían use cases para encapsular la lógica de negocio de forma reutilizable.

### Impacto Negativo
- Dificultad para testear lógica de negocio de forma aislada
- Acoplamiento fuerte entre presentación y persistencia
- Falta de reutilización de lógica de negocio
- Falta de claridad en las responsabilidades de cada capa

---

## Solución Implementada

### Arquitectura en Capas

La aplicación ahora sigue la estructura **Clean Architecture** en tres capas principales:

```
┌─────────────────────────────────────────┐
│        HTTP Layer (Presentación)        │
│  ┌───────────────────────────────────┐  │
│  │  PostsController                  │  │
│  │  - create()                       │  │
│  │  - findAll()                      │  │
│  │  - getFeed()                      │  │
│  │                                   │  │
│  │  CommentsController               │  │
│  │  - list()                         │  │
│  │  - create()                       │  │
│  └───────────────────────────────────┘  │
│              HttpModule                  │
└─────────────────────────────────────────┘
              ↓ depende de
┌─────────────────────────────────────────┐
│     Application Layer (Lógica)          │
│  ┌───────────────────────────────────┐  │
│  │  CreatePostUseCase                │  │
│  │  GetAllPostsUseCase               │  │
│  │  GetFeedPostsUseCase              │  │
│  │  CreateCommentUseCase             │  │
│  │  ListCommentsUseCase              │  │
│  └───────────────────────────────────┘  │
│           ApplicationModule              │
└─────────────────────────────────────────┘
              ↓ depende de
┌─────────────────────────────────────────┐
│  Infrastructure Layer (Datos/External)  │
│  ┌───────────────────────────────────┐  │
│  │  PrismaModule                     │  │
│  │  ModerationModule                 │  │
│  │  CategoriesModule                 │  │
│  │  LikesModule                      │  │
│  │  PostsModule (servicios)          │  │
│  │  CommentsModule (servicios)       │  │
│  └───────────────────────────────────┘  │
│        InfrastructureModule              │
└─────────────────────────────────────────┘
```

---

## Cambios Realizados

### 1. Capa de Aplicación (NEW)
**Ubicación**: `src/application/`

**Use Cases Creados**:
- `CreatePostUseCase`: Encapsula la lógica de creación de posts con moderación
- `GetAllPostsUseCase`: Obtiene todos los posts ordenados
- `GetFeedPostsUseCase`: Obtiene posts para el feed con datos relacionados
- `CreateCommentUseCase`: Encapsula la lógica de creación de comentarios
- `ListCommentsUseCase`: Lista comentarios de un post específico

**Ventajas**:
✓ Lógica de negocio centralizada y reutilizable
✓ Facilita testing unitario sin dependencias de HTTP
✓ Responsabilidad única y clara

### 2. Capa HTTP (NEW)
**Ubicación**: `src/http/`

**Controllers Refactorizados**:
- `PostsController` (antes en `src/posts/`)
  - Inyecta use cases en lugar de servicios
  - Solo orquesta requests HTTP → use cases
  - Sin lógica de negocio

- `CommentsController` (antes en `src/comments/`)
  - Inyecta use cases en lugar de servicios
  - Solo orquesta requests HTTP → use cases

**Ventajas**:
✓ Controllers delgados y enfocados
✓ Fácil de mantener y testear
✓ Responsabilidad única: mapeo HTTP ↔ use cases

### 3. Capa de Infraestructura (NEW)
**Ubicación**: `src/infrastructure/`

**Módulo Creado**:
- `InfrastructureModule`: Agrupa módulos de persistencia y servicios externos
  - PrismaModule (acceso a datos)
  - ModerationModule (servicios externos)
  - CategoriesModule (dominio)
  - LikesModule (dominio)

**Ventajas**:
✓ Separación clara de responsabilidades
✓ Facilita la inyección de dependencias
✓ Permite cambiar implementaciones de infraestructura sin afectar la lógica

### 4. Reorganización del AppModule
**Cambio**:
```typescript
// ANTES: Caótico
@Module({
    imports: [
        PrismaModule,
        CategoriesModule,
        PostsModule,        // con controller (conflicto)
        CommentsModule,     // con controller (conflicto)
        LikesModule,
        ModerationModule,
    ],
})

// DESPUÉS: Estructura clara
@Module({
    imports: [
        InfrastructureModule,  // Capa de infraestructura
        ApplicationModule,     // Capa de aplicación
        HttpModule,            // Capa de presentación
    ],
})
```

**Ventajas**:
✓ Orden claro de dependencias
✓ Fácil de entender la arquitectura
✓ Modular y escalable

### 5. Actualización de módulos existentes
- `PostsModule`: Removido controller, solo servicios/providers
- `CommentsModule`: Removido controller, solo servicios/providers

**Razón**: Los controllers ahora pertenecen a `HttpModule`

---

## Flujo de Dependencias

### Antes (Problémático)
```
PostsController 
  ↓ (inyecta directamente)
PostsService 
  ↓ (usa directamente)
PrismaService
```

### Después (Clean Architecture)
```
HTTP Request
  ↓
PostsController (delgado, solo orquesta)
  ↓ (inyecta use case)
CreatePostUseCase (lógica de negocio)
  ↓ (usa)
PrismaService (persistencia)
```

---

## Beneficios Alcanzados

### 1. Separación de Responsabilidades
- **Controllers**: Solo mapean HTTP → use cases
- **Use Cases**: Encapsulan lógica de negocio
- **Servicios**: Acceso a persistencia/externos

### 2. Testabilidad Mejorada
```typescript
// Ahora podemos testear la lógica sin HTTP:
const createPostUseCase = new CreatePostUseCase(prismaService, moderationService);
const result = await createPostUseCase.execute(dto); // ✓ Fácil de testear
```

### 3. Reutilización de Lógica
Los use cases pueden ser reutilizados:
- En controllers HTTP
- En CLI commands
- En GraphQL resolvers
- En WebSocket handlers

### 4. Escalabilidad
Agregar nuevas funcionalidades es más fácil:
```typescript
// Nueva funcionalidad: export posts
export class ExportPostsUseCase {
    constructor(private readonly prisma: PrismaService) {}
    async execute() { /* ... */ }
}

// Se integra naturalmente en la arquitectura
```

---

## Comparativa de Archivos

### Antes
```
src/
├── posts/
│   ├── posts.controller.ts      ❌ Lógica + HTTP
│   ├── posts.service.ts         ❌ Lógica + Prisma
│   └── posts.module.ts
├── comments/
│   ├── comments.controller.ts   ❌ Lógica + HTTP
│   ├── comments.service.ts      ❌ Lógica + Prisma
│   └── comments.module.ts
└── app.module.ts                ❌ Desorganizado
```

### Después
```
src/
├── application/                 ✓ NUEVA CAPA
│   ├── use-cases/
│   │   ├── posts/
│   │   │   ├── create-post.use-case.ts
│   │   │   ├── get-all-posts.use-case.ts
│   │   │   └── get-feed-posts.use-case.ts
│   │   └── comments/
│   │       ├── create-comment.use-case.ts
│   │       └── list-comments.use-case.ts
│   └── application.module.ts
├── http/                        ✓ NUEVA CAPA
│   ├── controllers/
│   │   ├── posts.controller.ts  ✓ Solo HTTP
│   │   └── comments.controller.ts ✓ Solo HTTP
│   └── http.module.ts
├── infrastructure/              ✓ NUEVA CAPA
│   └── infrastructure.module.ts
├── posts/
│   ├── posts.service.ts         ✓ Solo servicios (sin controller)
│   └── posts.module.ts
├── comments/
│   ├── comments.service.ts      ✓ Solo servicios (sin controller)
│   └── comments.module.ts
└── app.module.ts                ✓ Organizado por capas
```

---

## Migración Mínima para Usuarios

**Endpoints HTTP**: Sin cambios
```
POST   /api/posts              ✓ Igual
GET    /api/posts              ✓ Igual
GET    /api/posts/feed         ✓ Igual
POST   /api/posts/:id/comments ✓ Igual
GET    /api/posts/:id/comments ✓ Igual
POST   /api/posts/:id/likes    ✓ Igual
```

**Respuestas**: Sin cambios
```json
{ "ok": true, "payload": {...} } ✓ Igual
```

---

## Testing

Los tests de integración siguen funcionando sin cambios porque:
1. Los endpoints HTTP permanecen igual
2. La inyección de dependencias es transparente
3. El comportamiento es idéntico

Para tests unitarios de use cases:
```typescript
describe('CreatePostUseCase', () => {
    let useCase: CreatePostUseCase;
    let prisma: PrismaService;
    
    beforeEach(() => {
        prisma = {
            post: { create: jest.fn() }
        } as any;
        useCase = new CreatePostUseCase(prisma, moderationService);
    });
    
    it('should create a post', async () => {
        const result = await useCase.execute(dto);
        expect(result).toBeDefined();
    });
});
```

---

## Próximos Pasos Recomendados

1. **Implementar Repository Pattern**: Crear interfaces de repositorios para abstraer el acceso a datos
   ```typescript
   interface IPostsRepository {
       create(data: CreatePostDto): Promise<Post>;
       findAll(): Promise<Post[]>;
   }
   ```

2. **Agregar Value Objects**: Para conceptos como `PostScore`, `ReactionType`
   - Ya existen en `src/domain/value-objects/` pero no se usan

3. **Crear DomainModule**: Para centralizar entidades y value objects del dominio

4. **Implementar Query Objects**: Para consultas complejas del feed

5. **Error Handling**: Crear exception filters personalizados por capa

---

## Conclusión

Esta refactorización establece la base para una arquitectura escalable y mantenible siguiendo los principios de **Clean Architecture**:

✓ **Independencia de Frameworks**: La lógica de negocio no depende de NestJS
✓ **Testable**: Las use cases son fáciles de testear sin contexto HTTP
✓ **Mantenible**: Separación clara de responsabilidades
✓ **Escalable**: Fácil agregar nuevas funcionalidades y capas
