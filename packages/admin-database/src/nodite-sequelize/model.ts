import { logger } from '@nodite-light/admin-core';
import httpContext from 'express-http-context';
import _forEach from 'lodash/forEach';
import _get from 'lodash/get';
import _omit from 'lodash/omit';
import _set from 'lodash/set';
import { ModelOptions, ModelStatic, Op, ValidationError } from 'sequelize';
import {
  AllowNull,
  BeforeBulkCreate,
  BeforeBulkDestroy,
  BeforeBulkUpdate,
  BeforeCreate,
  BeforeDestroy,
  BeforeUpdate,
  Column,
  Comment,
  CreatedAt,
  DataType,
  Default,
  Model,
  UpdatedAt,
} from 'sequelize-typescript';

import { FindOptions, Pagination } from '@/nodite-sequelize/interface';

/**
 * Class BaseModel.
 */
export default abstract class BaseModel<T extends Model<T>> extends Model<T> {
  /**
   * TableInitOptions.
   */
  static readonly TableOptions = {
    omitNull: true,
    underscored: true,
    timestamps: true,
    scopes: {
      available: {
        where: {
          status: { [Op.gt]: 0 },
          deleted: [0, 9],
        },
      },
    },
  } as ModelOptions;

  @Default(1)
  @AllowNull(false)
  @Comment('0: disabled, 1: enabled')
  @Column(DataType.TINYINT({ length: 1 }))
  status: 0 | 1;

  @Default(0)
  @AllowNull(false)
  @Comment('0: normal, 1: soft deleted, 9: not allow delete')
  @Column(DataType.TINYINT({ length: 1 }))
  deleted: 0 | 1 | 9;

  @Column({ field: 'create_by', type: DataType.STRING(32) })
  createBy: string;

  @CreatedAt
  @Column({ field: 'create_time', type: DataType.DATE })
  createTime: Date;

  @Column({ field: 'update_by', type: DataType.STRING(32) })
  updateBy: string;

  @UpdatedAt
  @Column({ field: 'update_time', type: DataType.DATE })
  updateTime: Date;

  /**
   * Not allow delete.
   * @param instance
   */
  @BeforeDestroy
  static notAllowDeleteNine(instance: BaseModel<never>): void {
    if (instance.previous('deleted') === 9) {
      throw new ValidationError('Not allow delete!', []);
    }
  }

  /**
   * Deleted not equal 9.
   * @param options
   */
  @BeforeBulkDestroy
  static deletedNotEqualNine(options: FindOptions): void {
    const deleted = _get(options, 'where.deleted', {});
    _set(options, 'where.deleted', { ...deleted, [Op.ne]: 9 });
  }

  /**
   * Set create by.
   * @param instance
   */
  @BeforeCreate
  static setCreateBy(instance: BaseModel<never>): void {
    instance.setDataValue(
      'createBy',
      instance.getDataValue('createBy') ||
        (_get(httpContext.get('user'), 'username', 'unknown') as never),
    );
  }

  /**
   * Bulk set create by.
   * @param instances
   */
  @BeforeBulkCreate
  static bulkSetCreateBy(instances: BaseModel<never>[]): void {
    instances.forEach((instance) => this.setCreateBy(instance));
  }

  /**
   * Set update by.
   * @param instance
   */
  @BeforeUpdate
  static setUpdateBy(instance: BaseModel<never>): void {
    instance.setDataValue('updateBy', this.getUpdateBy() as never);
  }

  /**
   * Bulk set update by.
   * @param options
   * @returns
   */
  @BeforeBulkUpdate
  static bulkSetUpdateBy(options: FindOptions): void {
    const { attributes } = options;
    if (!attributes) return;
    _set(options, 'attributes.updateBy', this.getUpdateBy());
  }

  /**
   * Table exists.
   * @returns
   */
  public static async exists(): Promise<boolean> {
    return Boolean(await this.sequelize?.getQueryInterface().tableExists(this.tableName));
  }

  /**
   * Build paginate where.
   * @param param
   * @returns
   */
  public static buildQueryWhere(param?: Record<string, unknown>) {
    const where = {};

    _forEach(_omit(param, ['itemsPerPage', 'page', 'sortBy']), (value, key) => {
      if (!value) return;
      _set(where, key, { [Op.like]: `%${value}%` });
    });

    return where;
  }

  /**
   * Pagination.
   * @param this
   * @param options
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static async paginate<M extends Model>(
    this: ModelStatic<M>,
    options?: FindOptions,
  ): Promise<Pagination<M>> {
    // total count.
    const countOptions = Object.keys(options).reduce((acc, key) => {
      if (['order', 'attributes', 'include', 'page', 'itemsPerPage'].includes(key)) return acc;
      return { ...acc, [key]: _get(options, key) };
    }, {});

    const totalCount = await this.count(countOptions);

    // pages.
    if (options.limit) {
      logger.warn('options.limit is not allowed, please use options.itemsPerPage instead!');
    }
    if (options.offset) {
      logger.warn('options.offset is not allowed, please use options.page instead!');
    }

    const itemsPerPage = _get(options, 'itemsPerPage', 25);
    const totalPage = itemsPerPage > 0 ? Math.ceil(totalCount / itemsPerPage) : 1;

    if (itemsPerPage > 0) {
      _set(options, 'limit', Number(itemsPerPage));
      _set(options, 'offset', (_get(options, 'page', 1) - 1) * itemsPerPage);
    } else {
      // eslint-disable-next-line no-param-reassign
      options = _omit(options, ['limit', 'offset']);
    }

    const items = await this.findAll(options);

    return {
      items,
      count: items.length,
      totalCount,
      totalPage,
      page: Number(options.page),
      itemsPerPage: Number(itemsPerPage),
    };
  }

  /**
   * Get default update by.
   * @returns
   */
  private static getUpdateBy(): string {
    return _get(httpContext.get('user'), 'username', 'unknown');
  }
}
