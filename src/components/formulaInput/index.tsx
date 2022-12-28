import React, {
  FC,
  useRef,
  KeyboardEvent,
  CompositionEvent,
} from 'react';
import {
  Form,
  ModalFuncProps,
  Select,
  Modal,
} from 'antd';
import _ from 'lodash';
import style from './index.less';

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


interface LightPosition {
  selection: Selection;
  range: Range;
}

const { Option } = Select;
const FormulaInput: FC<{
  onChange?: (str: string) => void;
  divRef?: React.MutableRefObject<HTMLDivElement>;
}> = (props: {
  onChange?: (str: string) => void;
  divRef?: React.MutableRefObject<HTMLDivElement>;
}) => {
    const { onChange } = props;
    const lightPosition = useRef<LightPosition>();
    const [factorForm] = Form.useForm();
    const divRef2 = useRef<HTMLDivElement>({} as HTMLDivElement);
    const divRef = props.divRef ?? divRef2;

    // 获取当前光标坐标
    const getRecordCoordinates = () => {
      try {
        const selection = window.getSelection() as Selection;
        const range = selection?.getRangeAt(0);
        lightPosition.current = {
          selection,
          range, // 返回range对象
        };
        console.log('totalRange',lightPosition.current.range,selection)
      } catch (error) {
        throw new Error('获取光标位置失败');
      }
    };

    const handleInputValue = () => {
      let str = '';
      divRef.current!.childNodes.forEach(node => {
        if (node instanceof Text && node.data) {
          str += node.data;
        } else if (node instanceof HTMLInputElement) {
          str += `${node.dataset.id}`;
        }
      });
      onChange?.(str);
    }

    const modalConfig: ModalFuncProps = {
      icon: null,
      title: <div style={{ marginBottom: 10 }}>&nbsp;&nbsp;&nbsp;因子选择</div>,
      content: <Form form={factorForm} colon={false}>
        <Form.Item label=' ' name='factorGuid'>
          <Select placeholder='选择因子'>
            {
              fackedFactorObjs.map((f) => (
                <Option key={f.id} value={f.id}>
                  {f.name}
                </Option>
              ))
            }
          </Select>
        </Form.Item>
      </Form>,
      onOk() {
        const { selection, range } = lightPosition.current!;
        const inputNode = document.createElement('input');
        inputNode.value = `${fackedFactorObjs.find((f) => f.id === factorForm.getFieldValue('factorGuid'))!.name}`; // $的文本信息
        inputNode.type = 'button';
        inputNode.dataset.id = `${factorForm.getFieldValue('factorGuid')}`; // 用户ID、为后续解析富文本提供
        inputNode.className = 'tag';

        const frag = document.createDocumentFragment();
        frag.appendChild(inputNode);
        if (range) {
          range.insertNode(frag);
        }

        // 解决插入结点不触发input事件
        divRef.current!.dispatchEvent(new Event('input', { bubbles: true }));

        selection.removeAllRanges(); // 移除当前光标
        selection.addRange(range); // 还原光标位置
        selection.collapseToEnd(); // addRange之后光标处于选中状态，需要将光标移动至最末端
        getRecordCoordinates(); // 更新存储的光标信息
      },
    };

    // 键盘输入事件
    const keydownEv = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === '$') {
        e.preventDefault();
        getRecordCoordinates();
        Modal.confirm(modalConfig);
      } else {
        const allowReg = /^[0-9.+\-*/()]|(Backspace)|(ArrowLeft)|(ArrowRight)|(ArrowDown)|(ArrowUp)|(Shift)+$/;
        if (!allowReg.test(e.key)) {
          e.preventDefault();
        }
      }
    };

    // 中文输入结束切掉中文
    const handleChineseInput = (e: CompositionEvent<HTMLDivElement>) => {
      console.dir(JSON.stringify(lightPosition.current))

      const curChinese = e.data;
      // 会造成光标到前面
      divRef.current!.innerHTML = divRef.current!.innerHTML.replace(curChinese, '');

      // 处理边缘情况：input为空时输入中文
      divRef.current!.dispatchEvent(new Event('input', { bubbles: true }));

      // 光标到最后（TODO: 光标定位）
      const { range, selection } = lightPosition.current!;
      range?.selectNodeContents(divRef.current!);
      range?.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range!);
      // 更新光标
      getRecordCoordinates();
    }

    return <div className={style.formulaInput}>
      <div
        className='frontLineItem'
        contentEditable
        ref={divRef}
        onClick={getRecordCoordinates}
        onKeyDown={keydownEv}
        onCompositionEnd={handleChineseInput}
        onInput={handleInputValue}
        onPaste={(e) => { e.preventDefault() }}
      />
      <div className='frontLineItem-desc'>说明: 输入$选择因子, 全程使用英文输入法</div>
    </div>;
  };

export default FormulaInput;
