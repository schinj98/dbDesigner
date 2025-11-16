import { v4 as uuidv4 } from 'uuid';

const createColumn = (name, type, constraints = {}) => ({
  id: uuidv4(),
  name,
  type,
  isPrimary: constraints.pk || false,
  isForeign: constraints.fk || false,
  isUnique: constraints.unique || false,
  isNullable: constraints.nullable !== false,
  defaultValue: constraints.default || null,
});

export const TEMPLATES = [
  {
    id: 'TPL-USER',
    label: 'User',
    description: 'Standard User Authentication table.',
    color: '#3b82f6', // Blue
    columns: [
      createColumn('id', 'INT', { pk: true, default: 'AUTO_INCREMENT' }),
      createColumn('username', 'VARCHAR(50)', { unique: true, nullable: false }),
      createColumn('email', 'VARCHAR(255)', { unique: true, nullable: false }),
      createColumn('password_hash', 'VARCHAR(255)', { nullable: false }),
      createColumn('created_at', 'TIMESTAMP', { default: 'CURRENT_TIMESTAMP' }),
    ],
  },
  {
    id: 'TPL-PRODUCT',
    label: 'Product',
    description: 'E-commerce Product catalog.',
    color: '#10b981', // Green
    columns: [
      createColumn('id', 'INT', { pk: true, default: 'AUTO_INCREMENT' }),
      createColumn('name', 'VARCHAR(255)', { nullable: false }),
      createColumn('price', 'DECIMAL(10, 2)', { nullable: false }),
      createColumn('description', 'TEXT'),
      createColumn('stock_quantity', 'INT', { default: 0 }),
    ],
  },
  {
    id: 'TPL-ORDER',
    label: 'Order',
    description: 'E-commerce Order history.',
    color: '#f97316', // Orange
    columns: [
      createColumn('id', 'INT', { pk: true, default: 'AUTO_INCREMENT' }),
      createColumn('user_id', 'INT', { fk: true, nullable: false }),
      createColumn('order_date', 'TIMESTAMP', { default: 'CURRENT_TIMESTAMP' }),
      createColumn('total_amount', 'DECIMAL(10, 2)', { nullable: false }),
      createColumn('status', 'VARCHAR(50)'),
    ],
  },
  {
    id: 'TPL-BLOGPOST',
    label: 'Blog Post',
    description: 'CMS content structure.',
    color: '#8b5cf6', // Purple
    columns: [
      createColumn('id', 'INT', { pk: true, default: 'AUTO_INCREMENT' }),
      createColumn('author_id', 'INT', { fk: true, nullable: false }),
      createColumn('title', 'VARCHAR(255)', { nullable: false }),
      createColumn('content', 'LONGTEXT'),
      createColumn('published_at', 'TIMESTAMP'),
      createColumn('slug', 'VARCHAR(255)', { unique: true }),
    ],
  },
];