/*
  Warnings:

  - You are about to drop the column `confirmationInfo` on the `payment_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `providerInfo` on the `payment_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `payment_transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "payment_transactions" DROP CONSTRAINT "payment_transactions_subscriptionId_fkey";

-- AlterTable
ALTER TABLE "payment_transactions" DROP COLUMN "confirmationInfo",
DROP COLUMN "providerInfo",
DROP COLUMN "subscriptionId",
ADD COLUMN     "confirmation_info" JSONB,
ADD COLUMN     "provider_info" JSONB,
ADD COLUMN     "subscription_id" TEXT;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subsriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
