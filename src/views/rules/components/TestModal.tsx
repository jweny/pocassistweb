import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Upload
} from "antd";
import { ModalProps } from "antd/es/modal";
import {
  batchTestList,
  batchTestRaw,
  batchTestUrl,
  getRuleList,
  RuleDataProps
} from "../../../api/rule";
import { UploadOutlined } from "@ant-design/icons";

interface TestModalProps extends ModalProps {}

const TestModal: React.FC<TestModalProps> = props => {
  const [form] = Form.useForm();
  const [type, setType] = useState<string>("all");
  const [targetType, setTargetType] = useState<string>("url");
  const [ruleList, setRuleList] = useState<RuleDataProps[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    getRuleList({ page: 1, pagesize: 99999 }).then(res => {
      setRuleList(res.data.data);
    });
  }, []);

  const handleRuleChange = (e: any) => {
    setType(e.target.value);
  };

  const handleTargetChange = (e: any) => {
    setTargetType(e.target.value);
  };

  const handleUploadChange = (info: any) => {
    let newFileList = [...info.fileList];

    newFileList = newFileList.slice(-1);

    setFileList(newFileList);
  };

  const handleSubmit = () => {
    form.validateFields().then(val => {
      console.log(val);
      console.log(fileList);
      const targetType = val.targetType;
      let value;
      if (targetType !== "url") {
        value = new FormData();
        value.append("target", val.target[0].originFileObj);
        value.append("type", val.type);
        value.append("vul_list", val.vul_list);
        value.append("remarks", val.remarks);
      } else {
        value = val;
      }
      const uri =
        targetType === "raw"
          ? batchTestRaw
          : targetType === "url_list"
          ? batchTestList
          : batchTestUrl;
      uri(value).then(res => {
        console.log(res);
        message.success("任务创建成功");
        // @ts-ignore
        props.onCancel();
      });
    });
  };

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 }
  };

  const normFile = (e: any) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList.slice(-1);
  };

  const uploadProps: any = {
    onChange: handleUploadChange,
    onRemove: (file: any) => {
      setFileList([]);
    },
    beforeUpload: (file: any) => {
      console.log(file);
      setFileList([file]);
      return false;
    },
    fileList
  };

  return (
    <Modal {...props} maskClosable={false} onOk={handleSubmit}>
      <Form {...layout} form={form} initialValues={{ type, targetType }}>
        <Form.Item name="remarks" label="任务说明">
          <Input.TextArea />
        </Form.Item>

        <Form.Item name="type" label="扫描类型">
          <Radio.Group onChange={handleRuleChange}>
            <Radio value="all">加载所有规则</Radio>
            <Radio value="multi">自定义多个规则</Radio>
          </Radio.Group>
        </Form.Item>

        {type === "multi" && (
          <Form.Item name="vul_list" label="规则列表">
            <Select
              allowClear
              mode="multiple"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {ruleList.map(item => {
                return (
                  <Select.Option value={item.vul_id} key={item.vul_id}>
                    {item.desp_name}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        )}

        <Form.Item name="targetType" label="测试目标类型">
          <Radio.Group onChange={handleTargetChange}>
            <Radio value="url">单个url</Radio>
            <Radio value="raw">请求raw文件</Radio>
            <Radio value="url_list">url列表文件</Radio>
          </Radio.Group>
        </Form.Item>

        {targetType === "url" && (
          <Form.Item name="target" label="测试目标">
            <Input />
          </Form.Item>
        )}

        {(targetType === "raw" || targetType === "url_list") && (
          <Form.Item
            name="target"
            label="上传"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>点击上传</Button>
            </Upload>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default TestModal;
