import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { typeDefs } from '@/lib/graphql/schema';
import { resolvers } from '@/lib/graphql/resolvers';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  plugins: [
    {
      requestDidStart() {
        return {
          didResolveOperation(requestContext) {
            // Log GraphQL operations for monitoring
            console.log(`GraphQL Operation: ${requestContext.request.operationName}`);
          },
        };
      },
    },
  ],
});

const handler = startServerAndCreateNextHandler(server);

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}

// Context function for GraphQL
async function createContext(request: NextRequest) {
  // Get token from Authorization header
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  let user = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          organization: true,
        },
      });
    } catch (error) {
      // Invalid token
      console.error('Invalid JWT token:', error);
    }
  }

  return {
    user,
    prisma,
  };
}
