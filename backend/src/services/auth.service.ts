import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { UserCreateDTO, UserLoginDTO, AuthResponse } from '../types';

export class AuthService {
  // Registrar novo usuário
  static async register(userData: UserCreateDTO): Promise<AuthResponse> {
    try {
      // Limpar CPF (remover pontos, traços, espaços)
      const cpfLimpo = userData.cpf.replace(/[.\-\s]/g, '');

      // 1. Verificar se CPF já existe
      const { data: existingUserByCPF } = await supabase
        .from('users')
        .select('id')
        .eq('cpf', cpfLimpo)
        .single();

      if (existingUserByCPF) {
        throw {
          statusCode: 400,
          message: 'CPF já cadastrado',
        };
      }

      // 2. Verificar se email já existe
      const { data: existingUserByEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUserByEmail) {
        throw {
          statusCode: 400,
          message: 'Email já cadastrado',
        };
      }

      // 3. Verificar se WhatsApp já existe (se fornecido)
      if (userData.whatsapp) {
        const { data: existingUserByWhatsApp } = await supabase
          .from('users')
          .select('id')
          .eq('whatsapp', userData.whatsapp)
          .single();

        if (existingUserByWhatsApp) {
          throw {
            statusCode: 400,
            message: 'WhatsApp já cadastrado',
          };
        }
      }

      // 4. Hash da senha (criptografar)
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // 5. Criar usuário no banco
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([
          {
            cpf: cpfLimpo,
            email: userData.email,
            password_hash: passwordHash,
            nome: userData.nome,
            whatsapp: userData.whatsapp || null,
            ativo: true,
          },
        ])
        .select('id, email, nome, cpf, ativo, data_criacao')
        .single();

      if (error) {
        console.error('Erro ao criar usuário:', error);
        throw {
          statusCode: 500,
          message: 'Erro ao criar usuário',
        };
      }

      // 6. Gerar token JWT
      const token = this.generateToken({
        id: newUser.id,
        email: newUser.email,
        nome: newUser.nome,
      });

      // 7. Retornar usuário e token
      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          nome: newUser.nome,
        },
        token,
      };
    } catch (error: any) {
      throw error;
    }
  }

  // Login de usuário
  static async login(credentials: UserLoginDTO): Promise<AuthResponse> {
    try {
      // 1. Buscar usuário por email
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, nome, password_hash, ativo')
        .eq('email', credentials.email)
        .single();

      if (error || !user) {
        throw {
          statusCode: 401,
          message: 'Email ou senha inválidos',
        };
      }

      // 2. Verificar se usuário está ativo
      if (!user.ativo) {
        throw {
          statusCode: 403,
          message: 'Usuário desativado',
        };
      }

      // 3. Comparar senha (hash)
      const passwordMatch = await bcrypt.compare(
        credentials.password,
        user.password_hash
      );

      if (!passwordMatch) {
        throw {
          statusCode: 401,
          message: 'Email ou senha inválidos',
        };
      }

      // 4. Gerar token JWT
      const token = this.generateToken({
        id: user.id,
        email: user.email,
        nome: user.nome,
      });

      // 5. Retornar usuário e token
      return {
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
        },
        token,
      };
    } catch (error: any) {
      throw error;
    }
  }

  // Gerar token JWT
  private static generateToken(payload: { id: string; email: string; nome: string }): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET não configurado no .env');
    }

    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }

  // Verificar token JWT
  static verifyToken(token: string): any {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET não configurado no .env');
    }

    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw {
        statusCode: 401,
        message: 'Token inválido ou expirado',
      };
    }
  }
}