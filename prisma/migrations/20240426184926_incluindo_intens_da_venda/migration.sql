-- CreateTable
CREATE TABLE "ItensVenda" (
    "Id" TEXT NOT NULL,
    "Codigo" INTEGER NOT NULL,
    "ProdutoReferencia" TEXT,
    "ProdutoBarras" TEXT,
    "ProdutoBundleCodigo" INTEGER,
    "VendaCodigo" INTEGER,
    "ProdutoCodigo" INTEGER,
    "PrecoUnitarioVenda" TEXT,
    "PrecoUnitarioCusto" TEXT,
    "EmbaladoParaPresente" BOOLEAN,
    "ValorEmbalagemPresente" TEXT,
    "Quantidade" TEXT,
    "AtributosEspeciais" TEXT,
    "ItemNome" TEXT,
    "ItemDescontoPercentual" TEXT,
    "ItemDescontoValor" TEXT,
    "ItemValorBruto" TEXT,
    "ItemValorLiquido" TEXT,
    "Servico" BOOLEAN,
    "CodigoVendaRel" INTEGER NOT NULL,

    CONSTRAINT "ItensVenda_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "ItensVenda" ADD CONSTRAINT "ItensVenda_CodigoVendaRel_fkey" FOREIGN KEY ("CodigoVendaRel") REFERENCES "Venda"("Codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
