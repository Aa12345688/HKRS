import { createHashRouter } from 'react-router';
import { Layout } from '../components/templates/Layout';
import { Inventory } from '../pages/Inventory';
import { Scan } from '../pages/Scan';
import { Settings } from '../pages/Settings';
import { BulkPrintPage } from '../pages/BulkPrint';
import { BarcodeTestPage } from '../pages/BarcodeTest';

export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Scan />,
      },
      {
        path: 'inventory',
        element: <Inventory />,
      },
      {
        path: 'scan',
        element: <Scan />,
      },
      {
        path: 'bulk-print',
        element: <BulkPrintPage />,
      },
      {
        path: 'barcode-test',
        element: <BarcodeTestPage />,
      },
      {
        path: 'settings',
        element: <Settings />,
      }
    ],
  },
], {
  basename: import.meta.env.BASE_URL || '/'
});