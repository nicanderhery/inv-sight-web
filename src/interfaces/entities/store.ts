import { BaseEntity } from './base-entity';

export interface Store extends BaseEntity {
  name: string;
  owner: string;
}
