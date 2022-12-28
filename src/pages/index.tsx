import { useRef } from 'react';
import { Form } from 'antd';
import FormulaInput from '@/components/formulaInput';
import { isValidArithmetic } from '@/utils';

const fackedFactorObjs: { id: string; name: string }[] = [
  {
    id: '01',
    name: '因子1',
  },
  {
    id: '02',
    name: '因子2',
  },
  {
    id: '03',
    name: '因子3',
  },
  {
    id: '04',
    name: '因子4',
  },
];

/** 
 * 字符串拆解 (axds+12ds)/(da1e-caqc) -> 
 * [ '(', 'axds', '+', '12ds', ')' ,'/', '(', 'da1e', '-', 'caqc', ')' ]
*/
function strSpilt(str: string): string[] {
  return str.split(/([\+\-\*\/\(\)])/).filter(Boolean)
}

// 判断是否为合法字符
function isVailidFormula(str: string) {
  const allowedCharList = ['(', ')', '+', '-', '*', '/'];
  const spiltedStrList = strSpilt(str);
  for (let i in spiltedStrList) {
    // 不在合法字符集 且 字符串也不与任一因子id匹配
    if (!allowedCharList.includes(spiltedStrList[i])
      && Number.isNaN(spiltedStrList[i])
      && !fackedFactorObjs?.find(item => item.id === spiltedStrList[i])) {
      return false;
    }
  }
  const arithmetic = strSpilt(str).filter(Boolean)
    .map((char, index) => fackedFactorObjs.find(item => item.id === char) ? `${index + 1}` : char)
    .reduce((pre, cur) => pre + cur);
  console.log('arithmetic', arithmetic);
  return isValidArithmetic(arithmetic);
}

export default function HomePage() {
  const [form] = Form.useForm();
  const frontFormulaRef = useRef<HTMLDivElement>({} as HTMLDivElement);

  return (
    <div>
      <Form
        colon={false}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        form={form}
        preserve={false}
      >
        <Form.Item
          label='纯前线公式'
          name='frontlineFormula'
          rules={[{ required: true, message: '请输入纯前线公式' }]}
        >
          <FormulaInput divRef={frontFormulaRef} />
        </Form.Item>
      </Form>
    </div>
  );
}
