export interface Venda {
    Id : number;
    Codigo : number;
    ClienteCodigo : number;
    ClienteTipoPessoa : string;
    ClienteDocumento : string;
    TransportadoraCodigo : number;
    DataVenda : Date;
    Entrega : boolean;
    EntregaNome : string;
    EntregaEmail : string;
    NumeroObjeto : string;
    EntregaTelefone : string;
    EntregaLogradouro : string;
    EntregaLogradouroNumero : string;
    EntregaLogradouroComplemento : string;
    EntregaBairro : string;
    EntregaMunicipioNome : string;
    EntregaUnidadeFederativa : string;
    EntregaCEP : string;
    Observacoes : string;
    ObservacoesLoja : string;
    CodigoStatus : number;
    DescricaoStatus : string;
    DataHoraStatus : Date;
    PrevisaoEntrega : Date;
    CodigoNotaFiscal : number;
    DataEntrega : Date;
    Cancelada : boolean;
    DataEnvio : Date;
    NotaFiscalNumero : number;
    DataColeta : Date;
}

export interface Vendas{
    vendas : Venda[];
}

export interface VendaGet{
    clienteDocumento: string;
    entrega: boolean;
}
export interface VendaCreate {
    Codigo : number;
    ClienteCodigo : number;
    ClienteTipoPessoa : string;
    ClienteDocumento : string;
    TransportadoraCodigo : number;
    DataVenda : Date;
    Entrega : boolean;
    EntregaNome : string;
    EntregaEmail : string;
    NumeroObjeto : string;
    EntregaTelefone : string;
    EntregaLogradouro : string;
    EntregaLogradouroNumero : string;
    EntregaLogradouroComplemento : string;
    EntregaBairro : string;
    EntregaMunicipioNome : string;
    EntregaUnidadeFederativa : string;
    EntregaCEP : string;
    Observacoes : string;
    ObservacoesLoja : string;
    CodigoStatus : number;
    DescricaoStatus : string;
    DataHoraStatus : Date;
    PrevisaoEntrega : Date;
    CodigoNotaFiscal : number;
    DataEntrega : Date;
    Cancelada : boolean;
    DataEnvio : Date;
    NotaFiscalNumero : number;
    DataColeta : Date;
}

export interface VendaRepository{
    get(data: VendaGet): Promise<Vendas>
    create(data: VendaCreate): Promise<Venda>;
}