import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::article.article', {
  only: ['find', 'findOne'],
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});
