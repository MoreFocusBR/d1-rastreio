import { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import { PrismaClient, Venda } from "@prisma/client";
import { FastifyRequest, FastifyReply } from "fastify";
import fastify from "fastify";
import { v4 as uuid } from "uuid";
import {
  JsonArray,
  JsonConvertible,
  JsonObject,
  JsonValue,
} from "@prisma/client/runtime/library";
import { notaFiscalRoutes } from "./routes/nota-fiscal.routes";
import { error } from "console";

const app = fastify();

const path = require("node:path");

app.register(require("@fastify/static"), {
  root: path.join(__dirname, ""),
  prefix: "/", // optional: default '/'
  constraints: {}, // optional: default {}
});

const prisma = new PrismaClient();

app.register(notaFiscalRoutes, {
  prefix: "/nfe",
});

const authToken = "effca82a-7127-45de-9a53-b71fc01a9064";

const API_URL = "https://d1-rastreio.onrender.com"; // https://d1-rastreio.onrender.com   http://localhost:3334

// Endpoint: Admin - inicio

// Endpoint: ping - inicio
app.get("/ping", async (request, reply) => {
  return reply.status(200).send("API ativa.");
});

// Endpoint: ping - fim

// Endpoint: authUsers - inicio
app.post("/login", async (request, reply) => {
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
      password: pw,
    },
  });

  if (existingRecord && authTokenHeader == authToken) {
    return reply.status(200).send(existingRecord?.token);
  } else {
    return reply.status(401).send("Dados de login incorretos.");
  }
});

// Endpoint: authUsers - fim

