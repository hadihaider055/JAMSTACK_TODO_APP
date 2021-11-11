const { ApolloServer, gql } = require("apollo-server-lambda");
var faunadb = require("faunadb"),
  q = faunadb.query;

const typeDefs = gql`
  type Query {
    todos: [Todo!]
  }
  type Mutation {
    addTodo(task: String!): Todo
    isDone(id: ID!, isCompleted: Boolean!): Todo
  }
  type Todo {
    id: ID!
    task: String!
    isCompleted: Boolean!
  }
`;

const resolvers = {
  Query: {
    todos: async (root, args, context) => {
      try {
        var adminClient = new faunadb.Client({
          secret: process.env.FAUNADB_SERVER_SECRET,
        });
        const result = await adminClient.query(
          q.Map(
            q.Paginate(q.Match(q.Index("todos"))),
            q.Lambda((x) => q.Get(x))
          )
        );
        return result.data.map((item) => {
          return {
            id: item.ref.id,
            task: item.data.task,
            isCompleted: item.data.isCompleted,
          };
        });
      } catch (err) {
        console.log(err);
      }
    },
  },
  Mutation: {
    addTodo: async (_, { task }) => {
      try {
        var adminClient = new faunadb.Client({
          secret: process.env.FAUNADB_SERVER_SECRET,
        });
        const result = await adminClient.query(
          q.Create(q.Collection("todos"), {
            data: {
              task: task,
              isCompleted: false,
            },
          })
        );
      } catch (err) {
        console.log(err);
      }
    },
    isDone: async (_, { id, isCompleted }) => {
      try {
        var adminClient = new faunadb.Client({
          secret: process.env.FAUNADB_SERVER_SECRET,
        });
        const result = await adminClient.query(
          q.Update(q.Ref(q.Collection("todos"), id), {
            data: {
              isCompleted: !isCompleted,
            },
          })
        );
      } catch (err) {
        console.log(err);
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const apolloHandler = server.createHandler();
exports.handler = (event, context, ...args) => {
  return apolloHandler(
    {
      ...event,
      requestContext: context,
    },
    context,
    ...args
  );
};
