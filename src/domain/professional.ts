import { requireValue as need, canonical } from "../../vendor/project-store.ts";
import { artifact, hash, escapeHTML, htmlPage } from "./artifact.ts";
import { ifMatch, ifAvailable, ifWalk } from "./engine.ts";
export { ifMatch, ifAvailable, ifWalk };
export function story(p: any) {
  return {
    entry_node: p.entry_node,
    variables: p.variables,
    nodes: p.nodes,
    choices: p.choices,
  };
}
export const storyHash = (p: any) => hash(canonical(story(p)));
export function validateDomain(p: any) {
  const vars = new Map<string, any>(p.variables.map((v: any) => [v.id, v])),
    nodes = new Map<string, any>(p.nodes.map((v: any) => [v.id, v]));
  need(p.entry_node === null || nodes.has(p.entry_node), "开始节点必须存在。");
  for (const v of p.variables)
    need(typeof v.initial === v.type, "变量初始值不符合声明类型。");
  for (const c of p.choices) {
    need(
      nodes.has(c.from_node) && nodes.has(c.to_node),
      "分支引用了不存在的节点。",
    );
    need(nodes.get(c.from_node).kind !== "ending", "结局不能有后续选项。");
    for (const cond of c.conditions) {
      const v = vars.get(cond.variable_id);
      need(v && typeof cond.value === v.type, "条件变量不存在或类型不匹配。");
      need(
        ["eq", "ne"].includes(cond.operator) || v.type === "number",
        "有序比较只支持数值变量。",
      );
    }
    for (const e of c.effects) {
      const v = vars.get(e.variable_id);
      need(v && typeof e.value === v.type, "状态变化变量不存在或类型不匹配。");
      need(e.operator !== "add" || v.type === "number", "累加只支持数值变量。");
    }
  }
  // 旧存档保留原叙事摘要；读取时明确拒绝套用到不同工程，不阻止作者继续修改工程。
  for (const s of p.saves)
    if (s.story_sha256 === storyHash(p)) ifWalk(p, s.choice_ids);
}
export async function checkSources(_p: any, _sources: any[], _request?: any) {}
export function pureAction(_action: string, _i: any) {
  return undefined;
}
export function graph(p: any) {
  const structural = new Set<string>(),
    pending = p.entry_node ? [p.entry_node] : [];
  while (pending.length) {
    const id = pending.pop()!;
    if (structural.has(id)) continue;
    structural.add(id);
    for (const c of p.choices.filter((c: any) => c.from_node === id))
      pending.push(c.to_node);
  }
  const reached = new Set<string>(),
    states = new Set<string>(),
    queue: string[][] = p.entry_node ? [[]] : [],
    endingRoutes: any[] = [];
  let used = 0,
    depthLimited = false;
  while (queue.length && used < 2000) {
    const route = queue.shift()!;
    if (route.length > 100) {
      depthLimited = true;
      continue;
    }
    const r = ifWalk(p, route),
      key = canonical([r.node_id, r.values]);
    if (states.has(key)) continue;
    states.add(key);
    used++;
    reached.add(r.node_id);
    if (r.ending) endingRoutes.push({ node_id: r.node_id, choice_ids: route });
    else for (const c of r.available_choices) queue.push([...route, c.id]);
  }
  const deadEnds = p.nodes
    .filter(
      (n: any) =>
        n.kind !== "ending" &&
        !p.choices.some((c: any) => c.from_node === n.id),
    )
    .map((n: any) => n.id);
  return {
    structurally_unreachable: p.nodes
      .filter((n: any) => !structural.has(n.id))
      .map((n: any) => n.id),
    not_reached_under_conditions: p.nodes
      .filter((n: any) => structural.has(n.id) && !reached.has(n.id))
      .map((n: any) => n.id),
    dead_ends: deadEnds,
    ending_routes: endingRoutes,
    explored_states: used,
    complete: queue.length === 0 && !depthLimited,
    note: "结构可达与有界状态探索分别报告；探索不完整时不能证明条件不可达。合法循环不自动判错。",
  };
}
export function playerHTML(p: any) {
  const json = JSON.stringify(story(p))
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  const script = `const p=${json},fingerprint=${JSON.stringify(storyHash(p))};const ifMatch=${ifMatch.toString()};const ifAvailable=${ifAvailable.toString()};const ifWalk=${ifWalk.toString()};let route=[];const text=document.querySelector('#text'),choices=document.querySelector('#choices'),message=document.querySelector('#message');function render(){const r=ifWalk(p,route),n=p.nodes.find(x=>x.id===r.node_id);document.querySelector('#node-title').textContent=n.title;text.textContent=n.text;choices.replaceChildren();for(const c of r.available_choices){const b=document.createElement('button');b.textContent=c.label;b.onclick=()=>{route.push(c.id);render()};choices.append(b)}document.querySelector('#ending').hidden=!r.ending;document.querySelector('#history').textContent=r.history.map(id=>p.nodes.find(n=>n.id===id).title).join(' → ')}document.querySelector('#restart').onclick=()=>{route=[];render()};document.querySelector('#save').onclick=()=>{try{localStorage.setItem('hetu-if-'+fingerprint,JSON.stringify({fingerprint,route}));message.textContent='存档已保存'}catch{message.textContent='浏览器不允许本地存档，可保留路线记录'}};document.querySelector('#load').onclick=()=>{try{const s=JSON.parse(localStorage.getItem('hetu-if-'+fingerprint));if(s?.fingerprint!==fingerprint)throw Error();ifWalk(p,s.route);route=s.route;message.textContent='已恢复存档';render()}catch{message.textContent='没有当前版本的有效存档'}};render();`;
  return htmlPage(
    p.title ?? "互动叙事",
    "<h1>" +
      escapeHTML(p.title ?? "互动叙事") +
      '</h1><h2 id="node-title"></h2><p id="text" style="white-space:pre-wrap"></p><div id="choices"></div><p id="ending" hidden>已到达结局</p><nav><button id="restart">重新开始</button><button id="save">保存存档</button><button id="load">读取存档</button></nav><p id="message" role="status"></p><details><summary>路线记录</summary><p id="history"></p></details><script>' +
      script +
      "</script>",
  );
}
export function readProfessional(
  action: string,
  p: any,
  _sources: any[],
  i: any,
  _request?: any,
) {
  if (action === "check_graph") return graph(p);
  if (action === "play_route")
    return { story_sha256: storyHash(p), ...ifWalk(p, i.choice_ids) };
  if (action === "replay_save") {
    const s = p.saves.find((s: any) => s.id === i.save_id);
    need(s, "存档不存在。");
    need(s.story_sha256 === storyHash(p), "存档版本不一致。");
    return {
      save_id: s.id,
      story_sha256: s.story_sha256,
      ...ifWalk(p, s.choice_ids),
    };
  }
  if (action === "export_player") {
    need(p.nodes.length && p.entry_node, "空工程不能交付。");
    return {
      ...artifact(playerHTML(p), p.title + ".html", "text/html", i),
      story_sha256: storyHash(p),
      checks: graph(p),
    };
  }
}
