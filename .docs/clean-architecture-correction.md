# Arquitectura Clean en Capas - Corrección y Clarificación

## Problema Identificado

En la refactorización inicial, se introdujo una **violación de Clean Architecture**:

```typescript
// ❌ INCORRECTO
// src/application/use-cases/posts/create-post.use-case.ts
import { CreatePostDto } from "@/shared/dtos"

export class CreatePostUseCase {
    async execute(data: CreatePostDto) { ... }  // Application depende de presentación
}
```

**El problema:** La capa de **Application** no debe conocer de DTOs (artefactos HTTP/presentación).

---

## Solución Implementada

### ✅ Estructura Correcta de Capas

```
HTTP Request
    ↓
┌─────────────────────────────────────────────┐
│         HTTP Layer (Presentación)           │
│  src/http/controllers/posts.controller.ts   │
│  src/http/dtos/index.ts  ← DTOs aquí        │
│                                             │
│  1. Recibe CreatePostDto (validado)         │
│  2. Transforma → CreatePostInput            │
│  3. Llama use case                          │
└─────────────────────────────────────────────┘
    ↓ (pasa CreatePostInput)
┌─────────────────────────────────────────────┐
│       Application Layer (Lógica)            │
│  src/application/use-cases/posts/          │
│  src/application/types/index.ts            │
│                                             │
│  1. Recibe CreatePostInput (tipos simples)  │
│  2. Ejecuta lógica de negocio               │
│  3. Retorna objeto de dominio               │
│  NO CONOCE de DTOs, Controllers, HTTP      │
└─────────────────────────────────────────────┘
    ↓ (pasa Post entity)
┌─────────────────────────────────────────────┐
│   Infrastructure Layer (Persistencia)       │
│  src/shared/prisma.service.ts              │
│  Moderation, Categories, etc.               │
└─────────────────────────────────────────────┘
```

### 📁 Estructura de Directorios

```
src/
├── http/
│   ├── controllers/
│   │   ├── posts.controller.ts      ← Recibe DTOs, llama use cases
│   │   └── comments.controller.ts   ← Recibe DTOs, llama use cases
│   └── dtos/
│       └── index.ts                 ← Define DTOs (validación HTTP)
│
├── application/
│   ├── use-cases/
│   │   ├── posts/create-post.use-case.ts    ← Recibe CreatePostInput
│   │   ├── posts/get-all-posts.use-case.ts
│   │   ├── posts/get-feed-posts.use-case.ts
│   │   ├── comments/create-comment.use-case.ts ← Recibe CreateCommentInput
│   │   └── comments/list-comments.use-case.ts
│   └── types/
│       └── index.ts                 ← Define tipos de aplicación (sin decoradores)
│
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── value-objects/
│
├── infrastructure/
│   └── infrastructure.module.ts
│
├── shared/
│   ├── prisma.service.ts
│   └── dtos/
│       └── index.ts                 ← Re-exporta desde @/http/dtos
│
└── posts/
    └── posts.dtos.ts                ← Re-exporta desde @/shared/dtos (deprecated)
```

---

## Cambios Realizados

### 1. DTOs Movidos a HTTP Layer
```typescript
// src/http/dtos/index.ts
export class CreatePostDto {
    @IsString() @IsNotEmpty() @Length(3, 120)
    title!: string
    // ... validadores de presentación
}
```

### 2. Tipos de Aplicación Creados
```typescript
// src/application/types/index.ts
export interface CreatePostInput {
    title: string
    description: string
    imageUrl: string
    categoryId?: string
}
```

### 3. Use Cases Actualizados
```typescript
// src/application/use-cases/posts/create-post.use-case.ts
export class CreatePostUseCase {
    async execute(data: CreatePostInput) {  // ✅ Recibe tipo simple
        // Lógica de negocio pura
    }
}
```

### 4. Controllers Transforman DTOs → Tipos
```typescript
// src/http/controllers/posts.controller.ts
@Post()
async create(@Body() body: CreatePostDto) {  // ✅ Recibe DTO
    // Transforma DTO → CreatePostInput
    const created = await this.createPostUseCase.execute({
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        categoryId: body.categoryId,
    })
    return { ok: true, payload: created }
}
```

---

## Beneficios de Esta Arquitectura

| Aspecto | Beneficio |
|--------|----------|
| **Independencia** | Application layer no depende de frameworks (NestJS, HTTP, etc.) |
| **Testabilidad** | Use cases se testean sin HTTP, sin NestJS decorators |
| **Reutilización** | Los use cases funcionan en cualquier contexto (CLI, GraphQL, WebSocket) |
| **Mantenibilidad** | Cambios en validación HTTP no afectan lógica de negocio |
| **Escalabilidad** | Fácil agregar nuevas entradas (CLI, eventos, etc.) |

