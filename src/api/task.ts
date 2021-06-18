import request from "../utils/request";

export interface ParamsProps {
  page: number;
  pagesize: number;
  search?: string;
  taskField?: string;
  vulField?: string;
}

export interface TaskProps {
  id: number;
  operator: string;
  remarks: string;
  results: string;
  status: string;
  target: string;
}

export interface ResultProps {
  id: number;
  plugin_id: string;
  plugin_name: string;
  task_id: number;
  vul: boolean;
  detail: any;
}

/**
 * 获取任务列表
 * @param params
 */

export const getTaskList = (params: {
  page: number;
  pagesize: number;
  search?: string;
}) => {
  return request({
    url: "/v1/task/",
    method: "get",
    params
  });
};

/**
 * 删除任务
 * @param id
 */

export const deleteTask = (id: string) => {
  return request({
    url: `/v1/task/${id}/`,
    method: "delete"
  });
};
/**
 * 获取任务列表
 * @param params
 */

export const getResultList = (params: {
  page: number;
  pagesize: number;
  search?: string;
  taskField?: string;
  vulField?: string;
}) => {
  return request({
    url: "/v1/result/",
    method: "get",
    params
  });
};

/**
 * 删除任务
 * @param id
 */

export const deleteResult = (id: string) => {
  return request({
    url: `/v1/result/${id}/`,
    method: "delete"
  });
};
