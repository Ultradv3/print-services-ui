/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApiService } from './ApiService'

/**
 * useResource - Hook genérico para manejar operaciones CRUD de cualquier recurso usando ApiService.
 *
 * Este hook facilita la interacción con un endpoint REST de manera tipada y reactiva.
 * Expone referencias reactivas para un solo item (`item`) y para listas (`items`),
 * así como un flag `loading` para el estado de carga.
 *
 * @template T Tipo de la entidad con la que se trabajará (por ejemplo: `salones`, `alumnos`).
 * @param {string} baseUrl - URL base del endpoint REST (ej: '/api/salones').
 *
 * @returns {object} Un objeto con las siguientes propiedades:
 *  - loading: Ref<boolean> que indica si una operación está en curso.
 *  - item: Ref<T | null> con el último item creado o actualizado.
 *  - items: Ref<T[]> con la lista de items obtenidos.
 *  - create(data: T): Promise<T | null> - Crea un nuevo recurso.
 *  - update(data: T): Promise<T | null> - Actualiza un recurso existente.
 *  - remove(query?: Record<string, any>): Promise<boolean> - Elimina un recurso según los parámetros.
 *  - getAll(query?: Record<string, any>): Promise<T[]> - Obtiene todos los recursos o filtrados por query.
 *
 * @example
 * ```ts
 * import { useResource } from '~/composables/useResource';
 * import type { salones } from '~/generated/prisma';
import { is } from '../../.nuxt/eslint-typegen';
 *
 * const { create, update, remove, getAll, items, loading } = useResource<salones>("/api/salones");
 *
 * // Crear un salón
 * await create({ nombre: "Salón A", capacidad: 30 });
 *
 * // Obtener todos los salones
 * await getAll();
 * console.log(items.value);
 *
 * // Actualizar un salón
 * await update({ id: 1, nombre: "Salón B", capacidad: 35 });
 *
 * // Eliminar un salón
 * await remove({ id: 1 });
 * ```
 */
export const useResource = <T>(baseUrl: string) => {
  const loading = ref(false);
  const item = ref<T | null>(null);
  const items = ref<T[]>([]);
  const isError = ref(false);

  const service = ApiService<T>(baseUrl);

  // Crear
  const create = async (data: T) => {
    loading.value = true;
    isError.value = false;
    try {
      item.value = await service.post(data);
      return item.value;
    } catch (err) {
      console.error("Error en create:", err);
      isError.value = true;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Actualizar
  const update = async (data: T) => {
    loading.value = true;
    try {
      item.value = await service.put(data);
      return item.value;
    } finally {
      loading.value = false;
    }
  };

  // Eliminar
  const remove = async (query?: Record<string, any>) => {
    loading.value = true;
    try {
      return await service.delete(query);
    } finally {
      loading.value = false;
    }
  };

  // Obtener lista
  const getAll = async (query?: Record<string, any>) => {
    loading.value = true;

    try {
      const data = await service.get(query);

      if (data) {
        items.value = Array.isArray(data) ? (data as unknown as T[]) : [data];
      }

      return items.value;
    } catch (error) {
      console.error("Error en getAll:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    item,
    items,
    isError,
    create,
    update,
    remove,
    getAll,
  };
};
