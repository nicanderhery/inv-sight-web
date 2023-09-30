import { BaseEntity } from './base-entity';

export interface Item extends BaseEntity {
  name: string;
  weight: string;
  model: string;
}
