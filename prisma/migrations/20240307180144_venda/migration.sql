-- CreateTable
CREATE TABLE "Venda" (
    "id" TEXT NOT NULL,
    "codigo" INTEGER NOT NULL,
    "clienteCodigo" INTEGER NOT NULL,
    "clienteTipoPessoa" TEXT NOT NULL,
    "clienteDocumento" TEXT NOT NULL,
    "transportadoraCodigo" INTEGER NOT NULL,

    CONSTRAINT "Venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nfe" (
    "id" TEXT NOT NULL,
    "codigo" INTEGER NOT NULL,
    "codigoVenda" INTEGER NOT NULL,
    "codigoCliente" INTEGER NOT NULL,
    "dataEmissao" TEXT NOT NULL,
    "codigoVendaRel" INTEGER NOT NULL,

    CONSTRAINT "Nfe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Venda_codigo_key" ON "Venda"("codigo");

-- AddForeignKey
ALTER TABLE "Nfe" ADD CONSTRAINT "Nfe_codigoVendaRel_fkey" FOREIGN KEY ("codigoVendaRel") REFERENCES "Venda"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
