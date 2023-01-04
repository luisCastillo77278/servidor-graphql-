const { ApolloServer, gql, UserInputError } = require('apollo-server')
const persons = require('./mocks/persons.js')
const { v4: uuid } = require('uuid')

const typeDefs = gql`
  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons: [Person!]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
  }

`

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (_, args) =>
      persons.find(p => p.name === args.name)
  },
  Person: {
    address: (root) => ({
      street: root.street,
      city: root.city
    })
  },
  Mutation: {
    addPerson: (_, args) => {
      if (persons.find(p => p.name === args.name)) {
        throw new UserInputError('Name must be unique', {
          invalidArgs: args.name
        })
      }

      const person = { ...args, id: uuid() }
      persons.push(person)
      return person
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.listen()
  .then(({ url }) => {
    console.log(`Server ready at ${url}`)
  })
