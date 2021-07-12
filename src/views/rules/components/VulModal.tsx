import React, { useContext, useEffect, useRef, useState } from "react";
import ReactJson from "react-json-view";
import {
  Alert,
  Button,
  Col,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Switch,
  Tabs,
  Upload
} from "antd";
import { ModalProps } from "antd/es/modal";
import { FormColumnProps } from "./SearchForm";
import RunTest, { getId } from "./RunTest";
import { getVulList, VulDataProps } from "../../../api/vul";
import { getToken, getUserInfo } from "../../../utils/auth";
import "braft-editor/dist/index.css";
import {
  createRule,
  getRuleList,
  testRule,
  RuleDataProps,
  updateRule,
  downloadYaml
} from "../../../api/rule";
import RuleContext from "../../../store/rule/store";
import { UploadOutlined } from "@ant-design/icons";

interface AddVulProps extends ModalProps {
  selected?: RuleDataProps;
  type?: string;
}
const VulModal: React.FC<AddVulProps> = props => {
  let { selected, type = "vul" } = props;
  const testRef = useRef(null);
  const [step, setStep] = useState<number>(1);
  const [ruleData, setRuleData] = useState<any>(null);
  // 获取漏洞描述（vul）列表
  const [vulList, setVulList] = useState<VulDataProps[]>([]);
  // 添加完成后将vul和json的id暂存，如果保存出错或者运行测试之后又要修改前面的信息，通过id修改已有漏洞
  const [vulAddId, setVulAddId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [show, setShow] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>("");
  const [target, setTarget] = useState<string>("");
  const { state, dispatch } = useContext(RuleContext);

  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 }
  };

  useEffect(() => {
    // console.log(selected);
    // 根据selected判断当前是编辑还是新增
    if (!!selected) {
      setRuleData(selected);
      setStep(1);
      setLoading(false);
    } else {
      setLoading(false);
    }
    getVulList({ page: 1, pagesize: 99999 }).then(res => {
      setVulList(res.data.data);
    });
  }, [selected, type]);

  const handleFinish = (val?: any) => {
    setLoading(true);
    const userInfo = getUserInfo();
    const vulApi = ruleData?.id || vulAddId ? updateRule : createRule;

    // @ts-ignore
    const xml = testRef.current?.getRunTestData();
    const finalData: RuleDataProps = {
      ...ruleData,
      ...val,
      writer_id: userInfo?.id,
      ...xml
    };
    // console.log(finalData);
    vulApi(finalData, ruleData?.id || vulAddId)
      .then((res: any) => {
        setVulAddId(res?.data?.id);
        message.success(`保存成功`);
        getRuleList({
          ...state.search_query,
          page: state.page,
          pagesize: state.pagesize
          // search_query: JSON.stringify(state.search_query)
        }).then(res => {
          dispatch({ type: "SET_LIST", payload: res.data.data });
          dispatch({ type: "SET_TOTAL", payload: res.data.total });
          //@ts-ignore
          props.onCancel && props.onCancel();
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDownloadYaml = (val?: any) => {
    const userInfo = getUserInfo();

    // @ts-ignore
    const xml = testRef.current?.getRunTestData();
    const finalData: RuleDataProps = {
      ...ruleData,
      ...val,
      writer_id: userInfo?.id,
      ...xml
    };
    console.log(xml);
    try {
      downloadYaml(xml).then(res => {
        // console.log(res);
        const link = document.createElement("a");
        const blob = new Blob(["\uFEFF" + res.data], {
          type: "text/vnd.yaml"
        });
        link.style.display = "none";
        link.href = URL.createObjectURL(blob);
        let num = "";
        for (let i = 0; i < 10; i++) {
          num += Math.ceil(Math.random() * 10);
        }
        link.setAttribute("download", num + ".yaml");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleRunTest = (val: any) => {
    setShow(true);
    setLoading(true);
    const userInfo = getUserInfo();
    // @ts-ignore
    const xml = testRef.current?.getRunTestData();
    const finalData: RuleDataProps = {
      target,
      ...ruleData,
      ...val,
      writer_id: userInfo?.id,
      ...xml
    };
    testRule(finalData)
      .then(res => {
        setTestResult(res.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderTestResult = (record: any) => {
    console.log(record);
    const { req_msg, resp_msg } = record;

    return (
        <div>
          <Descriptions bordered>
            {record?.target && (
                <Descriptions.Item label="URL" span={3}>
                  {record?.target}
                </Descriptions.Item>
            )}
            <Descriptions.Item label="是否漏洞" span={3}>
              {String(record?.vulnerable)}
            </Descriptions.Item>
            {record?.output && (
                <Descriptions.Item label="额外说明" span={3}>
                  <span style={{ whiteSpace: "pre-wrap" }}>{record?.output}</span>
                </Descriptions.Item>
            )}
            {req_msg &&
            req_msg.map((item: string, index: number) => {
              return (
                  <React.Fragment key={index}>
                    <Descriptions.Item label={`Request${index + 1}`} span={3}>
                      <span style={{ whiteSpace: "pre-wrap" }}>{item}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label={`Response${index + 1}`} span={3}>
                     <span style={{ whiteSpace: "pre-wrap" }}>
                       {resp_msg[index]}
                     </span>
                    </Descriptions.Item>
                  </React.Fragment>
              );
            })}
          </Descriptions>
        </div>
    );
  };

  const formColumns: FormColumnProps[] = [
    {
      name: "vul_id",
      label: "漏洞编号",
      render: () => {
        return (
            <Input placeholder="漏洞编号无需输入 自动生成" disabled={true}/>
        );
      }
      },
    {
      name: "affects",
      label: "规则类型",
      render: () => {
        return (
          <Select placeholder="选择类型" style={{ width: 300 }}>
            {state.basic?.ModuleAffects.map(item => {
              return (
                <Select.Option value={item.name} key={item.name}>
                  {item.label}
                </Select.Option>
              );
            })}
          </Select>
        );
      }
      // rules: [{ required: true }]
    },
    {
      name: "enable",
      label: "是否启用",
      valuePropName: "checked",
      render: () => {
        return <Switch />;
      }
    },
    {
      name: "description",
      label: "漏洞描述",
      render: () => {
        return (
          <Select
            placeholder="请选择"
            style={{ width: 300 }}
            showSearch
            optionFilterProp="children"
          >
            {vulList.map(item => {
              return (
                <Select.Option
                  value={item.id as number}
                  key={item.id}
                  title={item.name_zh}
                >
                  {item.name_zh}
                </Select.Option>
              );
            })}
          </Select>
        );
      }
    }
  ];

  const height = document.documentElement.offsetHeight;

  const uploadProps: any = {
    name: "yaml",
    action: process.env.REACT_APP_BASE_API + "/v1/poc/upload/",
    headers: {
      Authorization: `JWT ${getToken()}`
    },
    onChange(info: any) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        console.log(info);
        setRuleData((prev: any) => {
          return {
            ...prev,
            json_poc: info?.file?.response?.data?.json_poc
          };
        });
        message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} 上传失败`);
      }
    }
  };

  return (
    <Modal
      {...props}
      destroyOnClose
      // forceRender
      maskClosable={false}
      onCancel={e => {
        props.onCancel && props.onCancel(e);
      }}
      footer={
        <div>
          <React.Fragment>
            <span style={{ float: "left", lineHeight: "32px" }}>测试url：</span>
            <Input
              style={{ float: "left", width: "400px" }}
              onChange={event => setTarget(event.target.value)}
            />
            <Button
              type="primary"
              style={{ float: "left", marginLeft: "10px" }}
              onClick={() => {
                form.validateFields().then(val => {
                  handleRunTest(val);
                });
              }}
              loading={loading}
            >
              测试规则
            </Button>

            <div style={{ float: "left", marginLeft: "10px" }}>
              <Upload {...uploadProps} showUploadList={false}>
                <Button type="primary">上传yaml</Button>
              </Upload>
              <Button
                  type="primary"
                  style={{ marginLeft: "10px" }}
                  onClick={() => {
                    form.validateFields().then(val => {
                      handleDownloadYaml(val);
                    });
                  }}
              >
                下载yaml
              </Button>
            </div>

            <Button
              type="primary"
              onClick={() => {
                form.validateFields().then(val => {
                  handleFinish(val);
                });
              }}
              loading={loading}
            >
              保存
            </Button>
          </React.Fragment>
          <Button onClick={props.onCancel}>取消</Button>
        </div>
      }
      bodyStyle={{
        maxHeight: height - 120,
        overflowY: "scroll"
      }}
    >
      <Spin spinning={loading}>
        <Form
          {...formItemLayout}
          form={form}
          name="vul_detail"
          layout="horizontal"
          initialValues={ruleData}
        >
          {formColumns.map(
            (
              {
                name,
                label,
                render = () => <Input placeholder={`请输入${label}`} />,
                ...formProps
              },
              index
            ) => (
              <Form.Item label={label} key={index} name={name} {...formProps}>
                {render()}
              </Form.Item>
            )
          )}
        </Form>
        <h3 className="poc_title">规则内容：</h3>
        <RunTest
          ref={testRef}
          testData={ruleData?.json_poc}
          vulId={ruleData?.id ?? vulAddId}
        />
      </Spin>
      <Modal
        visible={show}
        width={800}
        footer={null}
        onCancel={() => {
          setShow(false);
          setTestResult([]);
        }}
        title="poc运行结果"
        className="test-result-wrap"
      >
        <Spin spinning={loading} size="large">
          {renderTestResult(testResult)}
        </Spin>
      </Modal>
    </Modal>
  );
};

export default VulModal;