---

## Flujo de Datos (Ejemplo: Crear Post)

### 1. HTTP Request
```
POST /api/posts
{
    "title": "Mi Post",
    "description": "Descripción larga...",
    "imageUrl": "https://example.com/img.jpg",
    "categoryId": "cat-123"
}
```

### 2. Controller (HTTP Layer)
```typescript
@Post()
async create(@Body() body: CreatePostDto) {
    // DTO validado por class-validator automáticamente
    
    // Transformar a tipo de aplicación
    const input: CreatePostInput = {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        categoryId: body.categoryId,
    }
    
    // Llamar use case
    const post = await this.createPostUseCase.execute(input)
    
    return { ok: true, payload: post }
}
```

### 3. Use Case (Application Layer)
```typescript
async execute(data: CreatePostInput) {
    // Lógica de negocio: moderación
    const text = `${data.title} ${data.description}`
    const moderation = await this.moderationService.moderate(text)
    
    if (!moderation.approved) {
        throw new BadRequestException(moderation.reason)
    }
    
    // Persistencia: crear en base de datos
    return await this.prisma.post.create({ data })
}
```

### 4. Response
```json
{
    "ok": true,
    "payload": {
        "id": "post-123",
        "title": "Mi Post",
        "description": "...",
        "imageUrl": "...",
        "categoryId": "cat-123",
        "createdAt": "2026-06-05T..."
    }
}
```

---

## Testing Ejemplo

### Test de Use Case (Sin HTTP)
```typescript
describe('CreatePostUseCase', () => {
    let useCase: CreatePostUseCase
    let prisma: PrismaService
    let moderation: ModerationService
    
    beforeEach(() => {
        // No necesita NestJS, decorators, o contexto HTTP
        prisma = { post: { create: jest.fn() } }
        moderation = { moderate: jest.fn() }
        useCase = new CreatePostUseCase(prisma, moderation)
    })
    
    it('should create post when moderation approves', async () => {
        jest.spyOn(moderation, 'moderate')
            .mockResolvedValue({ approved: true })
        
        const result = await useCase.execute({
            title: 'Test',
            description: 'Test description here',
            imageUrl: 'https://example.com/img.jpg',
        })
        
        expect(result).toBeDefined()
        expect(prisma.post.create).toHaveBeenCalled()
    })
})
```

### Test de Controller (HTTP)
```typescript
describe('PostsController', () => {
    let controller: PostsController
    let createPostUseCase: CreatePostUseCase
    
    beforeEach(async () => {
        createPostUseCase = {
            execute: jest.fn().mockResolvedValue({
                id: 'post-123',
                title: 'Test',
            }),
        } as any
        
        controller = new PostsController(
            createPostUseCase,
            getAllPostsUseCase,
            getFeedPostsUseCase,
            feedRankingFactory,
        )
    })
    
    it('should call createPostUseCase with transformed DTO', async () => {
        const dto = new CreatePostDto()
        dto.title = 'Test'
        dto.description = 'Test description'
        dto.imageUrl = 'https://example.com/img.jpg'
        
        await controller.create(dto)
        
        expect(createPostUseCase.execute).toHaveBeenCalledWith({
            title: 'Test',
            description: 'Test description',
            imageUrl: 'https://example.com/img.jpg',
            categoryId: undefined,
        })
    })
})
```

---

## Compatibilidad

Para mantener compatibilidad con código existente:

```typescript
// AMBAS funciones (importar DTOs sigue funcionando)
import { CreatePostDto } from "@/posts/posts.dtos"              // Deprecated pero funciona
import { CreatePostDto } from "@/shared/dtos"                 // Funciona
import { CreatePostDto } from "@/http/dtos"                   // Recomendado
```

Todas las cadenas de re-exportación aseguran compatibilidad hacia atrás.

---

## Conclusión

La arquitectura ahora es **verdadera Clean Architecture**:

✅ **Capas bien definidas** con responsabilidades claras  
✅ **Application layer independiente** de frameworks  
✅ **DTOs en la capa correcta** (HTTP, no Application)  
✅ **Tipos de aplicación puros** sin decoradores  
✅ **Transformación clara** en el boundary (controller)  
✅ **Fácil de testear** cada capa de forma aislada  
✅ **Compatible hacia atrás** con código existente
