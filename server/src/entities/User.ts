import { Entity, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';
import 'reflect-metadata';
import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class User {
    [OptionalProps]?: 'createdAt' | 'updatedAt';

    @Field(() => ID)
    @PrimaryKey()
    id!: number;

    @Field()
    @Property({ type: 'date' })
    createdAt:Date = new Date();

    @Field()
    @Property({ type: 'date', onUpdate: () => new Date() })
    updatedAt:Date = new Date();

    @Field()
    @Property({ type: 'text', unique: true })
    username!: string;

    @Property({ type: 'text' })
    password!: string;


}