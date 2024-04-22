/*
  Warnings:

  - You are about to drop the column `Cancelada` on the `RastreioChatMetricas` table. All the data in the column will be lost.
  - You are about to drop the column `Etapa` on the `RastreioChatMetricas` table. All the data in the column will be lost.
  - You are about to drop the column `Titulo` on the `RastreioChatMetricas` table. All the data in the column will be lost.
  - You are about to drop the column `momentoConsulta` on the `RastreioChatMetricas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RastreioChatMetricas" DROP COLUMN "Cancelada",
DROP COLUMN "Etapa",
DROP COLUMN "Titulo",
DROP COLUMN "momentoConsulta",
ADD COLUMN     "MomentoConsulta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
