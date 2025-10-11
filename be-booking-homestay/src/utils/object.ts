export function omitFields(obj: any, fields: string[]): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => omitFields(item, fields));
  }

  if (typeof obj === 'object' && obj !== null) {
    const clone: any = {};
    for (const key in obj) {
      if (!fields.includes(key)) {
        clone[key] = omitFields(obj[key], fields);
      }
    }
    return clone;
  }

  return obj;
}
