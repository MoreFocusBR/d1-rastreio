"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notaFiscalRoutes = void 0;
const nfe_usecase_1 = require("../usecases/nfe.usecase");
async function notaFiscalRoutes(fastify) {
    const nfeUseCase = new nfe_usecase_1.NfeUseCase();
    fastify.post('/', (req, reply) => {
        const { Codigo, CodigoVenda } = req.body;
        try {
            const data = nfeUseCase.create({
                Codigo,
                CodigoVenda,
            });
            return reply.send(data);
        }
        catch (error) {
            reply.send(error);
        }
    });
    fastify.get('/', (req, reply) => {
        const { CodigoVenda } = req.body;
        try {
            const data = nfeUseCase.get({
                CodigoVenda,
            });
            return reply.send(data);
        }
        catch (error) {
            reply.send(error);
        }
    });
}
exports.notaFiscalRoutes = notaFiscalRoutes;
