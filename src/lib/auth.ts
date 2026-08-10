import { NextAuthOptions } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role?: string;
    sellerId?: string | null;
  }
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role?: string;
      sellerId?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.sellerId = token.sellerId as string | null;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.sellerId = user.sellerId;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
};
