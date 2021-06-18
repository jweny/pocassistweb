import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import {
  deleteTask,
  getTaskList,
  ParamsProps,
  TaskProps
} from "../../api/task";
import {Button, Form, Input, message, Popconfirm, Space, Table, Spin, Tag} from "antd";
import "./index.less";
import {PlusOutlined} from "@ant-design/icons";
import TestModal from "../rules/components/TestModal";
import {getRuleDetail} from "../../api/rule";

const Task: React.FC<RouteComponentProps> = () => {
  const [form] = Form.useForm();
  const history = useHistory();
  const [params, setParams] = useState<ParamsProps>({
    page: 1,
    pagesize: 10,
    search: ""
  });
  const [data, setData] = useState<TaskProps[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [batchTestShow, setBatchTestShow] = useState<boolean>(false);

  useEffect(() => {
    getTaskList(params).then(res => {
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
    deleteTask(record.id).then(res => {
      message.success("删除成功");
      setParams(prevState => ({ ...prevState }));
    });
  };

  const columns = [
    { title: "序号",
      dataIndex: "order",
      width: '8%',
      render: (text: any, record: any,index:any) => index + 1
    },
    { title: "任务ID", dataIndex: "id" },
    { title: "目标", dataIndex: "target" },
    { title: "任务说明", dataIndex: "remarks" },
    { title: "创建者", dataIndex: "operator" },
    { title: "状态", dataIndex: "status", key: "status",
        render: (status: any) => {
            let color = (status==="down") ? 'green' : 'geekblue';
            return (
                <Tag color={color} key={status}>
                    {status}
                </Tag>
            );
        }
    },
    {
      title: "操作",
      render: (text: any, record: any) => {
        return (
        <>
            <Button
                type="link"
                onClick={() => {
                    history.push({
                        pathname: "/result",
                        state: { id: record.id }
                    });
                }}
            >
                扫描结果
            </Button>
            <Popconfirm
                title="确定删除该任务吗"
                onConfirm={() => handleDelete(record)}
            >
                <Button type="link">删除</Button>
            </Popconfirm>
        </>
        );
      }
    }
  ];

  return (
    <div className="task-wrap">
      <Space direction="vertical" size="middle">
      <Form form={form} layout={"inline"} onFinish={handleFinish}>
        <Form.Item label="关键字" name="search">
          <Input placeholder="请输入关键字" allowClear />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType={"submit"}>
            查询
          </Button>
        </Form.Item>
      </Form>

      <Button
        icon={<PlusOutlined />}
        type="primary"
        onClick={() => {
          setBatchTestShow(true);
        }}
      >
        创建扫描任务
      </Button>
      </Space>
      <Table
        className="task-table"
        columns={columns}
        dataSource={data}
        rowKey="id"
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
      {batchTestShow && (
          <TestModal width={800}
              visible={batchTestShow}
              title="创建扫描任务"
              onCancel={() => setBatchTestShow(false)}
          >
          </TestModal>
      )}
    </div>
  );
};

export default Task;
