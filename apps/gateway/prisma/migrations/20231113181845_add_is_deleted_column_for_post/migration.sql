/*
  Warnings:

  - Added the required column `isDeleted` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL;
