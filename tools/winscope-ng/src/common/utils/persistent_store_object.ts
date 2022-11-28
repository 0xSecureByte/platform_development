/*
 * Copyright 2022, The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export type StoreObject = { [key: string|number]: StoreObject|string|boolean|undefined } | StoreObject[] | string[] | boolean[]

export class PersistentStoreObject {
  public static new<T extends StoreObject>(key: string, initialState: T, storage: Storage): T {
    const storedState = JSON.parse(storage.getItem(key) ?? "{}");
    const currentState = mergeDeep({}, deepClone(initialState));
    mergeDeep(currentState, storedState);
    return wrapWithPersistentStoreProxy<T>(key, currentState, storage);
  }
}

function wrapWithPersistentStoreProxy<T extends StoreObject>(storeKey: string, object: T, storage: Storage, baseObject: T = object): T {
  const updatableProps: string[] = [];

  let key: number|string;
  for (key in object) {
    const value = object[key];
    if (typeof value === "string" || typeof value === "boolean" || value === undefined) {
      if (!Array.isArray(object)) {
        updatableProps.push(key);
      }
    } else {
      object[key] = wrapWithPersistentStoreProxy(storeKey, value, storage, baseObject);
    }
  }

  const proxyObj = new Proxy(object, {
    set: (target, prop, newValue) => {
      if (typeof prop === "symbol") {
        throw Error("Can't use symbol keys only strings");
      }
      if (Array.isArray(target) && typeof prop === "number") {
        target[prop] = newValue;
        storage.setItem(storeKey, JSON.stringify(baseObject));
        return true;
      }
      if (!Array.isArray(target) && updatableProps.includes(prop)) {
        target[prop] = newValue;
        storage.setItem(storeKey, JSON.stringify(baseObject));
        return true;
      }
      throw Error(`Object property '${prop}' is not updatable. Can only update leaf keys: [${updatableProps}]`);
    }
  });

  return proxyObj;
}

function isObject(item: any): boolean {
  return (item && typeof item === "object" && !Array.isArray(item));
}

function mergeDeep(target: any, ...sources: any): any {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

function deepClone(obj: StoreObject): StoreObject {
  return JSON.parse(JSON.stringify(obj));
}