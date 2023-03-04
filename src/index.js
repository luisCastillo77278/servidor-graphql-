const { ApolloServer, gql, UserInputError } = require('apollo-server')
const persons = require('./mocks/persons.js')
const { v4: uuid } = require('uuid')

const typeDefs = gql`
  enum YesNo {
    YES
    NO
  }

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
    allPersons(phone: YesNo): [Person!]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(

    ): Person
  }

`

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: (_, args) => {
      if (!args.phone) {
        return persons
      }

      const byPhone = (person) => args.phone === 'YES' ? person.phone : !person.phone
      return persons.filter(byPhone)
    },
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
