-- CreateTable
CREATE TABLE "HouseholdTaskException" (
    "id" SERIAL NOT NULL,
    "household_task_id" INTEGER NOT NULL,
    "exception_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" INTEGER NOT NULL,

    CONSTRAINT "HouseholdTaskException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdTaskException_household_task_id_exception_date_key" ON "HouseholdTaskException"("household_task_id", "exception_date");

-- AddForeignKey
ALTER TABLE "HouseholdTaskException" ADD CONSTRAINT "HouseholdTaskException_household_task_id_fkey" FOREIGN KEY ("household_task_id") REFERENCES "HouseholdTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdTaskException" ADD CONSTRAINT "HouseholdTaskException_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
