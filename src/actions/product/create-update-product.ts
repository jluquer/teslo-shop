'use server';

import { Size } from '@/interfaces';
import prisma from '@/lib/prisma';
import { Gender, Product } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config(process.env.CLOUDINARY_URL ?? '');

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

      const imagesToUpload = formData.getAll('images') as File[];
      if (imagesToUpload) {
        const images = await uploadImages(imagesToUpload);
        console.log({ imagesToUpload, images });
        if (!images)
          throw new Error('No se pudo cargar las imágenes, rolling back');
        await prisma.productImage.createMany({
          data: images.map((img) => ({
            url: img!,
            productId: product.id!,
          })),
        });
      }

      return { product: txProduct };
    });

    revalidatePath('/admin/products');
    revalidatePath(`/admin/product/${product.slug}`);
    revalidatePath(`/product/${product.slug}`);

    return { ok: true, product: prismaTx.product };
  } catch (error) {
    return { ok: false, message: 'No se pudo actualizar / crear' };
  }
}

async function uploadImages(imagesToUpload: File[]) {
  try {
    const uploadImgPromises = imagesToUpload.map(async (img) => {
      const buffer = await img.arrayBuffer();
      const base64Img = Buffer.from(buffer).toString('base64');
      return cloudinary.uploader
        .upload(`data:image/png;base64,${base64Img}`, {
          folder: 'product-images',
        })
        .then((res) => res.secure_url);
    });
    return await Promise.all(uploadImgPromises);
  } catch (error) {
    console.log(error);
    return null;
  }
}
