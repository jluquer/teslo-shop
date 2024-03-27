'use server';

import { Product, Size } from '@/interfaces';
import prisma from '@/lib/prisma';
import { Gender } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const productSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  title: z.string().min(3).max(255),
  slug: z.string().min(3).max(255),
  description: z.string(),
  price: z.coerce
    .number()
    .min(0)
    .transform((val) => Number(val.toFixed(2))),
  inStock: z.coerce
    .number()
    .min(0)
    .transform((val) => Number(val.toFixed(0))),
  categoryId: z.string().uuid(),
  sizes: z.coerce.string().transform((val) => val.split(',')),
  tags: z.string(),
  gender: z.nativeEnum(Gender),
});

export async function createUpdateProduct(formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsedProduct = productSchema.safeParse(data);

  if (!parsedProduct.success) {
    console.log(parsedProduct.error);
    return { ok: false };
  }

  const product = parsedProduct.data;
  product.slug = product.slug.toLowerCase().replace(/ /g, '-').trim();

  const { id, ...rest } = product;

  try {
    const prismaTx = await prisma.$transaction(async () => {
      let txProduct: Product;
      const tagsArray = rest.tags
        .split(',')
        .map((tag) => tag.trim().toLowerCase());

      if (id) {
        txProduct = await prisma.product.update({
          where: { id },
          data: {
            ...rest,
            sizes: {
              set: rest.sizes as Size[],
            },
            tags: {
              set: tagsArray,
            },
          },
        });
      } else {
        txProduct = await prisma.product.create({
          data: {
            ...rest,
            sizes: {
              set: rest.sizes as Size[],
            },
            tags: {
              set: tagsArray,
            },
          },
        });
      }

      revalidatePath('/admin/products');
      revalidatePath(`/admin/product/${product.slug}`);
      revalidatePath(`/product/${product.slug}`);

      return { product: txProduct };
    });

    return { ok: true, product: prismaTx.product };
  } catch (error) {
    return { ok: false, message: 'No se pudo actualizar / crear' };
  }
}
