/*
  Warnings:

  - The primary key for the `Nfe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cancelada` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `codigo` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `codigoCliente` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `codigoVenda` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `codigoVendaRel` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `dataEmissao` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `horaEmissao` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `horaSaida` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `meioTransporte` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `motivoCancelamento` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `nfce` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `nfe` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `notaFiscalEletronica` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `notaFiscalNumero` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `numeroObjeto` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `transportadoraCodigo` on the `Nfe` table. All the data in the column will be lost.
  - You are about to drop the column `transportadoraNome` on the `Nfe` table. All the data in the column will be lost.
  - The primary key for the `Venda` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cancelada` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `clienteCodigo` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `clienteDocumento` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `clienteTipoPessoa` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `codigo` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `codigoNotaFiscal` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `codigoStatus` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `dataColeta` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `dataEntrega` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `dataEnvio` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `dataHoraStatus` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `dataVenda` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `descricaoStatus` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `entrega` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `entregaBairro` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `entregaCEP` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `entregaEmail` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `entregaLogradouro` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `entregaLogradouroComplemento` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `entregaLogradouroNumero` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `entregaMunicipioNome` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `entregaNome` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `entregaTelefone` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `entregaUnidadeFederativa` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `notaFiscalNumero` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `numeroObjeto` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `observacoes` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `observacoesLoja` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `previsaoEntrega` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `transportadoraCodigo` on the `Venda` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Codigo]` on the table `Venda` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Cancelada` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Codigo` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CodigoCliente` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CodigoVenda` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CodigoVendaRel` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `DataEmissao` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `HoraEmissao` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `HoraSaida` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - The required column `Id` was added to the `Nfe` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `MeioTransporte` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `MotivoCancelamento` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Nfce` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Nfe` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `NotaFiscalEletronica` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `NotaFiscalNumero` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `NumeroObjeto` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TransportadoraCodigo` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TransportadoraNome` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Cancelada` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ClienteCodigo` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ClienteDocumento` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Codigo` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CodigoNotaFiscal` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CodigoStatus` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `DataColeta` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `DataEntrega` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `DataEnvio` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `DescricaoStatus` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Entrega` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EntregaBairro` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EntregaCEP` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EntregaEmail` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EntregaLogradouro` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EntregaLogradouroComplemento` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EntregaLogradouroNumero` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EntregaMunicipioNome` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EntregaTelefone` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EntregaUnidadeFederativa` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - The required column `Id` was added to the `Venda` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `NotaFiscalNumero` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `NumeroObjeto` to the `Venda` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Nfe" DROP CONSTRAINT "Nfe_codigoVendaRel_fkey";

-- DropIndex
DROP INDEX "Venda_codigo_key";

-- AlterTable
ALTER TABLE "Nfe" DROP CONSTRAINT "Nfe_pkey",
DROP COLUMN "cancelada",
DROP COLUMN "codigo",
DROP COLUMN "codigoCliente",
DROP COLUMN "codigoVenda",
DROP COLUMN "codigoVendaRel",
DROP COLUMN "dataEmissao",
DROP COLUMN "horaEmissao",
DROP COLUMN "horaSaida",
DROP COLUMN "id",
DROP COLUMN "meioTransporte",
DROP COLUMN "motivoCancelamento",
DROP COLUMN "nfce",
DROP COLUMN "nfe",
DROP COLUMN "notaFiscalEletronica",
DROP COLUMN "notaFiscalNumero",
DROP COLUMN "numeroObjeto",
DROP COLUMN "transportadoraCodigo",
DROP COLUMN "transportadoraNome",
ADD COLUMN     "Cancelada" BOOLEAN NOT NULL,
ADD COLUMN     "Codigo" INTEGER NOT NULL,
ADD COLUMN     "CodigoCliente" INTEGER NOT NULL,
ADD COLUMN     "CodigoVenda" INTEGER NOT NULL,
ADD COLUMN     "CodigoVendaRel" INTEGER NOT NULL,
ADD COLUMN     "DataEmissao" TEXT NOT NULL,
ADD COLUMN     "HoraEmissao" TEXT NOT NULL,
ADD COLUMN     "HoraSaida" TEXT NOT NULL,
ADD COLUMN     "Id" TEXT NOT NULL,
ADD COLUMN     "MeioTransporte" TEXT NOT NULL,
ADD COLUMN     "MotivoCancelamento" TEXT NOT NULL,
ADD COLUMN     "Nfce" BOOLEAN NOT NULL,
ADD COLUMN     "Nfe" BOOLEAN NOT NULL,
ADD COLUMN     "NotaFiscalEletronica" TEXT NOT NULL,
ADD COLUMN     "NotaFiscalNumero" INTEGER NOT NULL,
ADD COLUMN     "NumeroObjeto" TEXT NOT NULL,
ADD COLUMN     "TransportadoraCodigo" INTEGER NOT NULL,
ADD COLUMN     "TransportadoraNome" TEXT NOT NULL,
ADD CONSTRAINT "Nfe_pkey" PRIMARY KEY ("Id");

-- AlterTable
ALTER TABLE "Venda" DROP CONSTRAINT "Venda_pkey",
DROP COLUMN "cancelada",
DROP COLUMN "clienteCodigo",
DROP COLUMN "clienteDocumento",
DROP COLUMN "clienteTipoPessoa",
DROP COLUMN "codigo",
DROP COLUMN "codigoNotaFiscal",
DROP COLUMN "codigoStatus",
DROP COLUMN "dataColeta",
DROP COLUMN "dataEntrega",
DROP COLUMN "dataEnvio",
DROP COLUMN "dataHoraStatus",
DROP COLUMN "dataVenda",
DROP COLUMN "descricaoStatus",
DROP COLUMN "entrega",
DROP COLUMN "entregaBairro",
DROP COLUMN "entregaCEP",
DROP COLUMN "entregaEmail",
DROP COLUMN "entregaLogradouro",
DROP COLUMN "entregaLogradouroComplemento",
DROP COLUMN "entregaLogradouroNumero",
DROP COLUMN "entregaMunicipioNome",
DROP COLUMN "entregaNome",
DROP COLUMN "entregaTelefone",
DROP COLUMN "entregaUnidadeFederativa",
DROP COLUMN "id",
DROP COLUMN "notaFiscalNumero",
DROP COLUMN "numeroObjeto",
DROP COLUMN "observacoes",
DROP COLUMN "observacoesLoja",
DROP COLUMN "previsaoEntrega",
DROP COLUMN "transportadoraCodigo",
ADD COLUMN     "Cancelada" BOOLEAN NOT NULL,
ADD COLUMN     "ClienteCodigo" INTEGER NOT NULL,
ADD COLUMN     "ClienteDocumento" TEXT NOT NULL,
ADD COLUMN     "ClienteTipoPessoa" TEXT,
ADD COLUMN     "Codigo" INTEGER NOT NULL,
ADD COLUMN     "CodigoNotaFiscal" INTEGER NOT NULL,
ADD COLUMN     "CodigoStatus" INTEGER NOT NULL,
ADD COLUMN     "DataColeta" TEXT NOT NULL,
ADD COLUMN     "DataEntrega" TEXT NOT NULL,
ADD COLUMN     "DataEnvio" TEXT NOT NULL,
ADD COLUMN     "DataHoraStatus" TEXT,
ADD COLUMN     "DataVenda" TEXT,
ADD COLUMN     "DescricaoStatus" TEXT NOT NULL,
ADD COLUMN     "Entrega" BOOLEAN NOT NULL,
ADD COLUMN     "EntregaBairro" TEXT NOT NULL,
ADD COLUMN     "EntregaCEP" TEXT NOT NULL,
ADD COLUMN     "EntregaEmail" TEXT NOT NULL,
ADD COLUMN     "EntregaLogradouro" TEXT NOT NULL,
ADD COLUMN     "EntregaLogradouroComplemento" TEXT NOT NULL,
ADD COLUMN     "EntregaLogradouroNumero" TEXT NOT NULL,
ADD COLUMN     "EntregaMunicipioNome" TEXT NOT NULL,
ADD COLUMN     "EntregaNome" TEXT,
ADD COLUMN     "EntregaTelefone" TEXT NOT NULL,
ADD COLUMN     "EntregaUnidadeFederativa" TEXT NOT NULL,
ADD COLUMN     "Id" TEXT NOT NULL,
ADD COLUMN     "NotaFiscalNumero" INTEGER NOT NULL,
ADD COLUMN     "NumeroObjeto" TEXT NOT NULL,
ADD COLUMN     "Observacoes" TEXT,
ADD COLUMN     "ObservacoesLoja" TEXT,
ADD COLUMN     "PrevisaoEntrega" TEXT,
ADD COLUMN     "TransportadoraCodigo" INTEGER,
ADD CONSTRAINT "Venda_pkey" PRIMARY KEY ("Id");

-- CreateIndex
CREATE UNIQUE INDEX "Venda_Codigo_key" ON "Venda"("Codigo");

-- AddForeignKey
ALTER TABLE "Nfe" ADD CONSTRAINT "Nfe_CodigoVendaRel_fkey" FOREIGN KEY ("CodigoVendaRel") REFERENCES "Venda"("Codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
