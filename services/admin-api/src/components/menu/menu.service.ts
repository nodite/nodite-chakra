import { AppError, type DataTree, DataTreeUtil } from '@nodite-light/admin-core';
import httpStatus from 'http-status';

import { IMenuCreate, IMenuUpdate } from '@/components/menu/menu.interface';
import MenuModel, { IMenu } from '@/components/menu/menu.model';
import RoleModel from '@/components/role/role.model';
import UserModel from '@/components/user/user.model';
import UserService from '@/components/user/user.service';
import lodash from '@/utils/lodash';

/**
 * Class MenuService.
 */
export default class MenuService {
  userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Select menu list.
   * @param userId
   * @returns
   */
  public async selectMenuList(userId?: number): Promise<IMenu[]> {
    let menus: MenuModel[] = [];

    // admin.
    if (await this.userService.isAdmin(userId)) {
      menus = lodash.map(await MenuModel.findAll(), (m) => m.toJSON());
    }
    // no-admin user.
    else {
      // user.
      const user = await UserModel.findOne({
        where: { userId },
        include: [
          {
            model: RoleModel,
            attributes: ['roleId'],
            required: false,
            include: [
              {
                model: MenuModel,
                required: false,
              },
            ],
          },
        ],
      });

      if (lodash.isEmpty(user)) {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, 'User not found');
      }

      menus = lodash
        .chain(user.roles)
        .map('menus')
        .flatten()
        .map((m) => m.toJSON())
        .uniqBy('menuId')
        .value();
    }

    // order
    return lodash.orderBy(menus, ['orderNum', 'menuId'], ['asc', 'asc']);
  }

  /**
   * Select menu tree.
   * @param userId
   * @returns
   */
  public async selectMenuTree(userId?: number): Promise<DataTree<IMenu>[]> {
    return DataTreeUtil.buildTree(await this.selectMenuList(userId), {
      idKey: 'menuId',
      pidKey: 'parentId',
    });
  }

  /**
   * Select menu by id.
   * @param id
   * @returns
   */
  public async selectMenuById(id: string): Promise<IMenu> {
    const menu = await MenuModel.findOne({ where: { menuId: id } });
    return menu.toJSON();
  }

  /**
   * create
   * @param menu
   * @returns
   */
  public async create(menu: IMenuCreate): Promise<IMenu> {
    const createdMenu = await MenuModel.create({ ...menu });
    return createdMenu.toJSON();
  }

  /**
   * Update menu.
   * @param id
   * @param menu
   * @returns
   */
  public async update(id: string, menu: IMenuUpdate): Promise<IMenu> {
    const storedMenu = await MenuModel.findOne({ where: { menuId: id } });
    const updatedUser = await storedMenu.update(menu);
    return updatedUser.toJSON();
  }

  /**
   * Delete menu.
   * @param id
   */
  public async delete(id: string): Promise<void> {
    const storedMenu = await MenuModel.findOne({ where: { menuId: id } });

    if (storedMenu.getDataValue('deleted') === 9) {
      throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, 'Menu is not allow delete!');
    }

    return storedMenu.destroy();
  }
}
