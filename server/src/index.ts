import { MikroORM } from '@mikro-orm/core';
import express from 'express';
import { ApolloServer }  from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createClient } from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import dotenv from 'dotenv';

import { __prod__ } from './constants';
import mikroConfig from './mikro-orm.config';
import { HelloResolver } from './resolvers/hello';
import { UserResolver } from './resolvers/user';
import { PostResolver } from './resolvers/post';
import { MyContext } from './types';

const main = async () => {
    dotenv.config();
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();

    const app = express();

    const corsOption = {
        origin: process.env.ORIGIN,
        credentials: true
    }

    app.use(cors(corsOption))

    const RedisStore = connectRedis(session);
    const redisClient = createClient({ legacyMode: true });
    redisClient.connect().catch(console.error);

    app.use(session({
        name: 'qid',
        store: new RedisStore({ 
            client: redisClient,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60,
            httpOnly: true,
            sameSite: 'none',
            secure: true
        },
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        resave: false
    }))

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, UserResolver, PostResolver],
            dateScalarMode: 'timestamp',
            validate: false,
        }),
        context: ({req, res}): MyContext => ({ em: orm.em, req, res })
    });
    await apolloServer.start()
    apolloServer.applyMiddleware({ app, cors: corsOption });
    app.set('trust proxy', true)
    
    app.get('/', (_, res) => {
        res.send("Hello world");
    })

    app.listen(5000, () => {
        console.log("server started on port 5000")
    });
}

main();

