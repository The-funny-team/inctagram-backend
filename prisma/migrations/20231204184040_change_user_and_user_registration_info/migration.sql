-- AlterTable
ALTER TABLE "users" ALTER COLUMN "hash_password" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users_registration_info" ALTER COLUMN "confirmation_code" DROP NOT NULL,
ALTER COLUMN "expiration_confirmation_code" DROP NOT NULL;
