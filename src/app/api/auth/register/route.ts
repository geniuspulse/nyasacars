import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['SELLER', 'BUYER']).default('BUYER'),
    shopName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'SELLER' && (!data.shopName || data.shopName.trim() === '')) {
        return false;
      }
      return true;
    },
    {
      message: 'Shop name is required for seller registration',
      path: ['shopName'],
    }
  );

function generateShopSlug(shopName: string): string {
  const base = shopName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base || 'shop'}-${randomSuffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, phone, password, role, shopName } = validation.data;

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate slug if seller
    const shopSlug = role === 'SELLER' && shopName ? generateShopSlug(shopName) : null;

    // Create User and Seller if role is SELLER
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        password: hashedPassword,
        role,
        ...(role === 'SELLER' && shopName
          ? {
              seller: {
                create: {
                  shopName,
                  shopSlug: shopSlug!,
                  phone: phone || null,
                  plan: 'FREE',
                  adCredits: 0,
                },
              },
            }
          : {}),
      },
      include: {
        seller: true,
      },
    });

    // Exclude password from returned response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/auth/register:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
