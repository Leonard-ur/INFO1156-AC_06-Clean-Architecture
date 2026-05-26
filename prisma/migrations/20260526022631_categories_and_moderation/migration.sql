-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ProhibitedWord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "word" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "categoryId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("createdAt", "description", "id", "imageUrl", "title", "updatedAt") SELECT "createdAt", "description", "id", "imageUrl", "title", "updatedAt" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- Seed categories
INSERT INTO "Category" ("name", "slug") VALUES ('Tecnología', 'technology');
INSERT INTO "Category" ("name", "slug") VALUES ('Arte', 'art');
INSERT INTO "Category" ("name", "slug") VALUES ('Ciencia', 'science');
INSERT INTO "Category" ("name", "slug") VALUES ('Deportes', 'sports');
INSERT INTO "Category" ("name", "slug") VALUES ('Música', 'music');
INSERT INTO "Category" ("name", "slug") VALUES ('Comida', 'food');
INSERT INTO "Category" ("name", "slug") VALUES ('Viajes', 'travel');
INSERT INTO "Category" ("name", "slug") VALUES ('Otro', 'other');
