import { names } from "../domain/report.ts";
const label = (v: string) => names[v] ?? v;
const node = (p: any, id: string) =>
  p.nodes?.find((v: any) => v.id === id)?.title ?? "未找到节点";
export function rowTitle(field: string, v: any, p: any): string {
  return v.title ?? v.name ?? v.source ?? v.label ?? v.marker ?? "记录";
}
export function rowContent(field: string, v: any, p: any): any {
  if (field === "saves")
    return {
      路线: v.choice_ids
        .map(
          (id: string) =>
            p.choices.find((c: any) => c.id === id)?.label ?? "未找到选项",
        )
        .join(" → "),
    };
  if (field === "variables") return { 类型: label(v.type), 初始值: v.initial };
  const { id, title, name, ...rest } = v;
  return rest;
}
export function panelContent(action: string, v: any, p: any): any {
  if (action === "check_graph")
    return {
      结构未连通: v.structurally_unreachable.map((id: string) => node(p, id)),
      条件探索未到达: v.not_reached_under_conditions.map((id: string) =>
        node(p, id),
      ),
      尚无后续: v.dead_ends.map((id: string) => node(p, id)),
      已找到的结局: v.ending_routes.map((r: any) => ({
        结局: node(p, r.node_id),
        路线: r.choice_ids.map(
          (id: string) =>
            p.choices.find((c: any) => c.id === id)?.label ?? "未找到选项",
        ),
      })),
      探索完整: v.complete,
      说明: v.note,
    };
  if (action === "replay_save")
    return {
      当前位置: node(p, v.node_id),
      经过节点: v.history.map((id: string) => node(p, id)),
      变量状态: Object.fromEntries(
        p.variables.map((x: any) => [x.title, v.values[x.id]]),
      ),
      已到结局: v.ending,
    };
  return v;
}
