export interface Venda{
    id : number;
    codigo : number;
    clienteCodigo : number;
    clienteTipoPessoa : string;
    clienteDocumento : string;
    transportadoraCodigo : number;
    dataVenda : Date;
    entrega : boolean;
    entregaNome : string;
    entregaEmail : string;
    numeroObjeto : string;
    entregaTelefone : string;
    entregaLogradouro : string;
    entregaLogradouroNumero : string;
    entregaLogradouroComplemento : string;
    entregaBairro : string;
    entregaMunicipioNome : string;
    entregaUnidadeFederativa : string;
    entregaCEP : string;
    observacoes : string;
    observacoesLoja : string;
    codigoStatus : number;
    descricaoStatus : string;
    dataHoraStatus : Date;
    previsaoEntrega : Date;
    codigoNotaFiscal : number;
    dataEntrega : Date;
    cancelada : boolean;
    dataEnvio : Date;
    notaFiscalNumero : number;
    dataColeta : Date;
}

export interface Vendas{
    vendas : Venda[];
}

export interface VendaGet{
    clienteDocumento: string;
    entrega: boolean;
}
export interface VendaCreate{
    codigo : number;
    clienteCodigo : number;
    clienteTipoPessoa : string;
    clienteDocumento : string;
    transportadoraCodigo : number;
    dataVenda : Date;
    entrega : boolean;
    entregaNome : string;
    entregaEmail : string;
    numeroObjeto : string;
    entregaTelefone : string;
    entregaLogradouro : string;
    entregaLogradouroNumero : string;
    entregaLogradouroComplemento : string;
    entregaBairro : string;
    entregaMunicipioNome : string;
    entregaUnidadeFederativa : string;
    entregaCEP : string;
    observacoes : string;
    observacoesLoja : string;
    codigoStatus : number;
    descricaoStatus : string;
    dataHoraStatus : Date;
    previsaoEntrega : Date;
    codigoNotaFiscal : number;
    dataEntrega : Date;
    cancelada : boolean;
    dataEnvio : Date;
    notaFiscalNumero : number;
    dataColeta : Date;
}

export interface VendaRepository{
    get(data: VendaGet): Promise<Vendas>
    create(data: VendaCreate): Promise<Venda>;
}