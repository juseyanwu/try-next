import jwt from 'jsonwebtoken';
// 仅在服务器组件中导入
// import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// JWT密钥，在实际应用中应该存储在环境变量中
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWT过期时间
const JWT_EXPIRES_IN = '7d';

// 用户类型定义
export type User = {
  id: string;
  name: string;
  email: string;
};

// 生成JWT令牌
export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// 验证JWT令牌
export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User;
    return decoded;
  } catch (error) {
    return null;
  }
}

// 从请求中获取当前用户 (仅在服务器组件中使用)
// 注意：此函数使用了next/headers，只能在服务器组件中使用
export async function getCurrentUser(req?: NextRequest): Promise<User | null> {
  // 如果提供了请求对象，从请求中获取token
  if (req) {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return null;
    }
    return verifyToken(token);
  }
  
  // 在服务器组件中，可以使用以下代码获取token
  // 但需要在使用此函数的文件中导入cookies
  // const cookieStore = cookies();
  // const token = cookieStore.get('token')?.value;
  
  // 为避免在客户端组件中使用此函数，我们返回null
  // 客户端组件应该使用getClientUser函数
  return null;
}

// 客户端获取当前用户
export async function getClientUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    return null;
  }
}