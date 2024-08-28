/*
  Warnings:

  - You are about to drop the column `MomentoConsulta` on the `RastreioUpdateStatus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RastreioUpdateStatus" DROP COLUMN "MomentoConsulta",
ADD COLUMN     "DataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
