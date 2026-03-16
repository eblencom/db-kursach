import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDb, sql } from './db';
import { mockUsers } from './mock-data';

const USE_MOCK = process.env.USE_MOCK_DATA === 'true' || !process.env.DB_SERVER;

const DEMO_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

// In-memory store for users registered in mock mode (lost on restart)
const mockRegisteredUsers: Array<{
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
}> = [];

async function getUserByEmail(email: string): Promise<{
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
} | null> {
  if (!USE_MOCK) {
    try {
      const pool = await getDb();
      const result = await pool
        .request()
        .input('email', sql.NVarChar(255), email.trim().toLowerCase())
        .query(
          `SELECT u.id, u.email, u.password_hash, u.full_name, r.name as role
           FROM Users u
           JOIN Roles r ON u.role_id = r.id
           WHERE u.email = @email`
        );
      const rows = result.recordset as Record<string, unknown>[];
      if (rows.length === 0) return null;
      const row = rows[0];
      return {
        id: row.id as number,
        email: row.email as string,
        password_hash: row.password_hash as string,
        full_name: row.full_name as string,
        role: row.role as string,
      };
    } catch {
      return null;
    }
  }

  const fromStatic = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (fromStatic) {
    return {
      ...fromStatic,
      password_hash: DEMO_PASSWORD_HASH,
    };
  }
  const fromRegistered = mockRegisteredUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  return fromRegistered || null;
}

export async function registerUser(
  email: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; error?: string }> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = fullName.trim();

  if (!trimmedEmail || !password || !trimmedName) {
    return { success: false, error: 'Заполните все поля' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Пароль должен быть не менее 6 символов' };
  }

  const existing = await getUserByEmail(trimmedEmail);
  if (existing) {
    return { success: false, error: 'Пользователь с таким email уже существует' };
  }

  const password_hash = await bcrypt.hash(password, 10);

  if (!USE_MOCK) {
    try {
      const pool = await getDb();
      await pool
        .request()
        .input('email', sql.NVarChar(255), trimmedEmail)
        .input('password_hash', sql.NVarChar(255), password_hash)
        .input('full_name', sql.NVarChar(255), trimmedName)
        .query(
          `INSERT INTO Users (email, password_hash, full_name, role_id) 
           VALUES (@email, @password_hash, @full_name, 2)`
        );
      return { success: true };
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, error: 'Ошибка при регистрации' };
    }
  }

  mockRegisteredUsers.push({
    id: 1000 + mockRegisteredUsers.length,
    email: trimmedEmail,
    password_hash,
    full_name: trimmedName,
    role: 'analyst',
  });
  return { success: true };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await getUserByEmail(credentials.email);
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) return null;
        return {
          id: String(user.id),
          email: user.email,
          name: user.full_name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
