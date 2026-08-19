import React, { memo } from 'react';
import LoginExample from '../components/LoginExample';
import ThemeToggle from '../components/ThemeToggle';
import CartExample from '../components/CartExample';

const ReduxDemo = memo(() => {
  return (
    <div className='min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors'>
      <div className='bg-white dark:bg-gray-800 shadow-sm'>
        <div className='container mx-auto px-4 py-4 flex justify-between items-center'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Redux Toolkit Demo
          </h1>
          <ThemeToggle />
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        <div className='bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-8'>
          <h2 className='text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2'>
            Redux Successfully Setup!
          </h2>
          <p className='text-blue-800 dark:text-blue-200 mb-3'>
            This page contains three Redux examples:
          </p>
          <ul className='list-disc list-inside text-blue-800 dark:text-blue-200 space-y-1'>
            <li>
              <strong>Theme Toggle:</strong> Top right - Dark/Light mode
            </li>
            <li>
              <strong>Authentication:</strong> Login/Logout system
            </li>
            <li>
              <strong>Shopping Cart:</strong> Product add, remove, quantity
              management
            </li>
          </ul>
          <p className='text-blue-700 dark:text-blue-300 mt-4 text-sm'>
            <strong>Tip:</strong> Install Redux DevTools browser extension to
            view store data
          </p>
        </div>

        <div className='mb-8'>
          <LoginExample />
        </div>

        <div>
          <CartExample />
        </div>

        <div className='mt-8 bg-white dark:bg-gray-800 rounded-lg p-6'>
          <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
            How to use:
          </h3>

          <div className='space-y-4'>
            <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded'>
              <p className='font-semibold text-gray-900 dark:text-white mb-2'>
                1. Read data from Redux:
              </p>
              <code className='text-sm text-[#F48525] dark:text-[#F48525]'>
                const user = useSelector(selectUser);
              </code>
            </div>

            <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded'>
              <p className='font-semibold text-gray-900 dark:text-white mb-2'>
                2. Dispatch actions to Redux:
              </p>
              <code className='text-sm text-[#F48525] dark:text-[#F48525]'>
                dispatch(loginSuccess(userData));
              </code>
            </div>

            <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded'>
              <p className='font-semibold text-gray-900 dark:text-white mb-2'>
                3. Access from any component:
              </p>
              <code className='text-sm text-[#F48525] dark:text-[#F48525]'>
                import {'{ useSelector, useDispatch }'} from 'react-redux';
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ReduxDemo.displayName = 'ReduxDemo';

export default ReduxDemo;
