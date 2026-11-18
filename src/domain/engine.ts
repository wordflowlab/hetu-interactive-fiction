/** 无宿主、网络和模型依赖的确定性叙事解释器；浏览器与后端共用。 */
export function ifMatch(c: any, values: Record<string, any>) {
  const left = values[c.variable_id],
    right = c.value;
  if (c.operator === "eq") return left === right;
  if (c.operator === "ne") return left !== right;
  if (typeof left !== "number" || typeof right !== "number")
    throw Error("有序比较只支持数值变量。");
  return c.operator === "gt"
    ? left > right
    : c.operator === "gte"
      ? left >= right
      : c.operator === "lt"
        ? left < right
        : left <= right;
}
export function ifAvailable(p: any, node: string, values: Record<string, any>) {
  return p.choices.filter(
    (c: any) =>
      c.from_node === node &&
      c.conditions.every((v: any) => ifMatch(v, values)),
  );
}
export function ifWalk(p: any, ids: string[]) {
  if (ids.length > 500) throw Error("路线执行超过500步。");
  const values: Record<string, any> = Object.fromEntries(
    p.variables.map((v: any) => [v.id, v.initial]),
  );
  let node = p.entry_node;
  if (!node || !p.nodes.some((n: any) => n.id === node))
    throw Error("请先设置有效开始节点。");
  const history = [node];
  for (const id of ids) {
    const current = p.nodes.find((n: any) => n.id === node);
    if (current.kind === "ending") throw Error("结局后不能继续选择。");
    const choice = ifAvailable(p, node, values).find((c: any) => c.id === id);
    if (!choice) throw Error("选项不属于当前位置或条件未满足。");
    for (const e of choice.effects) {
      values[e.variable_id] =
        e.operator === "add" ? values[e.variable_id] + e.value : e.value;
      if (
        typeof values[e.variable_id] === "number" &&
        !Number.isFinite(values[e.variable_id])
      )
        throw Error("变量超出有限数值范围。");
    }
    node = choice.to_node;
    history.push(node);
  }
  const current = p.nodes.find((n: any) => n.id === node);
  return {
    node_id: node,
    values,
    history,
    choice_ids: ids,
    ending: current.kind === "ending",
    available_choices: ifAvailable(p, node, values),
  };
}
