type NestedObject = {
    [key: string]: any; // Puede ser cualquier tipo primitivo, array u objeto anidado
};

function replaceSpecialChars(str: string): string {
    return str.replace(/Å\+o/g, "ño")
              .replace(/Ã±/g, "ñ")
              .replace(/Ã¡/g, "á")
              .replace(/Ã©/g, "é")
              .replace(/Ã­/g, "í")
              .replace(/Ã³/g, "ó")
              .replace(/Ãº/g, "ú");
}

export function processObject<T extends NestedObject | any[] | any>(obj: T): T {
    if (typeof obj === 'string') {
        return replaceSpecialChars(obj) as T;
    } else if (Array.isArray(obj)) {
        return obj.map(item => processObject(item)) as T;
    } else if (typeof obj === 'object' && obj !== null) {
        const newObj: NestedObject = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = processObject(obj[key]);
            }
        }
        return newObj as T;
    }
    return obj;
}