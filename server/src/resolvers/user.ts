import { Resolver, Query, Ctx, Arg, Mutation, Field, InputType, ObjectType } from 'type-graphql';
import { RequestContext } from '@mikro-orm/core';
import argon2 from 'argon2';

import { MyContext } from 'src/types';
import { User } from '../entities/User'

@InputType()
class UserCredentials {
    @Field()
    username: string;

    @Field()
    password: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {

    @Query(() => User, { nullable: true })
    async logged(
        @Ctx() { req, em }: MyContext
    ) {
        console.log(req.session.userId)
        if (!req.session.userId) {
            return null;
        }
        return await RequestContext.createAsync(em, async() => {
            return await em.findOne(User, { id: req.session.userId });
        })
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('credentials') credentials: UserCredentials,
        @Ctx() { em, req }: MyContext,
    ) {
        return await RequestContext.createAsync(em, async () => {
            let retVal: UserResponse = null;

            if (credentials.username.length <= 2) {
                retVal = {
                    errors: [{
                        field: 'username',
                        message: 'Username must have at least 3 characters'
                    }]
                }
                return retVal;
            };

            if (credentials.password.length <= 5) {
                retVal = {
                    errors: [{
                        field: 'password',
                        message: 'Password must have at least 6 characters'
                    }]
                }
                return retVal;
            };

            const hashedPassword = await argon2.hash(credentials.password);
            const user = em.create(User, {
                username: credentials.username,
                password: hashedPassword
            });
            try {
                await em.persistAndFlush(user);
            } catch (err) {
                // If user is already existed
                if (err.code === '23505') {
                    retVal = {
                        errors: [{
                            field: 'username',
                            message: 'Username already exists'
                        }]
                    }
                }
                return retVal;
            }

            // If successful, store to cookie
            req.session.userId = user.id;

            retVal = { user };
            return retVal;
        });
    }

    @Query(() => UserResponse)
    async login(
        @Arg('credentials') credentials: UserCredentials,
        @Ctx() { em, req }: MyContext,
    ) {
        return await RequestContext.createAsync(em, async () => {
            let retVal: UserResponse = null
            const user = em.findOne(User, { username: credentials.username });
            if (!user) {
                retVal = {
                    errors: [
                        {
                            field: "username",
                            message: "Username not found"
                        }
                    ]
                }
                return retVal;
            }
            
            const valid = await argon2.verify((await user).password, credentials.password);
            if (!valid) {
                retVal = {
                    errors: [
                        {
                            field: "password",
                            message: "Incorrect password"
                        }
                    ]
                }
                return retVal;
            }

            req.session.userId = (await user).id;
            retVal = { user: (await user) };
            return retVal
        });
    }
}