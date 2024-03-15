import { FastifyInstance } from 'fastify';
import { PrismaClient, Venda } from "@prisma/client";
import { FastifyRequest, FastifyReply } from 'fastify';
import fastify from "fastify";
import { JsonArray, JsonConvertible, JsonObject, JsonValue } from '@prisma/client/runtime/library';
import { notaFiscalRoutes } from './routes/nota-fiscal.routes'

const app = fastify();

const prisma = new PrismaClient();

app.register(notaFiscalRoutes, {
    prefix: '/nfe'
});


const authToken = "effca82a-7127-45de-9a53-b71fc01a9064";

// Endpoint: Admin - inicio

// Endpoint: authUsers - inicio
app.post('/login', async (request, reply) => {

    const authTokenHeader = request.headers.token;

    interface RouteParams {
        email: string;
        pw: string;
    }

    const stringbody = JSON.stringify(request.body);
    const data = JSON.parse(stringbody);
    const email = data.email;
    const pw = data.pw;

    const existingRecord = await prisma.adminUsers.findFirst({
        where: {
            email: email,
            password: pw
        }
    });

    if (existingRecord && authTokenHeader == authToken) {
        return reply.status(200).send(existingRecord?.token);
    } else {
        return reply.status(401).send("Dados de login incorretos.");
    }
});

// Endpoint: authUsers - fim

// Endpoint: newUser - inicio
app.post('/newUser', async (request, reply) => {

    interface adminUser {
        email: string;
        senha: string;
    }

    const authTokenHeader = request.headers.token;

    const stringbody = JSON.stringify(request.body);
    const data = JSON.parse(stringbody);
    const email = data.email;
    const pw = data.pw;

    // Verifica se já existe um registro com o mesmo email
    const existingRecord = await prisma.adminUsers.findFirst({
        where: {
            email: email
        }
    });

    // Se não existir, insere o novo registro
    if (!existingRecord && authTokenHeader == authToken) {

        try {
            const createdUser = await prisma.adminUsers.create({
                data: {
                    email: email,
                    password: pw
                }
            });
            return reply.status(200).send(createdUser.token);
        } catch (error) {
            console.error(error);
            return reply.status(500).send('Internal Server Error');
        }
    } else {
        return reply.status(401).send('Usuario ja existente');
    }
});

// Endpoint: newUser - fim

// Endpoint: Consome fila integração Vendas - início

app.get("/consomeFilaIntegracaoVendas", async (request, reply) => {


    const maxRegistros = request.headers.maxRegistros;

    // função busca fila de integração Vendas - inicio

    async function pegaListaIntegracaoVendas() {

        try {
            const postRequest = {
                url: 'http://cloud01.alternativa.net.br:2086/root/venda',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Token': '7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs',
                }
            };

            const resListaIntegracao = await fetch(postRequest.url, {
                method: postRequest.method,
                headers: postRequest.headers
            });

            if (resListaIntegracao.status == 200) {
                return resListaIntegracao.json();
            } else {
                throw new Error("Erro ao obter o lista integração.");
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function mainConsomeLista() {

        const resListaIntegracao = await pegaListaIntegracaoVendas();

        if (resListaIntegracao) {

            const resListaIntegracaoJson = await resListaIntegracao.json();

            resListaIntegracaoJson.forEach(async (venda: any) => {

                try {

                    interface Venda {
                        id: string;
                        codigo: number;
                        clienteCodigo: number;
                        clienteTipoPessoa: string;
                        clienteDocumento: string;
                        transportadoraCodigo: number;
                        dataVenda: string; // Alterado para string para manter o formato original do modelo de dados
                        entrega: boolean;
                        entregaNome: string;
                        entregaEmail: string;
                        numeroObjeto: string;
                        entregaTelefone: string;
                        entregaLogradouro: string;
                        entregaLogradouroNumero: string;
                        entregaLogradouroComplemento: string;
                        entregaBairro: string;
                        entregaMunicipioNome: string;
                        entregaUnidadeFederativa: string;
                        entregaCEP: string;
                        observacoes: string;
                        observacoesLoja: string;
                        codigoStatus: number;
                        descricaoStatus: string;
                        dataHoraStatus: string;
                        previsaoEntrega: string;
                        codigoNotaFiscal: string;
                        dataEntrega: string;
                        cancelada: boolean;
                        dataEnvio: string;
                        notaFiscalNumero: number;
                        dataColeta: string;
                    }

                    const { id, codigo, clienteCodigo, clienteTipoPessoa, clienteDocumento, transportadoraCodigo, dataVenda, entrega, entregaNome, entregaEmail, numeroObjeto, entregaTelefone, entregaLogradouro, entregaLogradouroNumero, entregaLogradouroComplemento, entregaBairro, entregaMunicipioNome, entregaUnidadeFederativa, entregaCEP, observacoes, observacoesLoja, codigoStatus, descricaoStatus, dataHoraStatus, previsaoEntrega, codigoNotaFiscal, dataEntrega, cancelada, dataEnvio, notaFiscalNumero, dataColeta
                    } = venda as Venda;

                    const existingRecord = await prisma.venda.findFirst({
                        where: {
                            codigo: codigo
                        }
                    });

                    // Se não existir, insere o novo registro
                    if (!existingRecord) {

                        console.log("Inserindo Venda: " + codigo);

                        await prisma.venda.create({
                            data: {
                                id, codigo, clienteCodigo, clienteTipoPessoa, clienteDocumento, transportadoraCodigo, dataVenda, entrega, entregaNome, entregaEmail, numeroObjeto, entregaTelefone, entregaLogradouro, entregaLogradouroNumero, entregaLogradouroComplemento, entregaBairro, entregaMunicipioNome, entregaUnidadeFederativa, entregaCEP, observacoes, observacoesLoja, codigoStatus, descricaoStatus, dataHoraStatus, previsaoEntrega, codigoNotaFiscal, dataEntrega, cancelada, dataEnvio, notaFiscalNumero, dataColeta
                            }
                        });
                    } else {
                        console.log("Venda ja existente: " + codigo);
                    }

                } catch (error) {

                    console.error(error);
                }
            });

        } else {
            console.error("Erro ao obter o lista integração.");
            return;
        }
    }

    mainConsomeLista();

    const numeroDeVendas = await prisma.venda.count();
    return { numeroDeVendas };
}
);

// Endpoint: Consome fila integração Vendas - fim


// Endpoint: Admin - fim

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then(() => {
    console.log('HTTP Server Running');
});