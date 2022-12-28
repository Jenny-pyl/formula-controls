// 判断字符串是否为合法的四则运算
export function isValidArithmetic(str: string) {
  try {
    str = str.replace(/ /g, '');
    if (/^[\d|\-|\+|\*|\/|\.|\(|\)]+$/.test(str)) {
      var val = eval(str);
      if (typeof val == 'number' && val != Infinity) {
        return true;
      }
    }
  } catch (e) {
    console.log(e)
  }
  return false;
}