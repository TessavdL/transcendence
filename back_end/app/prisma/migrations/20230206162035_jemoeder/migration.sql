-- CreateTable
CREATE TABLE "UserMessage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "UserMessage_pkey" PRIMARY KEY ("id")
);
