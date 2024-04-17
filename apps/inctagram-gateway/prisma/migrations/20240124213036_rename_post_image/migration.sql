/*
  Warnings:

  - You are about to drop the `PostImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostImage" DROP CONSTRAINT "PostImage_postId_fkey";

-- DropTable
DROP TABLE "PostImage";

-- CreateTable
CREATE TABLE "post_image" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "image_id" TEXT,

    CONSTRAINT "post_image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "post_image" ADD CONSTRAINT "post_image_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
