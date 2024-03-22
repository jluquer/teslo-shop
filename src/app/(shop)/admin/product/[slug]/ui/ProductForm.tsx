'use client';

import { Product } from '@/interfaces';
import { Category, ProductImage } from '@prisma/client';
import { useForm } from 'react-hook-form';
import Image from 'next/image';

interface Props {
  product: Product & { ProductImage?: ProductImage[] };
  categories: Category[];
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface FormInputs {
  title: string;
  slug: string;
  description: string;
  price: number;
  inStock: number;
  sizes: string[];
  categoryId: string;
  tags: string;
  gender: 'men' | 'women' | 'kid' | 'unisex';
}

export const ProductForm = ({ product, categories }: Props) => {
  const {
    handleSubmit,
    register,
    formState: { isValid },
  } = useForm<FormInputs>({
    defaultValues: {
      ...product,
      tags: product.tags.join(', '),
      sizes: product.sizes ?? [],
    },
  });

  const onSubmit = async (data: FormInputs) => {
    console.log({ data, isValid });
  };

  return (
    <form
      className='mb-16 grid grid-cols-1 gap-3 px-5 sm:grid-cols-2 sm:px-0'
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Textos */}
      <div className='w-full'>
        <div className='mb-2 flex flex-col'>
          <span>Título</span>
          <input
            type='text'
            className='rounded-md border bg-gray-200 p-2'
            {...register('title', { required: true })}
          />
        </div>

        <div className='mb-2 flex flex-col'>
          <span>Slug</span>
          <input
            type='text'
            className='rounded-md border bg-gray-200 p-2'
            {...register('slug', { required: true })}
          />
        </div>

        <div className='mb-2 flex flex-col'>
          <span>Descripción</span>
          <textarea
            rows={5}
            className='rounded-md border bg-gray-200 p-2'
            {...register('description', { required: true })}
          ></textarea>
        </div>

        <div className='mb-2 flex flex-col'>
          <span>Price</span>
          <input
            type='number'
            className='rounded-md border bg-gray-200 p-2'
            {...register('price', { required: true, min: 0 })}
          />
        </div>

        <div className='mb-2 flex flex-col'>
          <span>Tags</span>
          <input
            type='text'
            className='rounded-md border bg-gray-200 p-2'
            {...register('tags', { required: true })}
          />
        </div>

        <div className='mb-2 flex flex-col'>
          <span>Gender</span>
          <select
            className='rounded-md border bg-gray-200 p-2'
            {...register('gender', { required: true })}
          >
            <option value=''>[Seleccione]</option>
            <option value='men'>Men</option>
            <option value='women'>Women</option>
            <option value='kid'>Kid</option>
            <option value='unisex'>Unisex</option>
          </select>
        </div>

        <div className='mb-2 flex flex-col'>
          <span>Categoria</span>
          <select
            className='rounded-md border bg-gray-200 p-2'
            {...register('categoryId', { required: true })}
          >
            <option value=''>[Seleccione]</option>
            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <button className='btn-primary w-full'>Guardar</button>
      </div>

      {/* Selector de tallas y fotos */}
      <div className='w-full'>
        {/* As checkboxes */}
        <div className='flex flex-col'>
          <span>Tallas</span>
          <div className='flex flex-wrap'>
            {sizes.map((size) => (
              // bg-blue-500 text-white <--- si está seleccionado
              <div
                key={size}
                className='mr-2  flex h-10 w-10 items-center justify-center rounded-md border'
              >
                <span>{size}</span>
              </div>
            ))}
          </div>

          <div className='mb-2 flex flex-col'>
            <span>Fotos</span>
            <input
              type='file'
              multiple
              className='rounded-md border bg-gray-200 p-2'
              accept='image/png, image/jpeg'
            />
          </div>
          <div className='grid grid-cols-1 gap-3 lg:grid-cols-3'>
            {product.ProductImage?.map((image) => (
              <div key={image.id}>
                <Image
                  alt={product.title ?? ''}
                  src={`/products/${image.url}`}
                  width={300}
                  height={300}
                  className='rounded-t shadow-md'
                />
                <button
                  type='button'
                  className='btn-danger lg:w-300 w-full rounded-b'
                  onClick={() => console.log(image.id, image.url)}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
};
