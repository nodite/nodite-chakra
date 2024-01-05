import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';

import BaseModel from '@/components/base.model';

/**
 * TableSchema.
 */
export default {
  userId: {
    field: 'user_id',
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
  },
  nickname: {
    type: DataTypes.STRING(32),
  },
  email: {
    type: DataTypes.STRING(128),
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING(32),
  },
  sex: {
    type: DataTypes.TINYINT({ length: 1 }),
    defaultValue: 0,
    comment: '0 - secret, 1 - male, 2 - female.',
  },
  avatar: {
    type: DataTypes.STRING(255),
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  ...BaseModel.BaseSchema,
} as Record<string, ModelAttributeColumnOptions>;