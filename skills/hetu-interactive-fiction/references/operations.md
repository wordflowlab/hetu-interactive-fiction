# 操作地图

由正式清单生成，执行前发现当前安装版Schema。

| 动作 | 用途 | 必填参数 | 效果 |
| --- | --- | --- | --- |
| list_projects | 查找专业工程 |  | read |
| get_project | 读取固定专业工程 | object_id | read |
| save_project | 保存完整专业工程 | expected_revision, expected_sha256, operation_key, content | managed_write |
| put_variable | 维护叙事变量 | object_id, expected_revision, expected_sha256, operation_key, variable | managed_write |
| remove_variable | 移除叙事变量 | object_id, expected_revision, expected_sha256, operation_key, variable_id | managed_write |
| put_node | 维护故事节点 | object_id, expected_revision, expected_sha256, operation_key, node | managed_write |
| remove_node | 移除故事节点 | object_id, expected_revision, expected_sha256, operation_key, node_id | managed_write |
| put_choice | 维护分支选项 | object_id, expected_revision, expected_sha256, operation_key, choice | managed_write |
| remove_choice | 移除分支选项 | object_id, expected_revision, expected_sha256, operation_key, choice_id | managed_write |
| put_save | 维护工程存档 | object_id, expected_revision, expected_sha256, operation_key, save | managed_write |
| remove_save | 移除工程存档 | object_id, expected_revision, expected_sha256, operation_key, save_id | managed_write |
| check_graph | 检查分支与结局 | object_id | read |
| play_route | 确定性试玩路线 | object_id, choice_ids | read |
| replay_save | 回放固定工程存档 | object_id, save_id | read |
| export_player | 编译离线互动网页 | object_id | read |
| get_source | 读取固定来源 | object_id, source_index | read |
| get_basis | 读取固定上游专业依据 | object_id, basis_index | read |
| compare_versions | 比较专业修订 | object_id, from_revision, to_revision | read |
| export_project | 导出固定专业报告 | object_id, format | read |
| build_context | 准备有界专业上下文 | object_id, goal, max_chars | read |
| create_handoff | 生成固定专业交接 | object_id, goal | read |
| get_operation | 沿原键回读操作 | operation_key | read |
