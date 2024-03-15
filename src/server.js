"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fastify_1 = __importDefault(require("fastify"));
const nota_fiscal_routes_1 = require("./routes/nota-fiscal.routes");
const app = (0, fastify_1.default)();
const prisma = new client_1.PrismaClient();
app.register(nota_fiscal_routes_1.notaFiscalRoutes, {
    prefix: "/nfe",
});
const authToken = "effca82a-7127-45de-9a53-b71fc01a9064";
// Endpoint: Admin - inicio
// Endpoint: authUsers - inicio
app.post("/login", async (request, reply) => {
    const authTokenHeader = request.headers.token;
    const stringbody = JSON.stringify(request.body);
    const data = JSON.parse(stringbody);
    const email = data.email;
    const pw = data.pw;
    const existingRecord = await prisma.adminUsers.findFirst({
        where: {
            email: email,
            password: pw,
        },
    });
    if (existingRecord && authTokenHeader == authToken) {
        return reply.status(200).send(existingRecord?.token);
    }
    else {
        return reply.status(401).send("Dados de login incorretos.");
    }
});
// Endpoint: authUsers - fim
// Endpoint: newUser - inicio
app.post("/newUser", async (request, reply) => {
    const authTokenHeader = request.headers.token;
    const stringbody = JSON.stringify(request.body);
    const data = JSON.parse(stringbody);
    const email = data.email;
    const pw = data.pw;
    // Verifica se já existe um registro com o mesmo email
    const existingRecord = await prisma.adminUsers.findFirst({
        where: {
            email: email,
        },
    });
    // Se não existir, insere o novo registro
    if (!existingRecord && authTokenHeader == authToken) {
        try {
            const createdUser = await prisma.adminUsers.create({
                data: {
                    email: email,
                    password: pw,
                },
            });
            return reply.status(200).send(createdUser.token);
        }
        catch (error) {
            console.error(error);
            return reply.status(500).send("Internal Server Error");
        }
    }
    else {
        return reply.status(401).send("Usuario ja existente");
    }
});
// Endpoint: newUser - fim
// Endpoint: Consome fila integração Vendas - início
app.get("/consomeFilaIntegracaoVendas", async (request, reply) => {
    const maxRegistros = request.headers.maxRegistros;
    // busca fila de integração Vendas - inicio
    async function pegaListaIntegracaoVendas() {
        try {
            const request = require("superagent");
            const resListaIntegracao = await request
                .get("http://cloud01.alternativa.net.br:2086/root/venda")
                .set("Accept", "application/json")
                .set("accept-encoding", "gzip")
                .set("X-Token", "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs");
            resListaIntegracao.body;
            if (resListaIntegracao.status == 200) {
                return JSON.stringify(resListaIntegracao.body);
            }
            else {
                throw new Error("Erro ao obter o lista integração.");
            }
        }
        catch (err) {
            console.error(err);
        }
    }
    // busca fila de integração Vendas - fim
    // consome cada item da fila de integração Vendas - inicio
    async function mainConsomeLista() {
        const resListaIntegracao = await pegaListaIntegracaoVendas();
        if (resListaIntegracao) {
            const resListaIntegracaoJson = await JSON.parse(resListaIntegracao);
            resListaIntegracaoJson.venda.forEach(async (venda) => {
                try {
                    const { Codigo, ClienteCodigo, ClienteTipoPessoa, ClienteDocumento, TransportadoraCodigo, DataVenda, Entrega, EntregaNome, EntregaEmail, NumeroObjeto, EntregaTelefone, EntregaLogradouro, EntregaLogradouroNumero, EntregaLogradouroComplemento, EntregaBairro, EntregaMunicipioNome, EntregaUnidadeFederativa, EntregaCEP, Observacoes, ObservacoesLoja, CodigoStatus, DescricaoStatus, DataHoraStatus, PrevisaoEntrega, CodigoNotaFiscal, DataEntrega, Cancelada, DataEnvio, NotaFiscalNumero, DataColeta, } = venda;
                    const existingRecord = await prisma.venda.findFirst({
                        where: {
                            Codigo: Codigo,
                        },
                    });
                    // Se não existir, insere o novo registro
                    if (!existingRecord) {
                        console.log("Inserindo Venda: " + Codigo);
                        await prisma.venda.create({
                            data: {
                                Codigo,
                                ClienteCodigo,
                                ClienteTipoPessoa,
                                ClienteDocumento,
                                TransportadoraCodigo,
                                DataVenda,
                                Entrega,
                                EntregaNome,
                                EntregaEmail,
                                NumeroObjeto,
                                EntregaTelefone,
                                EntregaLogradouro,
                                EntregaLogradouroNumero,
                                EntregaLogradouroComplemento,
                                EntregaBairro,
                                EntregaMunicipioNome,
                                EntregaUnidadeFederativa,
                                EntregaCEP,
                                Observacoes,
                                ObservacoesLoja,
                                CodigoStatus,
                                DescricaoStatus,
                                DataHoraStatus,
                                PrevisaoEntrega,
                                CodigoNotaFiscal,
                                DataEntrega,
                                Cancelada,
                                DataEnvio,
                                NotaFiscalNumero,
                                DataColeta,
                            },
                        });
                        // insere o payload completo em VendaFilaIntegração como backup
                        // Se não existir, insere o novo registro
                        await prisma.vendafilaintegracao.create({
                            data: {
                                Codigo,
                                ClienteDocumento,
                                Payload: venda,
                            },
                        });
                    }
                    else {
                        console.log("Venda ja existente: " + Codigo);
                    }
                }
                catch (error) {
                    console.error(error);
                }
            });
        }
        else {
            console.error("Erro ao obter o lista integração.");
            return;
        }
    }
    // consome cada item da fila de integração Vendas - fim
    mainConsomeLista();
    const numeroDeVendas = await prisma.venda.count();
    return { numeroDeVendas };
});
// Endpoint: Consome fila integração Vendas - fim
// Endpoint: Admin - fim
app
    .listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3334,
})
    .then(() => {
    console.log("HTTP Server Running");
});
