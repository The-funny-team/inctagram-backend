-- CreateTable
CREATE TABLE "users_registration_info" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmation_code" TEXT NOT NULL,
    "expiration_confirmation_code" TIMESTAMP(3) NOT NULL,
    "recovery_code" TEXT,
    "expiration_recovery_code" TIMESTAMP(3),

    CONSTRAINT "users_registration_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_registration_info_user_id_key" ON "users_registration_info"("user_id");

-- AddForeignKey
ALTER TABLE "users_registration_info" ADD CONSTRAINT "users_registration_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
