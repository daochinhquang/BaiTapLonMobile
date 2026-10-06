import { categories, products, wait } from './api';

export const getCategories = () => wait(categories);

export const getProducts = () => wait(products);

export const getFeaturedProducts = () => wait(products.filter((product) => product.featured));

export const getProductById = (id: string) =>
  wait(products.find((product) => product.id === id) ?? null);

export const getProductsByCategory = (categoryId: string) =>
  wait(categoryId === 'all' ? products : products.filter((product) => product.category === categoryId));

export const searchProducts = (keyword: string) => {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return wait(products);
  }

  return wait(
    products.filter((product) =>
      [product.name, product.brand, product.description]
        .join(' ')
        .toLowerCase()
        .includes(normalizedKeyword)
    )
  );
};
