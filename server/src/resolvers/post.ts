import { Resolver, Query, Ctx, Arg, ID, Mutation } from 'type-graphql';
import { RequestContext } from '@mikro-orm/core';

import { MyContext } from 'src/types';
import { Post } from '../entities/Post'

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(@Ctx() { em }: MyContext): Promise<Post[]> {
        let retVal: Promise<Post[]>;
        retVal = Promise.resolve([]);
        await RequestContext.createAsync(em, async () => {
            retVal = em.find(Post, {})

        });
        return retVal;
    }

    @Query(() => Post, { nullable: true })
    async post(
        @Arg('id', () => ID) id: number, 
        @Ctx() { em }: MyContext
    ): Promise<Post> {
        let retVal: Promise<Post>;
        retVal = null;
        await RequestContext.createAsync(em, async () => {
            retVal = em.findOne(Post, { id })
        });
        return retVal;
    }

    @Mutation(() => Post)
    async createPost(
        @Arg('title', () => String) title: string,
        @Ctx() { em }: MyContext
    ): Promise<Post> {
        let retVal: Promise<Post>;
        retVal = null;
        await RequestContext.createAsync(em, async () => {
            const post = em.create(Post, { title });
            await em.persistAndFlush(post);
            retVal = Promise.resolve(post);
        });
        return retVal;
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('id', () => ID) id: number, 
        @Arg('title', () => String, { nullable: true }) title: string,  
        @Ctx() { em }: MyContext
    ): Promise<Post> {
        let retVal: Promise<Post>;
        retVal = null;
        await RequestContext.createAsync(em, async () => {
            const post = await em.findOne(Post, { id });
            if (!post) {retVal = null}

            if (typeof title !== 'undefined') {
                post.title = title;
                post.updatedAt = new Date();
                await em.persistAndFlush(post);
                retVal = Promise.resolve(post);
            }
        });
        return retVal;
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id', () => ID) id: number, 
        @Ctx() { em }: MyContext
    ): Promise<boolean> {
        let retVal: Promise<boolean> = Promise.resolve(false);
        await RequestContext.createAsync(em, async () => {
            try {
                await em.nativeDelete(Post, { id });
                retVal = Promise.resolve(true);
            } catch (error) {}
        });
        return retVal;
    }
}