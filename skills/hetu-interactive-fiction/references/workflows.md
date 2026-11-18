# 专业流程

1. 先读固定原文和现有工程，把已发生故事依据与新分支创意分开。登记variables、nodes、choices和entry_node。

2. check_graph 分别查看结构未连通、条件探索未到达、死路和可达结局。探索最多2000状态和100层，complete=false时不能宣称某条件永远不可达。

3. 用 play_route 提交明确选项序列，读取节点、变量和可选路线；不由GUI另写一套解释器。合法循环允许，路线执行必须有界。

4. 保存路线时先取 play_route 返回的story_sha256，再 put_save。用 replay_save 重演；旧存档摘要不同则保留旧存档并明确读取旧工程，不能套到新故事。

5. export_player 重组完整HTML，实际点击选择、保存、重载及读取存档。准备续写时把选定路线文本和工程固定引用交给宿主候选任务，作者决定采纳。

## 发现、保存与接续

先读本包Skill及operations，再从实际Schema组装输入。新建预期修订为0；已有工程先读get_project，再提交expected_revision、expected_sha256与原operation_key。保存后get_project回读固定成果。使用get_basis/get_source读取确切依据，build_context控制上下文预算且披露省略，create_handoff固定专业引用。

停用或升级后重新发现。响应未知先get_operation；明确not_found才沿原输入原键恢复。作者在GUI修改导致CAS冲突时保留自己的输入，读取新基线并比较，不覆盖作者新稿。

跨插件接续使用固定basis_refs；上游新修订不会改写旧依据。专业状态、解析成功、文件解码及自动检查均不等于内容认可、正式设定、正文采纳或定稿。
