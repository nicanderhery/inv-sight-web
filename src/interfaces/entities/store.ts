import BaseEntity from './base-entity';

interface Store extends BaseEntity {
  name: string;
  owner: string;
}

export default Store;
