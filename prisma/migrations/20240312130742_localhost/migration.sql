/*
  Warnings:

  - Added the required column `cancelada` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horaEmissao` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horaSaida` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meioTransporte` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motivoCancelamento` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nfce` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nfe` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notaFiscalEletronica` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notaFiscalNumero` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroObjeto` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transportadoraCodigo` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transportadoraNome` to the `Nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cancelada` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codigoNotaFiscal` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codigoStatus` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataColeta` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataEntrega` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataEnvio` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataHoraStatus` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataVenda` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descricaoStatus` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entrega` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entregaBairro` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entregaCEP` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entregaEmail` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entregaLogradouro` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entregaLogradouroComplemento` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entregaLogradouroNumero` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entregaMunicipioNome` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entregaNome` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entregaTelefone` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entregaUnidadeFederativa` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notaFiscalNumero` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroObjeto` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `observacoes` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `observacoesLoja` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previsaoEntrega` to the `Venda` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Nfe" ADD COLUMN     "cancelada" BOOLEAN NOT NULL,
ADD COLUMN     "horaEmissao" TEXT NOT NULL,
ADD COLUMN     "horaSaida" TEXT NOT NULL,
ADD COLUMN     "meioTransporte" TEXT NOT NULL,
ADD COLUMN     "motivoCancelamento" TEXT NOT NULL,
ADD COLUMN     "nfce" BOOLEAN NOT NULL,
ADD COLUMN     "nfe" BOOLEAN NOT NULL,
ADD COLUMN     "notaFiscalEletronica" TEXT NOT NULL,
ADD COLUMN     "notaFiscalNumero" INTEGER NOT NULL,
ADD COLUMN     "numeroObjeto" TEXT NOT NULL,
ADD COLUMN     "transportadoraCodigo" INTEGER NOT NULL,
ADD COLUMN     "transportadoraNome" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Venda" ADD COLUMN     "cancelada" BOOLEAN NOT NULL,
ADD COLUMN     "codigoNotaFiscal" TEXT NOT NULL,
ADD COLUMN     "codigoStatus" INTEGER NOT NULL,
ADD COLUMN     "dataColeta" TEXT NOT NULL,
ADD COLUMN     "dataEntrega" TEXT NOT NULL,
ADD COLUMN     "dataEnvio" TEXT NOT NULL,
ADD COLUMN     "dataHoraStatus" TEXT NOT NULL,
ADD COLUMN     "dataVenda" TEXT NOT NULL,
ADD COLUMN     "descricaoStatus" TEXT NOT NULL,
ADD COLUMN     "entrega" BOOLEAN NOT NULL,
ADD COLUMN     "entregaBairro" TEXT NOT NULL,
ADD COLUMN     "entregaCEP" TEXT NOT NULL,
ADD COLUMN     "entregaEmail" TEXT NOT NULL,
ADD COLUMN     "entregaLogradouro" TEXT NOT NULL,
ADD COLUMN     "entregaLogradouroComplemento" TEXT NOT NULL,
ADD COLUMN     "entregaLogradouroNumero" TEXT NOT NULL,
ADD COLUMN     "entregaMunicipioNome" TEXT NOT NULL,
ADD COLUMN     "entregaNome" TEXT NOT NULL,
ADD COLUMN     "entregaTelefone" TEXT NOT NULL,
ADD COLUMN     "entregaUnidadeFederativa" TEXT NOT NULL,
ADD COLUMN     "notaFiscalNumero" INTEGER NOT NULL,
ADD COLUMN     "numeroObjeto" TEXT NOT NULL,
ADD COLUMN     "observacoes" TEXT NOT NULL,
ADD COLUMN     "observacoesLoja" TEXT NOT NULL,
ADD COLUMN     "previsaoEntrega" TEXT NOT NULL;
