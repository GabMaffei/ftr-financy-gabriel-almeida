import cors from 'cors'
import 'dotenv/config'
import 'reflect-metadata'
import express from "express"
import { ApolloServer } from "@apollo/server"
import { buildSchema, Resolver } from "type-graphql"
import { expressMiddleware } from "@as-integrations/express5"
import { buildContext } from './graphql/context/index'
import { AuthResolver } from './resolvers/auth.resolver'
import { CategoryResolver } from './resolvers/category.resolver'
import { TransactionResolver } from './resolvers/transaction.resolver'

async function bootstrap() {
    const app = express()

    app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true
    })) 

    const schema = await buildSchema({
        resolvers: [
            AuthResolver, CategoryResolver, TransactionResolver
        ],
        validate: false,
        emitSchemaFile: './schema.graphql'
    })

    const server = new ApolloServer({
        schema
    })

    await server.start()

    app.use('/graphql', express.json(), expressMiddleware(server, {
        context: buildContext
    }))

    app.listen(4000, () => {
        console.log('🚀 Financy Server rodando em http://localhost:4000/graphql')
    })
}

bootstrap()