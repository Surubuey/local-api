const { useQuery, useMutation } = require("@tanstack/react-query");

const useLocalQuery = (key, initialValue) => {
  const query = useQuery(key, () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const storedValue = localStorage.getItem(key);
        try {
          const parsedValue = storedValue
            ? JSON.parse(storedValue)
            : initialValue;
          if (parsedValue) {
            resolve(parsedValue);
          }
        } catch (e) {
          resolve(storedValue);
        }
      }, 1000);
    });
  });

  return query;
};

const useLocalMutation = (key, idKey = "id", isCollection = true) => {
  const createMutation = useMutation({
    mutationFn: (value) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const storedValue = localStorage.getItem(key);
          // check if the stored value exists
          if (storedValue) {
            const parsedValue = JSON.parse(storedValue);
            if (isCollection) {
              // check if the stored collection is an array
              if (Array.isArray(parsedValue)) {
                const maxId = Math.max(
                  ...parsedValue.map((item) => parseInt(item[idKey]))
                );
                // add the new item to the array with an incremented id
                const newValue = { ...value, [idKey]: maxId + 1 };
                parsedValue.push(newValue);
                // store the new array
                localStorage.setItem(key, JSON.stringify(parsedValue));
                resolve({ status: "success", data: newValue, id: maxId + 1 });
                return;
              } else {
                // if the stored collection is not an array, reject
                reject({
                  status: "error",
                  message: "Stored collection is not an array",
                });
                return;
              }
            } else {
              reject({
                status: "error",
                message: "Stored value already exists",
              });
              return;
            }
          } else {
            // if the stored value doesn't exist, create it
            if (isCollection) {
              // store an array with the item as the only item
              localStorage.setItem(key, JSON.stringify([value]));
            } else {
              // store the item
              if (typeof value !== "object") {
                // store the item as a string
                localStorage.setItem(key, value);
              } else {
                // store the item as an object
                localStorage.setItem(key, JSON.stringify(value));
              }
            }
            resolve({ status: "success", data: value });
          }
        }, 1000);
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: (value) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const storedValue = localStorage.getItem(key);
          // check if the stored value exists
          if (storedValue) {
            const parsedValue = JSON.parse(storedValue);
            if (isCollection) {
              // check if the stored collection is an array
              if (Array.isArray(value)) {
                let exists = false;
                const newValue = parsedValue.map((item) => {
                  if (item[idKey] === value.id) {
                    exists = true;
                    return value;
                  }
                  return item;
                });
                if (!exists) {
                  reject({ status: "error", message: "Item not found" });
                  return;
                }
                localStorage.setItem(key, JSON.stringify(newValue));
                resolve({ status: "success", data: newValue });
                return;
              } else {
                // if the stored collection is not an array, reject
                reject({
                  status: "error",
                  message: "Stored collection is not an array",
                });
                return;
              }
            } else {
              // store the item
              if (typeof value !== "object") {
                localStorage.setItem(key, value);
              } else {
                localStorage.setItem(key, JSON.stringify(value));
              }
              resolve({ status: "success", data: value });
              return;
            }
          } else {
            reject({ status: "error", message: "Item not found" });
          }
        }, 1000);
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id = undefined) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const storedValue = localStorage.getItem(key);
          if (storedValue) {
            const parsedValue = JSON.parse(storedValue);
            if (Array.isArray(storedValue)) {
              const foundIndex = parsedValue.findIndex(
                (item) => id === item[idKey]
              );
              if (foundIndex === -1) {
                reject({ status: "error", message: "Item not found" });
              }
              const newValue = parsedValue.slice(foundIndex, 1);
              localStorage.setItem(key, JSON.stringify(newValue));
              resolve({ status: "success", data: newValue });
            } else {
              localStorage.removeItem(key);
              resolve({ status: "success", data: newValue });
            }
          } else {
            reject({ status: "error", message: "Item not found" });
          }
        }, 1000);
      });
    },
  });

  return { editMutation, createMutation, deleteMutation };
};

module.exports = {
  useLocalQuery,
  useLocalMutation,
};
