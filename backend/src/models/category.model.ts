import { Field, GraphQLISODateTime, ID, ObjectType } from "type-graphql";
import { TransactionModel } from "./transaction.model";

@ObjectType()
export class CategoryModel {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  userId!: string;

  @Field(() => [TransactionModel], { nullable: true })
  transactions?: TransactionModel[];

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}