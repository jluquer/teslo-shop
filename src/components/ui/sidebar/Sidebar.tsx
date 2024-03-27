'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import {
  IoCloseOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoSearchOutline,
  IoShirtOutline,
  IoTicketOutline,
} from 'react-icons/io5';

import { useUIStore } from '@/store';
import { logout } from '@/actions';

export const Sidebar = () => {
  const isSideMenuOpen = useUIStore((state) => state.isSideMenuOpen);
  const closeMenu = useUIStore((state) => state.closeSideMenu);

  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user.role === 'admin';

  return (
    <div>
      {/* Background black */}
      {isSideMenuOpen && (
        <div className='fixed left-0 top-0 z-10 h-screen w-screen bg-black opacity-30' />
      )}

      {/* Blur */}
      {isSideMenuOpen && (
        <div
          onClick={closeMenu}
          className='fade-in fixed left-0 top-0 z-10 h-screen w-screen backdrop-blur-sm backdrop-filter'
        />
      )}

      {/* Sidemenu */}
      <nav
        className={clsx(
          'fixed right-0 top-0 z-20 h-screen w-[500px] transform bg-white p-5 shadow-2xl transition-all duration-300',
          {
            'translate-x-full': !isSideMenuOpen,
          },
        )}
      >
        <IoCloseOutline
          size={50}
          className='absolute right-5 top-5 cursor-pointer'
          onClick={() => closeMenu()}
        />

        {/* Input */}
        <div className='relative mt-14'>
          <IoSearchOutline
            size={20}
            className='absolute left-2 top-2'
          />
          <input
            type='text'
            placeholder='Buscar'
            className='w-full rounded border-b-2 border-gray-200 bg-gray-50 py-1 pl-10 pr-10 text-xl focus:border-blue-500 focus:outline-none'
          />
        </div>

        {/* Menú */}

        {isAuthenticated && (
          <>
            <Link
              href='/profile'
              onClick={() => closeMenu()}
              className='mt-10 flex items-center rounded p-2 transition-all hover:bg-gray-100'
            >
              <IoPersonOutline size={30} />
              <span className='ml-3 text-xl'>Perfil</span>
            </Link>

            <Link
              href='/orders'
              onClick={() => closeMenu()}
              className='mt-10 flex items-center rounded p-2 transition-all hover:bg-gray-100'
            >
              <IoTicketOutline size={30} />
              <span className='ml-3 text-xl'>Ordenes</span>
            </Link>
          </>
        )}

        {isAuthenticated && (
          <button
            className='mt-10 flex w-full items-center rounded p-2 transition-all hover:bg-gray-100'
            onClick={() => logout()}
          >
            <IoLogOutOutline size={30} />
            <span className='ml-3 text-xl'>Salir</span>
          </button>
        )}

        {!isAuthenticated && (
          <Link
            href='/auth/login'
            className='mt-10 flex items-center rounded p-2 transition-all hover:bg-gray-100'
            onClick={() => closeMenu()}
          >
            <IoLogInOutline size={30} />
            <span className='ml-3 text-xl'>Ingresar</span>
          </Link>
        )}

        {isAdmin && (
          <>
            {/* Line Separator */}
            <div className='my-10 h-px w-full bg-gray-200' />

            <Link
              href='/admin/products'
              className='mt-10 flex items-center rounded p-2 transition-all hover:bg-gray-100'
              onClick={() => closeMenu()}
            >
              <IoShirtOutline size={30} />
              <span className='ml-3 text-xl'>Productos</span>
            </Link>

            <Link
              href='/admin/orders'
              onClick={() => closeMenu()}
              className='mt-10 flex items-center rounded p-2 transition-all hover:bg-gray-100'
            >
              <IoTicketOutline size={30} />
              <span className='ml-3 text-xl'>Ordenes</span>
            </Link>

            <Link
              href='/admin/users'
              className='mt-10 flex items-center rounded p-2 transition-all hover:bg-gray-100'
              onClick={() => closeMenu()}
            >
              <IoPeopleOutline size={30} />
              <span className='ml-3 text-xl'>Usuarios</span>
            </Link>
          </>
        )}
      </nav>
    </div>
  );
};
