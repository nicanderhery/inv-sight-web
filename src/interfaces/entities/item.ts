import BaseEntity from './base-entity';

interface Item extends BaseEntity {
  name: string;
  weight: string;
  model: string;
}

export default Item;
