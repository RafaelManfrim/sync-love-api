-- CreateTable
CREATE TABLE "CalendarEventException" (
    "id" SERIAL NOT NULL,
    "calendar_event_id" INTEGER NOT NULL,
    "exception_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" INTEGER NOT NULL,

    CONSTRAINT "CalendarEventException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEventException_calendar_event_id_exception_date_key" ON "CalendarEventException"("calendar_event_id", "exception_date");

-- AddForeignKey
ALTER TABLE "CalendarEventException" ADD CONSTRAINT "CalendarEventException_calendar_event_id_fkey" FOREIGN KEY ("calendar_event_id") REFERENCES "CalendarEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEventException" ADD CONSTRAINT "CalendarEventException_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
