import { FastifyInstance } from "fastify";
import { NfeUseCase } from "../usecases/nfe.usecase";
import { NotaFiscal, NotaFiscalCreate, NotaFiscalGet } from "../intefaces/nota-fiscal.interface";

export async function notaFiscalRoutes(fastify: FastifyInstance){
    const nfeUseCase = new NfeUseCase();
    fastify.post< {Body: NotaFiscalCreate} >('/', (req, reply)=>{
        const {Codigo, CodigoVenda} = req.body

        try {
            const data  = nfeUseCase.create({
                Codigo,
                CodigoVenda,
            });
            return reply.send(data);
        } catch (error) {
            reply.send(error)
        }  
    });
    fastify.get<{Body: NotaFiscalGet}>('/', (req, reply)=> {
        const {CodigoVenda} = req.body
        try {
            const data = nfeUseCase.get({
                CodigoVenda,
            });
            return reply.send(data);
        } catch (error) {
            reply.send(error)
        }   
    })
}