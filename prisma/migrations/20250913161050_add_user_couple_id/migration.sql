-- AlterTable
ALTER TABLE "User" ADD COLUMN     "couple_id" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "Couple"("id") ON DELETE SET NULL ON UPDATE CASCADE;
