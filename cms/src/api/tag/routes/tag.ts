import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::tag.tag', {
  only: ['find', 'findOne'],
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});