// Endpoint: newUser - inicio
app.post("/newUser", async (request, reply) => {
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
    } catch (error) {
      console.error(error);
      return reply.status(500).send("Internal Server Error");
    }
  } else {
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
      //.set("Limit", "1");

      resListaIntegracao.body;

      if (resListaIntegracao.status == 200) {
        return JSON.stringify(resListaIntegracao.body);
      } else {
        throw new Error("Erro ao obter o lista integração.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // busca fila de integração Vendas - fim

  // consome cada item da fila de integração Vendas - inicio

  async function mainConsomeLista() {
    const resListaIntegracao = await pegaListaIntegracaoVendas();

    if (resListaIntegracao) {
      const resListaIntegracaoJson = await JSON.parse(resListaIntegracao);

      if (resListaIntegracaoJson.venda.length > 0) {
        resListaIntegracaoJson.venda.forEach(async (venda: any) => {
          try {
            interface Venda {
              Codigo: number;
              ClienteCodigo: number;
              ClienteTipoPessoa: string;
              ClienteDocumento: string;
              TransportadoraCodigo: number;
              DataVenda: string;
              Entrega: boolean;
              EntregaNome: string;
              EntregaEmail: string;
              NumeroObjeto: string;
              EntregaTelefone: string;
              EntregaLogradouro: string;
              EntregaLogradouroNumero: string;
              EntregaLogradouroComplemento: string;
              EntregaBairro: string;
              EntregaMunicipioNome: string;
              EntregaUnidadeFederativa: string;
              EntregaCEP: string;
              Observacoes: string;
              ObservacoesLoja: string;
              CodigoStatus: number;
              DescricaoStatus: string;
              DataHoraStatus: string;
              PrevisaoEntrega: string;
              CodigoNotaFiscal: number;
              DataEntrega: string;
              Cancelada: boolean;
              DataEnvio: string;
              NotaFiscalNumero: number;
              DataColeta: string;
            }

            const {
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
            } = venda as Venda;

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

              let resCreate = await prisma.vendaFilaIntegracao.create({
                data: {
                  Codigo,
                  ClienteDocumento,
                  Payload: JSON.stringify(venda),
                },
              });

              if ((await resCreate.Id) != null) {
                // retira da fila de integração do ERP
                const request = require("superagent");
                const resListaIntegracao = await request
                  .post(
                    "http://cloud01.alternativa.net.br:2086/root/venda/" +
                      resCreate.Codigo +
                      "/ok"
                  )
                  .set("Accept", "application/json")
                  .set("accept-encoding", "gzip")
                  .set(
                    "X-Token",
                    "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs"
                  );

                resListaIntegracao.body;
              }
            } else {
              // Realiza o UPDATE da venda já cadastrada
              console.log("Realizando Update da Venda: " + Codigo);

              await prisma.venda.update({
                where: { Codigo: Codigo },
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

              let resCreate = await prisma.vendaFilaIntegracao.create({
                data: {
                  Codigo,
                  ClienteDocumento,
                  Payload: JSON.stringify(venda),
                },
              });

              if ((await resCreate.Id) != null) {
                // retira da fila de integração do ERP
                const request = require("superagent");
                const resListaIntegracao = await request
                  .post(
                    "http://cloud01.alternativa.net.br:2086/root/venda/" +
                      resCreate.Codigo +
                      "/ok"
                  )
                  .set("Accept", "application/json")
                  .set("accept-encoding", "gzip")
                  .set(
                    "X-Token",
                    "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs"
                  );

                resListaIntegracao.body;
              }
            }
          } catch (error) {
            console.error(error);
          }
        });
      } else {
        console.log("Lista de vendas vazia.");
      }
    } else {
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

// Endpoint: Carga inicial Vendas - início

app.get("/cargaVendas", async (request, reply) => {
  const maxRegistros = request.headers.maxRegistros;

  interface RouteParams {
    codigoInicial: number;
    codigoFinal: number;
  }

  const params = request.query as RouteParams;
  const codigoInicial = params.codigoInicial;
  const codigoFinal = params.codigoFinal;

  // busca fila de integração Vendas - inicio

  async function pegaVenda(Codigo: number) {
    try {
      const request = require("superagent");
      const resVenda = await request
        .get(`http://cloud01.alternativa.net.br:2086/root/venda/${Codigo}`)
        .set("Accept", "application/json")
        .set("accept-encoding", "gzip")
        .set("X-Token", "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs");
      //.set("Limit", "1");

      //resVenda.body;

      if (resVenda.status == 200) {
        return JSON.stringify(resVenda.body);
      } else {
        throw new Error("Erro ao obter o lista integração.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // busca fila de integração Vendas - fim

  // consome cada item da fila de integração Vendas - inicio

  async function mainConsomeLista(codigoInicial: number, codigoFinal: number) {
    for (let Codigo = codigoInicial; Codigo <= codigoFinal; Codigo++) {
      const resVenda = await pegaVenda(Codigo);

      if (resVenda) {
        const resListaIntegracaoJson = await JSON.parse(resVenda);

        if (resListaIntegracaoJson.venda != "") {
          resListaIntegracaoJson.venda.forEach(async (venda: any) => {
            try {
              interface Venda {
                Codigo: number;
                ClienteCodigo: number;
                ClienteTipoPessoa: string;
                ClienteDocumento: string;
                TransportadoraCodigo: number;
                DataVenda: string;
                Entrega: boolean;
                EntregaNome: string;
                EntregaEmail: string;
                NumeroObjeto: string;
                EntregaTelefone: string;
                EntregaLogradouro: string;
                EntregaLogradouroNumero: string;
                EntregaLogradouroComplemento: string;
                EntregaBairro: string;
                EntregaMunicipioNome: string;
                EntregaUnidadeFederativa: string;
                EntregaCEP: string;
                Observacoes: string;
                ObservacoesLoja: string;
                CodigoStatus: number;
                DescricaoStatus: string;
                DataHoraStatus: string;
                PrevisaoEntrega: string;
                CodigoNotaFiscal: number;
                DataEntrega: string;
                Cancelada: boolean;
                DataEnvio: string;
                NotaFiscalNumero: number;
                DataColeta: string;
              }

              const {
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
              } = venda as Venda;

              const existingRecord = await prisma.venda.findFirst({
                where: {
                  Codigo: Codigo,
                },
              });

              // Se não existir, insere o novo registro
              if (!existingRecord && Cancelada != true) {
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
              } else {
                console.log("Venda ja existente: " + Codigo);
              }
            } catch (error) {
              console.error(error);
            }
          });
        }
      } else {
        console.error("Erro ao obter o lista integração.");
        return;
      }
    }
  }

  // consome cada item da fila de integração Vendas - fim

  mainConsomeLista(codigoInicial, codigoFinal);

  const numeroDeVendas = await prisma.venda.count();
  return { numeroDeVendas };
});

// Endpoint: Carga inicial Vendas - fim

// Endpoint: Retorna Vendas - inicio

app.get("/vendas", async (request, reply) => {
  interface RouteParams {
    codigoInicial: string;
    codigoFinal: string;
  }

  const params = request.query as RouteParams;
  const codigoInicial = params.codigoInicial;
  const codigoFinal = params.codigoFinal;

  const vendas = await prisma.venda.findMany({
    select: {
      Codigo: true,
      DataVenda: true,
      CodigoNotaFiscal: true,
    },
    where: {
      Codigo: {
        gt: +codigoInicial,
        lt: +codigoFinal,
      },
      CodigoNotaFiscal: {
        gt: 0,
      },
      Cancelada: false,
    },
  });

  if (vendas.length > 0) {
    return reply.status(200).send(JSON.stringify(vendas));
  } else {
    return "Lista vazia.";
  }
});

// Endpoint: Retorna Vendas - fim

// Endpoint: Cadastra Nfe das Vendas últimos 3 meses - início

app.get("/cargaNfes", async (request, reply) => {
  interface RouteParams {
    codigoInicial: string;
    codigoFinal: string;
  }

  const params = request.query as RouteParams;
  const codigoInicial = params.codigoInicial;
  const codigoFinal = params.codigoFinal;

  // consome cada item da Lista Vendas - inicio

  async function mainInsereNfes(codigoInicial: string, codigoFinal: string) {
    const request = require("superagent");
    const resListaVendas = await request
      .get(
        `${API_URL}/vendas?codigoInicial=${codigoInicial}&codigoFinal=${codigoFinal}`
      )
      .set("Accept", "application/json");

    if (resListaVendas) {
      const resListaVendasJson = await JSON.parse(resListaVendas.text);

      resListaVendasJson.forEach(async (venda: any) => {
        try {
          const request = require("superagent");
          const resNfe = await request
            .get(
              `http://cloud01.alternativa.net.br:2086/root/nfe/${venda.CodigoNotaFiscal}`
            )
            .set("Accept", "application/json")
            .set("accept-encoding", "gzip")
            .set("X-Token", "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs");

          const NfeJson = JSON.parse(resNfe.text);

          interface Nfe {
            Codigo: number;
            CodigoVenda: number;
            CodigoCliente: number;
            DataEmissao: string;
            HoraEmissao: string;
            HoraSaida: string;
            Nfe: boolean;
            Nfce: boolean;
            NotaFiscalNumero: number;
            TransportadoraCodigo: number;
            TransportadoraNome: string;
            MeioTransporte: string;
            NumeroObjeto: string;
            NotaFiscalEletronica: string;
            Cancelada: boolean;
            MotivoCancelamento: string;
          }

          const {
            Codigo,
            CodigoVenda,
            CodigoCliente,
            DataEmissao,
            HoraEmissao,
            HoraSaida,
            Nfe,
            Nfce,
            NotaFiscalNumero,
            TransportadoraCodigo,
            TransportadoraNome,
            MeioTransporte,
            NumeroObjeto,
            NotaFiscalEletronica,
            Cancelada,
            MotivoCancelamento,
          } = NfeJson.nfe[0] as Nfe;

          const existingRecord = await prisma.nfe.findFirst({
            where: {
              Codigo: Codigo,
            },
          });

          // Se não existir, insere o novo registro
          if (!existingRecord && CodigoVenda != null) {
            console.log("Inserindo Nfe: " + Codigo);

            await prisma.nfe.create({
              data: {
                Codigo,
                CodigoVenda,
                CodigoCliente,
                DataEmissao,
                HoraEmissao,
                HoraSaida,
                Nfe,
                Nfce,
                NotaFiscalNumero,
                TransportadoraCodigo,
                TransportadoraNome,
                MeioTransporte,
                NumeroObjeto,
                NotaFiscalEletronica,
                Cancelada,
                MotivoCancelamento,
                CodigoVendaRel: CodigoVenda,
              },
            });
          } else {
            // Realiza o UPDATE da venda já cadastrada
            console.log(
              "Realizando Update da NFe da Venda: " +
                CodigoVenda +
                "NÂO IMPLEMENTADO"
            );
            /*
            await prisma.nfe.update({
              where: { CodigoVenda: CodigoVenda },
              data: {
                Codigo,
                CodigoVenda,
                CodigoCliente,
                DataEmissao,
                HoraEmissao,
                HoraSaida,
                Nfe,
                Nfce,
                NotaFiscalNumero,
                TransportadoraCodigo,
                TransportadoraNome,
                MeioTransporte,
                NumeroObjeto,
                NotaFiscalEletronica,
                Cancelada,
                MotivoCancelamento,
                CodigoVendaRel: CodigoVenda,
              },
            });
            */
          }
        } catch (error) {
          console.error(error);
        }
      });
    } else {
      console.error("Erro ao obter o lista de vendas.");
      return;
    }
  }

  // consome cada item da fila de integração Vendas - fim

  mainInsereNfes(codigoInicial, codigoFinal);

  const numeroDeNFe = await prisma.nfe.count();
  return { numeroDeNFe };
});

// Endpoint: Cadastra Nfe das Vendas últimos 3 meses  - fim

// Busca Vendas por CPF - inicio

app.get("/ultimaVendaCPFCNPJ", async (request, reply) => {
  async function pegaVenda(Codigo: number) {
    try {
      const request = require("superagent");
      const resVenda = await request
        .get(`http://cloud01.alternativa.net.br:2086/root/venda/${Codigo}`)
        .set("Accept", "application/json")
        .set("accept-encoding", "gzip")
        .set("X-Token", "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs");
      //.set("Limit", "1");

      // resVenda.body;

      if (resVenda.status == 200) {
        return JSON.stringify(resVenda.body);
      } else {
        throw new Error("Erro ao obter o lista integração.");
      }
    } catch (err) {
      console.error(err);
    }
  }
  interface RouteParams {
    cpfcnpj: string;
  }

  const params = request.query as RouteParams;
  const cpfcnpj = params.cpfcnpj;

  const ultimaVendaCPFCNPJ = await prisma.venda.findFirst({
    select: {
      Codigo: true,
      ClienteDocumento: true,
      DataVenda: true,
      DescricaoStatus: true,
      CodigoNotaFiscal: true,
      CodigoStatus: true,
      TransportadoraCodigo: true,
      Cancelada: true,
      DataHoraStatus: true,
      Entrega: true,
      NumeroObjeto: true,
      Observacoes: true,
    },
    where: {
      ClienteDocumento: cpfcnpj,
    },
    orderBy: {
      Codigo: "desc",
    },
  });

  if (ultimaVendaCPFCNPJ) {
    const vendaAtualizada = await pegaVenda(ultimaVendaCPFCNPJ.Codigo);
    return reply.status(200).send(await JSON.parse("" + vendaAtualizada));
  } else {
    const retorno = `{ "venda": [ { "NotaFiscalNumero": "0" } ] }`;
    return reply.status(200).send(JSON.parse(retorno));
  }
});

// Busca Vendas por CPF - fim

// Busca  Venda - inicio

app.get("/buscaVenda", async (request, reply) => {
  interface RouteParams {
    codigo: number;
    cpfcnpj: string;
  }

  const params = request.query as RouteParams;
  const codigo = params.codigo;
  const cpfcnpj = params.cpfcnpj;

  const buscaVenda = await prisma.venda.findFirst({
    where: {
      Codigo: +codigo,
    },
    orderBy: {
      Codigo: "desc",
    },
  });

  if (buscaVenda) {
    return reply.status(200).send({ buscaVenda });
  } else {
    const retorno = `{ "venda": [ { "NotaFiscalNumero": "0" } ] }`;
    return reply.status(200).send(JSON.parse(retorno));
  }
});

// Busca  Venda - fim

// Busca  Nfe - inicio

app.get("/buscaNfe", async (request, reply) => {
  interface RouteParams {
    codigonfe: number;
    cpfcnpj: string;
  }

  const params = request.query as RouteParams;
  const codigonfe = params.codigonfe;
  const cpfcnpj = params.cpfcnpj;

  const buscaNfe = await prisma.nfe.findFirst({
    where: {
      Codigo: +codigonfe,
    },
    orderBy: {
      Codigo: "desc",
    },
  });

  if (buscaNfe) {
    return reply.status(200).send({ buscaNfe });
  } else {
    const retorno = `{ "venda": [ { "NotaFiscalNumero": "0" } ] }`;
    return reply.status(200).send(JSON.parse(retorno));
  }
});

// Busca  Nfe - fim

// Endpoint: retorna Status última venda cpfcnpf - início

app.get("/retornaStatusEntrega", async (request, reply) => {
  interface RouteParams {
    codigo: number;
    cpfcnpj: string;
  }

  const params = request.query as RouteParams;
  const codigo = params.codigo;
  const cpfcnpj = params.cpfcnpj.replace(/[^\d]+/g, "").replace(/[^0-9]/g, "");
  let TransportadoraVenda = "";
  let resUltimaVendaCpfCnpjJsonFinal = {
    venda: [{ Codigo: "", DataVenda: "" }],
  };
  let NotaFiscalNumero;
  let NotaFiscalEletronica;

  // consome cada item da Lista Vendas - inicio

  async function mainBuscaOcorrencias(cpfcnpj: string) {
    const request = require("superagent");
    const resUltimaVendaCpfCnpj = await request
      .get(`${API_URL}/ultimaVendaCPFCNPJ?cpfcnpj=${cpfcnpj}`)
      .set("Accept", "application/json");

    if (await resUltimaVendaCpfCnpj) {
      const resUltimaVendaCpfCnpjJson = await JSON.parse(
        resUltimaVendaCpfCnpj.text
      );
      resUltimaVendaCpfCnpjJsonFinal = resUltimaVendaCpfCnpjJson;

      try {
        if ((await resUltimaVendaCpfCnpjJson.venda[0].NotaFiscalNumero) > 0) {
          const requestNF = require("superagent");
          const resNfe = await requestNF
            .get(
              `http://cloud01.alternativa.net.br:2086/root/nfe/${resUltimaVendaCpfCnpjJson.venda[0].CodigoNotaFiscal}`
            )
            .set("Accept", "application/json")
            .set("accept-encoding", "gzip")
            .set("X-Token", "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs");

          const NfeJson = JSON.parse(resNfe.text);

          interface Nfe {
            Codigo: number;
            CodigoVenda: number;
            CodigoCliente: number;
            DataEmissao: string;
            HoraEmissao: string;
            HoraSaida: string;
            Nfe: boolean;
            Nfce: boolean;
            NotaFiscalNumero: number;
            TransportadoraCodigo: number;
            TransportadoraNome: string;
            MeioTransporte: string;
            NumeroObjeto: string;
            NotaFiscalEletronica: string;
            Cancelada: boolean;
            MotivoCancelamento: string;
          }

          NotaFiscalEletronica = NfeJson.nfe[0].NotaFiscalEletronica;
          const TransportadoraNome = NfeJson.nfe[0].TransportadoraNome.trim();
          // Atualiza TransportadoraVenda para utilizar fora desse nó
          TransportadoraVenda = TransportadoraNome;

          NotaFiscalNumero = NfeJson.nfe[0].NotaFiscalNumero;
          const NotaFiscalObjeto = NfeJson.nfe[0].NumeroObjeto;

          // Se não existir, insere o novo registro
          if (NotaFiscalEletronica > 0) {
            console.log(
              `Transportadora ${TransportadoraNome}. Buscando ocorrências da Nfe: ` +
                NotaFiscalEletronica
            );

            // Busca Ocorrências Bauer, Aceville, Gobor, TPL

            if (
              TransportadoraNome == "BAUER" ||
              TransportadoraNome == "ACEVILLE" ||
              TransportadoraNome == "GOBOR" ||
              TransportadoraNome == "TPL" ||
              TransportadoraNome == "PREMIUMLOGTRANSPORTERODOVIARIODECARGASLTDA"
            ) {
              return `Utilize o código DANFE ${NotaFiscalEletronica} para consultar a localização do seu pedido através do link: https://ssw.inf.br/2/rastreamento_danfe`;
            }

            // Busca Ocorrências MODULAR
            else if (TransportadoraNome == "MODULAR") {
              // 1. Busca lista de notas na Modular pra pegar o CONTROLE para passo 2
              const requestMODULAR = require("superagent");
              const resMODULAR = await requestMODULAR
                .post(`https://www.modular.com.br/rastrear/listar`)
                .set("Content-Type", "multipart/form-data")
                .field("dados[nfs]", `${NotaFiscalNumero}`)
                .field("dados[cnpjcpf]", `${cpfcnpj}`)
                .set("Accept", "application/json");

              const MODULARJson = JSON.parse(resMODULAR.text);

              // 2. Pega lista ocorrências do da NF[0]

              const requestMODULARocorrencias = require("superagent");
              const resMODULARocorrencias = await requestMODULARocorrencias
                .post(`https://www.modular.com.br/rastrear/listar/posicao`)
                .set("Content-Type", "multipart/form-data")
                .field(
                  "dados[filialorigem]",
                  `${MODULARJson.notas[0].Filial_Origem}`
                )
                .field("dados[controle]", `${MODULARJson.notas[0].Controle}`)
                .set("Accept", "application/json");

              const MODULARocorrenciasJson = JSON.parse(
                resMODULARocorrencias.text
              );

              function formatarDados(dados: any[]) {
                return dados.map((item) => ({
                  dataHora: item.Data_Inicial,
                  observacao: item.Localizacao,
                  descricao: item.Descricao,
                }));
              }

              // Aplicando a formatação aos dados originais
              const dadosFormatados = formatarDados(
                MODULARocorrenciasJson.posicao
              );

              return JSON.stringify(dadosFormatados);
            }

            // Busca Ocorrências MANN
            else if (TransportadoraVenda == "MANNTRANSPORTES") {
              const payloadMANN000000 = {
                user: {
                  name: "Chief",
                  filial: "117",
                  filialNum: 27,
                  auth: {
                    value:
                      "SSM13wnMAzrqbri/I3z0B6cw82xSDT+iBQSvDOxK8IrEv58kZnLDoO13DWnmPZEP8q7QO6AqQ0XEDW+7noeS60yyjQQlvKGU",
                    expire: "0001-01-01T00:00:00",
                  },
                },
                app: {
                  application: 2,
                  version: "1.000.000",
                },
                parameters: [`${cpfcnpj}`, 0],
              };
              const payloadMANN0000 = JSON.stringify(payloadMANN000000);

              const resMANN00 = await request
                .post("https://api.transmann.com.br/old/site/track/Simple")
                .set("Accept", "application/json")
                .set("Content-Type", "application/json")
                .send(payloadMANN0000);

              interface Report {
                columns: string[];
                rows: string[][];
              }

              const MANNocorrenciasJson00 = JSON.parse(resMANN00.text);

              const MANNocorrenciasJson001: Report =
                MANNocorrenciasJson00.report;

              const ChaveAcessoMANN = MANNocorrenciasJson001.rows[0][10];

              const payloadMANN00 = {
                user: {
                  name: "Chief",
                  filial: "117",
                  filialNum: 27,
                  auth: {
                    value:
                      "SSM13wnMAzrqbri/I3z0B6cw82xSDT+iBQSvDOxK8IrEv58kZnLDoO13DWnmPZEP8q7QO6AqQ0XEDW+7noeS60yyjQQlvKGU",
                    expire: "0001-01-01T00:00:00",
                  },
                },
                app: { application: 2, version: "1.000.000" },
                parameters: [`${ChaveAcessoMANN}`],
              };
              const payloadMANN = JSON.stringify(payloadMANN00);

              const resMANN = await request
                .post("https://api.transmann.com.br/old/site/track/NFhistory")
                .set("Accept", "application/json")
                .set("Content-Type", "application/json")
                .send(payloadMANN);

              const MANNocorrenciasJson = JSON.parse(resMANN.text);

              interface ReportRow {
                columns: string[];
                rows: [string[], string[]];
              }

              const report: ReportRow = MANNocorrenciasJson.report;

              if (report && report.rows) {
                report.rows.forEach((row, index) => {
                  const [dataHora, descricao] = row;

                  resultadoFormatado += `Data/Hora da ocorrência: ${dataHora}\n`;
                  resultadoFormatado += `Observação: \n`;
                  resultadoFormatado += `Descrição: ${descricao}\n`;

                  if (index !== report.rows.length - 1) {
                    resultadoFormatado += "------\n";
                  }
                });
              } else {
                resultadoFormatado +=
                  "A movimentação da Nota Fiscal não foi identificada. Por favor tente novamente em algumas horas.";
              }

              return JSON.stringify(resultadoFormatado);
            }

            // Busca Ocorrências MOVVI
            else if (TransportadoraNome == "MOVVI") {
              const resMOVVI = await request
                .get(
                  `https://apimovvi.meridionalcargas.com.br/api/rastrear-carga/${cpfcnpj}/${NotaFiscalNumero}`
                )
                .set("Accept", "application/json")
                .set("Content-Type", "application/json");

              const MOVVIocorrenciasJson = JSON.parse(resMOVVI.text);

              if (MOVVIocorrenciasJson && MOVVIocorrenciasJson.ocorrencias) {
                MOVVIocorrenciasJson.ocorrencias.forEach(
                  (
                    row: { descricao: string; unidade: string; data: string },
                    index: number
                  ) => {
                    const { descricao, unidade, data } = row;

                    resultadoFormatado += `Data/Hora da ocorrência: ${data}\n`;
                    resultadoFormatado += `Observação: Unidade ${unidade}\n`;
                    resultadoFormatado += `Descrição: ${descricao}\n`;

                    if (index !== MOVVIocorrenciasJson.ocorrencias.length - 1) {
                      resultadoFormatado += "------\n";
                    }
                  }
                );
              } else {
                resultadoFormatado +=
                  "A movimentação da Nota Fiscal não foi identificada. Por favor tente novamente em algumas horas.";
              }

              return JSON.stringify(resultadoFormatado);
            }

            // Busca Ocorrências JAMEF
            else if (TransportadoraNome == "JAMEF") {
              const payloadJAMEF000000 = {
                username: "d1fitness",
                password: "d1fitness@188",
              };
              const payloadJAMEF0000 = JSON.stringify(payloadJAMEF000000);

              const resJAMEF00 = await request
                .post("https://api.jamef.com.br/login")
                .set("Content-Type", "application/json")
                .send(payloadJAMEF0000);

              const JAMEFlogin = JSON.parse(resJAMEF00.text);

              const ChaveAcessoJAMEF = JAMEFlogin.access_token;

              const payloadJAMEF00 = {
                documentoResponsavelPagamento: "52544047000110",
                documentoDestinatario: `${cpfcnpj}`,
                numeroNotaFiscal: `${NotaFiscalNumero}`,
                numeroSerieNotaFiscal: "",
                codigoFilialOrigem: "",
              };
              const payloadJAMEF = JSON.stringify(payloadJAMEF00);

              const resJAMEF = await request
                .post("https://api.jamef.com.br/rastreamento/ver")
                .set("Accept", "application/json")
                .set("Content-Type", "application/json")
                .set("Authorization", `Bearer ${ChaveAcessoJAMEF}`)
                .send(payloadJAMEF);

              const JAMEFocorrenciasJson = JSON.parse(resJAMEF.text);

              if (
                JAMEFocorrenciasJson &&
                JAMEFocorrenciasJson.conhecimentos[0].historico
              ) {
                JAMEFocorrenciasJson.conhecimentos[0].historico.forEach(
                  (
                    row: {
                      statusRastreamento: string;
                      dataAtualizacao: string;
                      numeroManifesto: string;
                      ufOrigem: string;
                      municipioOrigem: string;
                      ufDestino: string;
                      municipioDestino: string;
                      codigoOcorrencia: string;
                    },
                    index: number
                  ) => {
                    const {
                      statusRastreamento,
                      dataAtualizacao,
                      numeroManifesto,
                      ufOrigem,
                      municipioOrigem,
                      ufDestino,
                      municipioDestino,
                      codigoOcorrencia,
                    } = row;

                    resultadoFormatado += `Data/Hora da ocorrência: ${dataAtualizacao}\n`;
                    resultadoFormatado += `Observação: \n`;
                    resultadoFormatado += `Descrição: ${statusRastreamento}\n`;

                    if (
                      index !==
                      JAMEFocorrenciasJson.conhecimentos[0].historico.length - 1
                    ) {
                      resultadoFormatado += "------\n";
                    }
                  }
                );
              } else {
                resultadoFormatado +=
                  "A movimentação da Nota Fiscal não foi identificada. Por favor tente novamente em algumas horas.";
              }

              return JSON.stringify(resultadoFormatado);
            }

            // Busca Ocorrências BERTOLINI
            else if (TransportadoraNome == "BERTOLINI") {
              return `Ocorrências não localizadas.`;
            }

            // Busca Ocorrências Mercado Livre
            else if (/EBAZAR/i.test(TransportadoraNome)) {
              return `Consulte a localização do seu pedido diretamente no site ou aplicativo do Mercado Livre.`;
            }

            // Busca Ocorrências CORREIOS
            else if (/PAC|SEDEX/i.test(TransportadoraNome)) {
              return `Utilize o link abaixo para consultar a localização do seu pedido: https://www.linkcorreios.com.br/${NotaFiscalObjeto}`;
            } else {
              return `Ocorrências não localizadas.`;
            }

            /*const resDataFrete = await request
              .get(
                `https://services.v1.datafreteapi.com/ocorrencias/nota-fiscal?nota_fiscal[chave]=${NotaFIscalEletronica}`
              )
              .set("Accept", "application/json")
              .set("accept-encoding", "gzip")
              .set("x-api-key", "26a98a8a-b58b-45fb-bcdb-c8b96d0f7c38");

            const resDataFreteJson = JSON.parse(resDataFrete.text); */

            // console.log(resDataFreteJson.data);

            // return resDataFreteJson.data;
          } else {
            // Realiza o UPDATE da venda já cadastrada
            console.log("Aguardando emissão da Nota Fiscal.");

            return "Aguardando emissão da Nota Fiscal.";
          }
        } else {
          return "Aguardando emissão da Nota Fiscal.";
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error("Aguardando emissão da Nota Fiscal.");
      return;
    }
  }

  let resultadoFormatado = "";

  interface Ocorrencia {
    dataHora: string;
    observacao: string;
    descricao: string;
  }

  const retornoEndpointString = await mainBuscaOcorrencias(cpfcnpj);

  async function formatarOcorrencias() {
    const retornoEndpoint: Ocorrencia[] = await JSON.parse(
      "" + retornoEndpointString
    ); // Suponha que obterRetornoEndpoint() é a função que retorna a promessa

    let resultadoFormatado = "";

    retornoEndpoint.forEach((item, index) => {
      const { dataHora, observacao, descricao } = item;

      resultadoFormatado += `Data/Hora da ocorrência: ${dataHora}\n`;
      resultadoFormatado += `Observação: ${observacao}\n`;
      resultadoFormatado += `Descrição: ${descricao}\n`;

      if (index !== retornoEndpoint.length - 1) {
        resultadoFormatado += "------\n";
      }
    });

    return resultadoFormatado;
  }

  if (TransportadoraVenda == "MODULAR") {
    // Chamada da função para formatar as ocorrências
    const retornoEndpointFormatado = formatarOcorrencias();

    if (
      (await retornoEndpointFormatado) != "Aguardando emissão da Nota Fiscal."
    ) {
      // Função para formatar os dados conforme o desejado

      resultadoFormatado += await retornoEndpointFormatado;
    } else {
      resultadoFormatado = "Aguardando emissão da Nota Fiscal.";
    }
  } else if (
    TransportadoraVenda == "MANNTRANSPORTES" ||
    TransportadoraVenda == "MOVVI" ||
    TransportadoraVenda == "JAMEF"
  ) {
    // Mantem formato já pronto
  } else {
    resultadoFormatado += retornoEndpointString;
  }

  // insere registro de metricas
  try {
    const createdMetric = await prisma.rastreioChatMetricas.create({
      data: {
        CodigoVenda: `${resUltimaVendaCpfCnpjJsonFinal.venda[0].Codigo}`,
        DataVenda: `${resUltimaVendaCpfCnpjJsonFinal.venda[0].DataVenda}`,
        NotaFiscalEletronica: `${NotaFiscalEletronica}`,
        TransportadoraNome: `${TransportadoraVenda}`,
        Ocorrencias: `${resultadoFormatado}`,
        Canal: "WhatsApp"
      },
    });
  } catch (error) {
    console.error(error);
  }

  return reply
    .status(200)
    .send(
      JSON.parse(JSON.stringify(`{ "ocorrencias": "${resultadoFormatado}" }`))
    );
});

app.get("/retornaStatusEntregaBlip", async (request, reply) => {
  interface RouteParams {
    canal: any;
    codigo: number;
    cpfcnpj: string;
  }

  const params = request.query as RouteParams;
  const codigo = params.codigo;
  const cpfcnpj = params.cpfcnpj.replace(/[^\d]+/g, "").replace(/[^0-9]/g, "");
  let TransportadoraVenda = "";
  let resUltimaVendaCpfCnpjJsonFinal = {
    venda: [{ Codigo: "", DataVenda: "" }],
  };
  let NotaFiscalNumero;
  let NotaFiscalEletronica;

  // consome cada item da Lista Vendas - inicio

  async function mainBuscaOcorrencias(cpfcnpj: string) {
    const request = require("superagent");
    const resUltimaVendaCpfCnpj = await request
      .get(`${API_URL}/ultimaVendaCPFCNPJ?cpfcnpj=${cpfcnpj}`)
      .set("Accept", "application/json");

    if (await resUltimaVendaCpfCnpj) {
      const resUltimaVendaCpfCnpjJson = await JSON.parse(
        resUltimaVendaCpfCnpj.text
      );
      resUltimaVendaCpfCnpjJsonFinal = resUltimaVendaCpfCnpjJson;

      try {
        if ((await resUltimaVendaCpfCnpjJson.venda[0].NotaFiscalNumero) > 0) {
          const requestNF = require("superagent");
          const resNfe = await requestNF
            .get(
              `http://cloud01.alternativa.net.br:2086/root/nfe/${resUltimaVendaCpfCnpjJson.venda[0].CodigoNotaFiscal}`
            )
            .set("Accept", "application/json")
            .set("accept-encoding", "gzip")
            .set("X-Token", "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs");

          const NfeJson = JSON.parse(resNfe.text);

          interface Nfe {
            Codigo: number;
            CodigoVenda: number;
            CodigoCliente: number;
            DataEmissao: string;
            HoraEmissao: string;
            HoraSaida: string;
            Nfe: boolean;
            Nfce: boolean;
            NotaFiscalNumero: number;
            TransportadoraCodigo: number;
            TransportadoraNome: string;
            MeioTransporte: string;
            NumeroObjeto: string;
            NotaFiscalEletronica: string;
            Cancelada: boolean;
            MotivoCancelamento: string;
          }

          NotaFiscalEletronica = NfeJson.nfe[0].NotaFiscalEletronica;
          const TransportadoraNome = NfeJson.nfe[0].TransportadoraNome.trim();
          // Atualiza TransportadoraVenda para utilizar fora desse nó
          TransportadoraVenda = TransportadoraNome;

          NotaFiscalNumero = NfeJson.nfe[0].NotaFiscalNumero;
          const NotaFiscalObjeto = NfeJson.nfe[0].NumeroObjeto;

          // Se não existir, insere o novo registro
          if (NotaFiscalEletronica > 0) {
            console.log(
              `Transportadora ${TransportadoraNome}. Buscando ocorrências da Nfe: ` +
              NotaFiscalEletronica
            );

            // Busca Ocorrências Bauer, Aceville, Gobor, TPL

            if (
              TransportadoraNome == "BAUER" ||
              TransportadoraNome == "ACEVILLE" ||
              TransportadoraNome == "GOBOR" ||
              TransportadoraNome == "TPL" ||
              TransportadoraNome == "PREMIUMLOGTRANSPORTERODOVIARIODECARGASLTDA"
            ) {
              return `Utilize o código DANFE ${NotaFiscalEletronica} para consultar a localização do seu pedido através do link: https://ssw.inf.br/2/rastreamento_danfe`;
            }

            // Busca Ocorrências MODULAR
            else if (TransportadoraNome == "MODULAR") {
              // 1. Busca lista de notas na Modular pra pegar o CONTROLE para passo 2
              const requestMODULAR = require("superagent");
              const resMODULAR = await requestMODULAR
                .post(`https://www.modular.com.br/rastrear/listar`)
                .set("Content-Type", "multipart/form-data")
                .field("dados[nfs]", `${NotaFiscalNumero}`)
                .field("dados[cnpjcpf]", `${cpfcnpj}`)
                .set("Accept", "application/json");

              const MODULARJson = JSON.parse(resMODULAR.text);

              // 2. Pega lista ocorrências do da NF[0]

              const requestMODULARocorrencias = require("superagent");
              const resMODULARocorrencias = await requestMODULARocorrencias
                .post(`https://www.modular.com.br/rastrear/listar/posicao`)
                .set("Content-Type", "multipart/form-data")
                .field(
                  "dados[filialorigem]",
                  `${MODULARJson.notas[0].Filial_Origem}`
                )
                .field("dados[controle]", `${MODULARJson.notas[0].Controle}`)
                .set("Accept", "application/json");

              const MODULARocorrenciasJson = JSON.parse(
                resMODULARocorrencias.text
              );

              function formatarDados(dados: any[]) {
                return dados.map((item) => ({
                  dataHora: item.Data_Inicial,
                  observacao: item.Localizacao,
                  descricao: item.Descricao,
                }));
              }

              // Aplicando a formatação aos dados originais
              const dadosFormatados = formatarDados(
                MODULARocorrenciasJson.posicao
              );

              return JSON.stringify(dadosFormatados);
            }

            // Busca Ocorrências MANN
            else if (TransportadoraVenda == "MANNTRANSPORTES") {
              const payloadMANN000000 = {
                user: {
                  name: "Chief",
                  filial: "117",
                  filialNum: 27,
                  auth: {
                    value:
                      "SSM13wnMAzrqbri/I3z0B6cw82xSDT+iBQSvDOxK8IrEv58kZnLDoO13DWnmPZEP8q7QO6AqQ0XEDW+7noeS60yyjQQlvKGU",
                    expire: "0001-01-01T00:00:00",
                  },
                },
                app: {
                  application: 2,
                  version: "1.000.000",
                },
                parameters: [`${cpfcnpj}`, 0],
              };
              const payloadMANN0000 = JSON.stringify(payloadMANN000000);

              const resMANN00 = await request
                .post("https://api.transmann.com.br/old/site/track/Simple")
                .set("Accept", "application/json")
                .set("Content-Type", "application/json")
                .send(payloadMANN0000);

              interface Report {
                columns: string[];
                rows: string[][];
              }

              const MANNocorrenciasJson00 = JSON.parse(resMANN00.text);

              const MANNocorrenciasJson001: Report =
                MANNocorrenciasJson00.report;

              const ChaveAcessoMANN = MANNocorrenciasJson001.rows[0][10];

              const payloadMANN00 = {
                user: {
                  name: "Chief",
                  filial: "117",
                  filialNum: 27,
                  auth: {
                    value:
                      "SSM13wnMAzrqbri/I3z0B6cw82xSDT+iBQSvDOxK8IrEv58kZnLDoO13DWnmPZEP8q7QO6AqQ0XEDW+7noeS60yyjQQlvKGU",
                    expire: "0001-01-01T00:00:00",
                  },
                },
                app: { application: 2, version: "1.000.000" },
                parameters: [`${ChaveAcessoMANN}`],
              };
              const payloadMANN = JSON.stringify(payloadMANN00);

              const resMANN = await request
                .post("https://api.transmann.com.br/old/site/track/NFhistory")
                .set("Accept", "application/json")
                .set("Content-Type", "application/json")
                .send(payloadMANN);

              const MANNocorrenciasJson = JSON.parse(resMANN.text);

              interface ReportRow {
                columns: string[];
                rows: [string[], string[]];
              }

              const report: ReportRow = MANNocorrenciasJson.report;

              if (report && report.rows) {
                report.rows.forEach((row, index) => {
                  const [dataHora, descricao] = row;

                  resultadoFormatado += `Data/Hora da ocorrência: ${dataHora}\n`;
                  resultadoFormatado += `Observação: \n`;
                  resultadoFormatado += `Descrição: ${descricao}\n`;

                  if (index !== report.rows.length - 1) {
                    resultadoFormatado += "------\n";
                  }
                });
              } else {
                resultadoFormatado +=
                  "A movimentação da Nota Fiscal não foi identificada. Por favor tente novamente em algumas horas.";
              }

              return JSON.stringify(resultadoFormatado);
            }

            // Busca Ocorrências MOVVI
            else if (TransportadoraNome == "MOVVI") {
              const resMOVVI = await request
                .get(
                  `https://apimovvi.meridionalcargas.com.br/api/rastrear-carga/${cpfcnpj}/${NotaFiscalNumero}`
                )
                .set("Accept", "application/json")
                .set("Content-Type", "application/json");

              const MOVVIocorrenciasJson = JSON.parse(resMOVVI.text);

              if (MOVVIocorrenciasJson && MOVVIocorrenciasJson.ocorrencias) {
                MOVVIocorrenciasJson.ocorrencias.forEach(
                  (
                    row: { descricao: string; unidade: string; data: string },
                    index: number
                  ) => {
                    const { descricao, unidade, data } = row;

                    resultadoFormatado += `Data/Hora da ocorrência: ${data}\n`;
                    resultadoFormatado += `Observação: Unidade ${unidade}\n`;
                    resultadoFormatado += `Descrição: ${descricao}\n`;

                    if (index !== MOVVIocorrenciasJson.ocorrencias.length - 1) {
                      resultadoFormatado += "------\n";
                    }
                  }
                );
              } else {
                resultadoFormatado +=
                  "A movimentação da Nota Fiscal não foi identificada. Por favor tente novamente em algumas horas.";
              }

              return JSON.stringify(resultadoFormatado);
            }

            // Busca Ocorrências JAMEF
            else if (TransportadoraNome == "JAMEF") {
              const payloadJAMEF000000 = {
                username: "d1fitness",
                password: "d1fitness@188",
              };
              const payloadJAMEF0000 = JSON.stringify(payloadJAMEF000000);

              const resJAMEF00 = await request
                .post("https://api.jamef.com.br/login")
                .set("Content-Type", "application/json")
                .send(payloadJAMEF0000);

              const JAMEFlogin = JSON.parse(resJAMEF00.text);

              const ChaveAcessoJAMEF = JAMEFlogin.access_token;

              const payloadJAMEF00 = {
                documentoResponsavelPagamento: "52544047000110",
                documentoDestinatario: `${cpfcnpj}`,
                numeroNotaFiscal: `${NotaFiscalNumero}`,
                numeroSerieNotaFiscal: "",
                codigoFilialOrigem: "",
              };
              const payloadJAMEF = JSON.stringify(payloadJAMEF00);

              const resJAMEF = await request
                .post("https://api.jamef.com.br/rastreamento/ver")
                .set("Accept", "application/json")
                .set("Content-Type", "application/json")
                .set("Authorization", `Bearer ${ChaveAcessoJAMEF}`)
                .send(payloadJAMEF);

              const JAMEFocorrenciasJson = JSON.parse(resJAMEF.text);

              if (
                JAMEFocorrenciasJson &&
                JAMEFocorrenciasJson.conhecimentos[0].historico
              ) {
                JAMEFocorrenciasJson.conhecimentos[0].historico.forEach(
                  (
                    row: {
                      statusRastreamento: string;
                      dataAtualizacao: string;
                      numeroManifesto: string;
                      ufOrigem: string;
                      municipioOrigem: string;
                      ufDestino: string;
                      municipioDestino: string;
                      codigoOcorrencia: string;
                    },
                    index: number
                  ) => {
                    const {
                      statusRastreamento,
                      dataAtualizacao,
                      numeroManifesto,
                      ufOrigem,
                      municipioOrigem,
                      ufDestino,
                      municipioDestino,
                      codigoOcorrencia,
                    } = row;

                    resultadoFormatado += `Data/Hora da ocorrência: ${dataAtualizacao}\n`;
                    resultadoFormatado += `Observação: \n`;
                    resultadoFormatado += `Descrição: ${statusRastreamento}\n`;

                    if (
                      index !==
                      JAMEFocorrenciasJson.conhecimentos[0].historico.length - 1
                    ) {
                      resultadoFormatado += "------\n";
                    }
                  }
                );
              } else {
                resultadoFormatado +=
                  "A movimentação da Nota Fiscal não foi identificada. Por favor tente novamente em algumas horas.";
              }

              return JSON.stringify(resultadoFormatado);
            }

            // Busca Ocorrências BERTOLINI
            else if (TransportadoraNome == "BERTOLINI") {
              return `Ocorrências não localizadas.`;
            }

            // Busca Ocorrências Mercado Livre
            else if (/EBAZAR/i.test(TransportadoraNome)) {
              return `Consulte a localização do seu pedido diretamente no site ou aplicativo do Mercado Livre.`;
            }
            // Busca Ocorrências CORREIOS
            else if (/PAC|SEDEX/i.test(TransportadoraNome)) {
              return `Utilize o link abaixo para consultar a localização do seu pedido: https://www.linkcorreios.com.br/${NotaFiscalObjeto}`;
            } else {
              return `Sem resposta da Transportadora ${TransportadoraNome}. Por favor, tente novamente em alguns instantes.`;
            }

            /*const resDataFrete = await request
              .get(
                `https://services.v1.datafreteapi.com/ocorrencias/nota-fiscal?nota_fiscal[chave]=${NotaFIscalEletronica}`
              )
              .set("Accept", "application/json")
              .set("accept-encoding", "gzip")
              .set("x-api-key", "26a98a8a-b58b-45fb-bcdb-c8b96d0f7c38");

            const resDataFreteJson = JSON.parse(resDataFrete.text); */

            // console.log(resDataFreteJson.data);

            // return resDataFreteJson.data;
          } else {
            // Realiza o UPDATE da venda já cadastrada
            console.log("Aguardando emissão da Nota Fiscal.");

            return "Aguardando emissão da Nota Fiscal.";
          }
        } else {
          return "Aguardando emissão da Nota Fiscal.";
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error("Aguardando emissão da Nota Fiscal.");
      return;
    }
  }

  let resultadoFormatado = "";

  interface Ocorrencia {
    dataHora: string;
    observacao: string;
    descricao: string;
  }

  const retornoEndpointString = await mainBuscaOcorrencias(cpfcnpj);

  async function formatarOcorrencias() {
    const retornoEndpoint: Ocorrencia[] = await JSON.parse(
      "" + retornoEndpointString
    ); // Suponha que obterRetornoEndpoint() é a função que retorna a promessa

    let resultadoFormatado = "";

    retornoEndpoint.forEach((item, index) => {
      const { dataHora, observacao, descricao } = item;

      resultadoFormatado += `Data/Hora da ocorrência: ${dataHora}\n`;
      resultadoFormatado += `Observação: ${observacao}\n`;
      resultadoFormatado += `Descrição: ${descricao}\n`;

      if (index !== retornoEndpoint.length - 1) {
        resultadoFormatado += "------\n";
      }
    });

    return resultadoFormatado;
  }

  if (TransportadoraVenda == "MODULAR") {
    // Chamada da função para formatar as ocorrências
    const retornoEndpointFormatado = formatarOcorrencias();

    if (
      (await retornoEndpointFormatado) != "Aguardando emissão da Nota Fiscal."
    ) {
      // Função para formatar os dados conforme o desejado

      resultadoFormatado += await retornoEndpointFormatado;
    } else {
      resultadoFormatado = "Aguardando emissão da Nota Fiscal.";
    }
  } else if (
    TransportadoraVenda == "MANNTRANSPORTES" ||
    TransportadoraVenda == "MOVVI" ||
    TransportadoraVenda == "JAMEF"
  ) {
    // Mantem formato já pronto
  } else {
    resultadoFormatado += retornoEndpointString;
  }

  let canal = "Site";

  const canalReq = params.canal;

  if(canalReq !== null) { canal = canalReq; }

  // insere registro de metricas
  try {
    const createdMetric = await prisma.rastreioChatMetricas.create({
      data: {
        CodigoVenda: `${resUltimaVendaCpfCnpjJsonFinal.venda[0].Codigo}`,
        DataVenda: `${resUltimaVendaCpfCnpjJsonFinal.venda[0].DataVenda}`,
        NotaFiscalEletronica: `${NotaFiscalEletronica}`,
        TransportadoraNome: `${TransportadoraVenda}`,
        Ocorrencias: `${resultadoFormatado}`,
        Canal: `${canal}`,
      },
    });
  } catch (error) {
    console.error(error);
  }

  return reply.status(200).send(resultadoFormatado);
});

// Endpoint: retorna Status última venda cpfcnpf - fim

// Busca  RastreioChat - inicio - DEPRACATED -> foi pro orquestrador

app.get("/rastreioChat", async (request, reply) => {
  interface RouteParams {
    Titulo: string;
    Etapa: number;
    Prioridade: number;
    Mensagem: string;
    Ativo: boolean;
  }

  const buscaRastreioChat = await prisma.rastreioChat.findMany({
    orderBy: {
      Etapa: "asc",
    },
  });

  if (buscaRastreioChat) {
    return reply.status(200).send({ buscaRastreioChat });
  } else {
    const retorno = `{ "Nenhuma mensagem cadastrada." }`;
    return reply.status(200).send(JSON.parse(retorno));
  }
});

// SHOW

app.get("/rastreioChat/:idMensagem", async (request, reply) => {
  const idMensagem: any = (request as any).parametro;
  interface RouteParams {
    Titulo: string;
    Etapa: number;
    Prioridade: number;
    Mensagem: string;
    Ativo: boolean;
  }

  const buscaRastreioChat = await prisma.rastreioChat.findFirst({
    where: {
      Id: `${idMensagem}`,
    },
  });

  if (buscaRastreioChat) {
    return reply.status(200).send({ buscaRastreioChat });
  } else {
    const retorno = `{ "Nenhuma mensagem cadastrada." }`;
    return reply.status(200).send(JSON.parse(retorno));
  }
});

// Busca  RastreioChat - fim

// Webhook Z-API -> Blip Rastreio - inicio

app.post("/zapi", async (request, reply) => {
  const requestSA = require("superagent");

  if (typeof request.body === "object" && request.body !== null) {
    const telefoneCliente = (request.body as { phone: string }).phone;
    const mensagemCliente = (request.body as { text: { message: string } }).text
      .message;

    let mensagem = "";
    let Etapa = 0;

    const bodyBlip = `{"ocorrencias": "Lista de ocorrencias"}`;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    function valida_cpfcnpj(inputCPFCNPJ: string): string {
      let documentoValido: string = "false";

      // Identifica e valida se o campo é de CPF ou CNPJ
      CPFouCNPJ(inputCPFCNPJ);

      function CPFouCNPJ(inputCPFCNPJ: string) {
        const contador: number = inputCPFCNPJ.replace(/[^0-9]/g, "").length;
        if (contador == 0) {
          documentoValido = "false";
        } else if (contador == 11) {
          if (validaCPF(inputCPFCNPJ)) {
            documentoValido = "cpf_valido";
          } else {
            documentoValido = "false";
          }
        } else if (contador == 14) {
          if (validaCNPJ(inputCPFCNPJ)) {
            documentoValido = "cnpj_valido";
          } else {
            documentoValido = "false";
          }
        } else {
          documentoValido = "false";
        }
      }

      // Valida CPF
      function validaCPF(cpf: string): boolean {
        cpf = cpf.replace(/[^\d]+/g, "");
        if (cpf == "") return false;
        if (
          cpf.length != 11 ||
          cpf == "00000000000" ||
          cpf == "11111111111" ||
          cpf == "22222222222" ||
          cpf == "33333333333" ||
          cpf == "44444444444" ||
          cpf == "55555555555" ||
          cpf == "66666666666" ||
          cpf == "77777777777" ||
          cpf == "88888888888" ||
          cpf == "99999999999" ||
          cpf == "01234567890"
        )
          return false;
        let add: number = 0;
        for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
        let rev: number = 11 - (add % 11);
        if (rev == 10 || rev == 11) rev = 0;
        if (rev != parseInt(cpf.charAt(9))) return false;
        add = 0;
        for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
        rev = 11 - (add % 11);
        if (rev == 10 || rev == 11) rev = 0;
        if (rev != parseInt(cpf.charAt(10))) return false;
        return true;
      }

      // Valida CNPJ
      function validaCNPJ(CNPJ: string): boolean {
        CNPJ = CNPJ.replace(/[^\d]+/g, "");
        const a: number[] = [];
        let b: number = 0;
        const c: number[] = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        for (let i = 0; i < 12; i++) {
          a[i] = parseInt(CNPJ.charAt(i));
          b += a[i] * c[i + 1];
        }
        let x: number = b % 11;
        if (x < 2) {
          a[12] = 0;
        } else {
          a[12] = 11 - x;
        }
        b = 0;
        for (let y = 0; y < 13; y++) {
          b += a[y] * c[y];
        }
        x = b % 11;
        if (x < 2) {
          a[13] = 0;
        } else {
          a[13] = 11 - x;
        }
        if (
          parseInt(CNPJ.charAt(12)) != a[12] ||
          parseInt(CNPJ.charAt(13)) != a[13]
        ) {
          return false;
        }
        if (parseInt(CNPJ) == 0) {
          return false;
        }
        return true;
      }

      return documentoValido; // Return value will be saved as "Return value variable" field name
    }

    // Verifica se já existe um registro com o mesmo agente e data_login
    const existingRecord = await prisma.contextoRastreio.findFirst({
      where: {
        Telefone: telefoneCliente,
      },
    });

    if (existingRecord) {
      Etapa = existingRecord.Etapa;
    } else {
      try {
        const createdContexto = await prisma.contextoRastreio.create({
          data: {
            Telefone: telefoneCliente,
            Data: formattedDate,
            MensagemCliente: mensagemCliente,
            Etapa: 1,
          },
        });
      } catch (error) {
        console.error(error);
      }
    }

    if (Etapa == 0) {
      mensagem =
        "Olá!!\nEstou aqui pra te responder sobre status da entrega da sua compra 😉\nPara prosseguirmos, informe o seu CPF ou CNPJ";

      try {
        const createdContexto = await prisma.contextoRastreio.create({
          data: {
            Telefone: telefoneCliente,
            Data: formattedDate,
            MensagemCliente: mensagemCliente,
            Etapa: 1,
          },
        });
      } catch (error) {
        console.error(error);
      }
    } else if (Etapa == 1) {
      const cpfcnpf = mensagemCliente;
      const documentoValido = valida_cpfcnpj(cpfcnpf.trim());

      if (documentoValido == "cpf_valido" || documentoValido == "cnpj_valido") {
        mensagem = "Estamos consultando o status da entrega";

        try {
          const createdContexto = await prisma.contextoRastreio.create({
            data: {
              Telefone: telefoneCliente,
              MensagemCliente: mensagemCliente,
              Data: formattedDate,
              Etapa: 2,
            },
          });
        } catch (error) {
          console.error(error);
        }

        // Envia mensagem de que foi buscar as ocorrências
        const bodyWhats0 = `{"phone": "${telefoneCliente}","message": "${mensagem}"}`;

        const resZAPI0 = await requestSA
          .post(
            "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
          )
          .set("Content-Type", "application/json")
          .set("Client-Token", `F622e76b1e3f64e2a9517d207fe923fa5S`)
          .send(bodyWhats0);

        // Busca ocorrências
        const resOcorrencias = await requestSA
          .get(
            `https://d1-rastreio.onrender.com/retornaStatusEntregaBlip?cpfcnpj=${cpfcnpf}&canal=WhatsApp-2`
          )
          .set("Content-Type", "application/json");

        // Envia ocorrencias pro Whats
        const bodyWhats1 = `{"phone": "${telefoneCliente}","message": "${resOcorrencias.text}"}`;

        const resZAPI1 = await requestSA
          .post(
            "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
          )
          .set("Content-Type", "application/json")
          .set("Client-Token", `F622e76b1e3f64e2a9517d207fe923fa5S`)
          .send(bodyWhats1);

        // FInaliza com mensagem para buscar mais informações no Whats oficial
        mensagem =
          "Para mais informações, fale com nosso atendimento pelo Whatsapp: 11930373935";

        // Zera o fluxo para recomeçar
        try {
          const createdContexto = await prisma.contextoRastreio.create({
            data: {
              Telefone: telefoneCliente,
              MensagemCliente: mensagemCliente,
              Data: formattedDate,
              Etapa: 0,
            },
          });
        } catch (error) {
          console.error(error);
        }
      } else {
        mensagem =
          "Por gentileza informe apenas os números do seu CPF ou CNPJ novamente";
      }
    } else {
      mensagem =
        "Não foi possível realizar a consulta de forma automática. Por gentileza, procure nosso time de atendimento através do link: https://wa.me/5511930373935 ";

      try {
        const createdContexto = await prisma.contextoRastreio.create({
          data: {
            Telefone: telefoneCliente,
            MensagemCliente: mensagemCliente,
            Data: formattedDate,
            Etapa: 0,
          },
        });
      } catch (error) {
        console.error(error);
      }
    }

    // const blipuuid: string = uuid();
    const bodyWhats = `{"phone": "${telefoneCliente}","message": "${mensagem}"}`;

    const resZAPI = await requestSA
      .post(
        "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
      )
      .set("Content-Type", "application/json")
      .set("Client-Token", `F622e76b1e3f64e2a9517d207fe923fa5S`)
      .send(bodyWhats);

    return reply
      .status(200)
      .send(await JSON.parse(JSON.stringify(`Etapa atual: ${Etapa}`)));
  } else {
    console.error(error);

    return reply.status(500).send(error);
  }
});

// Blip -> Whats Rastreio - inicio

app.post("/whatsrastreio", async (request, reply) => {
  const requestSA = require("superagent");

  const bodyBlip = JSON.parse(JSON.stringify(request.body));

  if (typeof bodyBlip === "object" && bodyBlip !== null) {
    console.log(bodyBlip);

    const telefoneCliente = (bodyBlip as { phone: string }).phone;
    const blocoCliente = (bodyBlip as { bloco: string }).bloco;

    let mensagem = "";

    if (blocoCliente == "solicita_cfpcnpj") {
      mensagem =
        "Olá!!\nEstou aqui pra te responder sobre status da entrega da sua compra 😉\nPara prosseguirmos, informe o seu CPF ou CNPJ";
    } else if (blocoCliente == "solicita_cfpcnpj_novamente") {
      mensagem =
        "Por gentileza informe apenas os números do seu CPF ou CNPJ novamente";
    } else if (blocoCliente == "verificando_ocorrencias") {
      mensagem = "Estamos consultando o status da entrega";
    } else if (blocoCliente == "envia_ocorrencias") {
      const ocorrencias = (bodyBlip as { ocorrencias: string }).ocorrencias;
      mensagem = ocorrencias;
    } else {
      mensagem =
        "Não foi possível realizar a consulta de forma automática. Por gentileza, procure nosso time de atendimento através do link: https://wa.me/5511930373935 ";
    }

    // const bodyWhats = `{"phone": "5548988038546","message": "Agente: ${data.respondent.respondent_utms.utm_source}\nProtocolo: ${data.respondent.respondent_utms.utm_campaign}\nNota: ${data.respondent.answers["Avalie o atendimento que você recebeu no Whatsapp!"]}\nSugestão: ${data.respondent.answers["Quer deixar alguma sugestão pra gente?"]} "}`;
    const bodyWhats = `{"phone": "5551991508579","message": "${mensagem}"}`;

    const resZAPI = await requestSA
      .post(
        "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
      )
      .set("Content-Type", "application/json")
      .set("Client-Token", `F622e76b1e3f64e2a9517d207fe923fa5S`)
      .send(bodyWhats);

    /* const res3 = await fetch(sendWhats.url, {
    method: sendWhats.method,
    headers: sendWhats.headers,
    body: sendWhats.body,
  }); */

    //console.log(resZAPI);

    return reply
      .status(200)
      .send(await JSON.parse(JSON.stringify(request.body)));
  } else {
    console.log("Nao entrou no if");

    return reply.status(200).send("500 NOK");
  }
});

// Busca  RastreioChat - fim

// Exibe HTML - inicio

app.get("/webchat", async (request, reply) => {
  return reply.status(200).sendFile("rastreio-site-chat.html");
});

// Endpoint: Admin - fim

app
  .listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3334,
  })
  .then(() => {
    console.log("HTTP Server Running");
  });
