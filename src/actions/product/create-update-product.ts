'use server';

import { Product, Size } from '@/interfaces';
import prisma from '@/lib/prisma';
import { Gender } from '@prisma/client';
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

  const productData = parsedProduct.data;
  productData.slug = productData.slug.toLowerCase().replace(/ /g, '-').trim();

  const { id, ...rest } = productData;

  const prismaTx = await prisma.$transaction(async () => {
    let product: Product;
    const tagsArray = rest.tags
      .split(',')
      .map((tag) => tag.trim().toLowerCase());

    if (id) {
      product = await prisma.product.update({
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
      product = await prisma.product.create({
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

    return { product };
  });

  // TODO: revalidate paths
  console.log(productData);

  return { ok: true };
}
