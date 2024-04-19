-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GOOGLE', 'GIT_HUB');

-- CreateTable
CREATE TABLE "user_providers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,

    CONSTRAINT "user_providers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_providers_user_id_key" ON "user_providers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_providers_user_id_provider_key" ON "user_providers"("user_id", "provider");

-- AddForeignKey
ALTER TABLE "user_providers" ADD CONSTRAINT "user_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
