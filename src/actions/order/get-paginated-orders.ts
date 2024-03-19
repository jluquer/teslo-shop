'use server';

import { auth } from '@/auth.config';
import prisma from '@/lib/prisma';

// TODO: implement pagination
export const getPaginatedOrders = async () => {
  const session = await auth();

  if (session?.user?.role !== 'admin') {
    return {
      ok: false,
      message: 'El usuario no esta logueado o no tiene suficientes permisos',
    };
  }

  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      OrderAddress: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return {
    ok: true,
    orders: orders,
  };
};
