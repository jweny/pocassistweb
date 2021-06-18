import React, { useEffect, useState } from "react";
// import { RouteComponentProps } from "react-router-dom";
import { RouteComponentProps, useLocation } from "react-router-dom";
import {
  deleteResult,
  getResultList,
  ParamsProps,
  ResultProps
} from "../../api/task";
import {
  Button,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table, Tag
} from "antd";
import "./index.less";
import ReactJson from "react-json-view";

const Result: React.FC<RouteComponentProps> = () => {
  const [form] = Form.useForm();
  const location = useLocation<{ id: string }>();
  const initialId = location?.state?.id;
  const [params, setParams] = useState<ParamsProps>({
    page: 1,
    pagesize: 10,
    search: "",
    taskField: initialId || "",
  });
  const [data, setData] = useState<ResultProps[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [show, setShow] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>([]);

  useEffect(() => {
    getResultList(params).then(res => {
      setData(res.data.data);
      setTotal(res.data.total);
    });
  }, [params]);

  const handlePageChange = (page: number, pageSize: number | undefined) => {
    setParams(prevState => ({ ...prevState, page, pagesize: pageSize || 10 }));
  };

  const handleFinish = (val: any) => {
    setParams(prevState => {
      return { ...prevState, ...val, page: 1 };
    });
  };

  const handleDelete = (record: any) => {
    console.log(record);
    deleteResult(record.id).then(res => {
      message.success("删除成功");
      setParams(prevState => ({ ...prevState }));
    });
  };

  const handleShowDetail = (record: any) => {
    console.log(record);
    setTestResult(record.detail);
    setShow(true);
  };
  const renderExpandRow = (record: any) => {
    console.log(record);
    const { req_msg, resp_msg } = record?.detail;

    return (
        <div>
          <Descriptions bordered>
            {record?.detail?.target && (
                <Descriptions.Item label="URL" span={3}>
                  {record?.detail?.target}
                </Descriptions.Item>
            )}
            <Descriptions.Item label="是否漏洞" span={3}>
              {String(record?.detail?.vulnerable)}
            </Descriptions.Item>
            {record?.detail?.output && (
                <Descriptions.Item label="额外说明" span={3}>
               <span style={{ whiteSpace: "pre-wrap" }}>
                 {record?.detail?.output}
               </span>
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

  const columns = [
    { title: "序号",
      dataIndex: "order",
      width: '8%',
      render: (text: any, record: any,index:any) => index + 1
    },
    { title: "结果ID", dataIndex: "id" },
    { title: "插件ID", dataIndex: "plugin_id" },
    { title: "插件名称", dataIndex: "plugin_name" },
    { title: "任务ID", dataIndex: "task_id" },
    {
      title: "存在漏洞",
      key: "vul",
      dataIndex: "vul",
      // render: (text: any) => (text ? "是" : "否")
      render: (vul: any) => {
          let color = vul ? 'volcano' : 'green';
          let text = vul ? "是" : "否"
          return (
              <Tag color={color} key={vul}>
                  {text}
              </Tag>
          );
      }
    },
    {
      title: "操作",
      render: (text: any, record: any) => {
        return (
          <Space>
            {/*<Button type="link" onClick={() => handleShowDetail(record)}>*/}
            {/*  查看详情*/}
            {/*</Button>*/}
            <Popconfirm
              title="确定删除该结果吗"
              onConfirm={() => handleDelete(record)}
            >
              <Button type="link">删除</Button>
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  return (
    <div className="result-wrap">
      <Form
          form={form}
          layout={"inline"}
          onFinish={handleFinish}
          initialValues={params}
      >
        <Form.Item label="搜索" name="search">
          <Input placeholder="请输入关键字" allowClear />
        </Form.Item>

        <Form.Item label="任务ID" name="taskField">
          <Input placeholder="请输入任务ID" allowClear />
        </Form.Item>

        <Form.Item label="是否存在漏洞" name="vulField">
          <Select allowClear style={{ width: 160 }} placeholder="请选择">
            <Select.Option value={1}>是</Select.Option>
            <Select.Option value={0}>否</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType={"submit"}>
            查询
          </Button>
        </Form.Item>
      </Form>
      <Table
        className="result-table"
        columns={columns}
        dataSource={data}
        rowKey="id"
        expandable={{
            expandedRowRender: record => renderExpandRow(record),
            rowExpandable: record => !!record.detail
        }}
        pagination={{
          current: params.page,
          pageSize: params.pagesize,
          total: total,
          showTotal: (total: number) => `共${total}条`,
          showQuickJumper: true,
          showSizeChanger: true,
          onChange: handlePageChange
        }}
      />
      <Modal
        visible={show}
        width={1300}
        footer={null}
        onCancel={() => {
          setShow(false);
        }}
        title="详细结果"
        className="test-result-wrap"
      >
        <ReactJson src={testResult} name={false} displayDataTypes={false} />
      </Modal>
    </div>
  );
};

export default Result;
