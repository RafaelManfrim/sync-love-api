-- CreateTable
CREATE TABLE "HouseholdTask" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "couple_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "recurrence_rule" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseholdTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdTaskCompletion" (
    "id" SERIAL NOT NULL,
    "household_task_id" INTEGER NOT NULL,
    "completed_by_user_id" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "task_due_date" DATE NOT NULL,

    CONSTRAINT "HouseholdTaskCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdTaskCompletion_household_task_id_task_due_date_key" ON "HouseholdTaskCompletion"("household_task_id", "task_due_date");

-- AddForeignKey
ALTER TABLE "HouseholdTask" ADD CONSTRAINT "HouseholdTask_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdTask" ADD CONSTRAINT "HouseholdTask_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "Couple"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdTaskCompletion" ADD CONSTRAINT "HouseholdTaskCompletion_household_task_id_fkey" FOREIGN KEY ("household_task_id") REFERENCES "HouseholdTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdTaskCompletion" ADD CONSTRAINT "HouseholdTaskCompletion_completed_by_user_id_fkey" FOREIGN KEY ("completed_by_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
