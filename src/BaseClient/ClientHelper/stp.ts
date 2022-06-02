/* eslint-disable @typescript-eslint/no-explicit-any */
import auth from '../auth.json' assert { type: 'json' };

export default (expression: string | string[], Object: { [key: string]: string }) => {
  const replacer = (e: string) => {
    const text = e.replace(/{{\s?([^{}\s]*)\s?}}/g, (substring: string, value: string) => {
      const newValue = value.split('.');
      let decided: any;
      const Result = Object[newValue[0]];
      if (Result) {
        if (newValue.length > 1) {
          newValue.forEach((element: any, i) => {
            if (i === 1) decided = Result[element];
            if (i > 1) decided = decided[element];
          });
          return decided;
        }
        return Result;
      }
      return substring;
    });
    return text;
  };

  if (Array.isArray(expression)) {
    const returned: string[] = [];
    expression.forEach((rawE) => {
      const e = `${rawE}`;
      let text: any = replacer(e);
      if (text === 'true') text = true;
      if (text === 'false') text = false;
      if (`${text}`.replace(/\D+/g, '') === text && Number.MAX_SAFE_INTEGER > parseInt(text, 10)) {
        text = Number(text);
      }
      returned.push(text);
    });
    return returned;
  }
  const text = replacer(expression);
  return text.replace(RegExp(auth.token, 'g'), 'TOKEN');
};
