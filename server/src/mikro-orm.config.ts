import { Options } from '@mikro-orm/core'
import dotenv from 'dotenv';

import { __prod__ } from './constants';
import { Post } from './entities/Post';
import path from 'path';
import { User } from './entities/User';

dotenv.config();
const config: Options = {
    migrations: {
        path: path.join(__dirname, './migrations'),
        glob: '!(*.d).{js,ts}',
    },
    entities: [Post, User],
    dbName: 'enboard',
    type: 'postgresql',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    debug: !__prod__,
}

export default config;