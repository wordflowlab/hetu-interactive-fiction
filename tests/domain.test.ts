import assert from "node:assert/strict";
import { test } from "node:test";
import {
  scenario,
  original,
  range,
  cardFile,
  cardJSON,
  wav,
  sha,
} from "./support/scenario.ts";
import {
  validateDomain,
  ifWalk,
  graph,
  storyHash,
  readProfessional,
  playerHTML,
} from "../src/domain/professional.ts";
test("完整路线确定性回放与变量变化", () => {
  const p = scenario(),
    r = ifWalk(p, ["follow", "meet"]);
  assert.equal(r.ending, true);
  assert.equal(r.values.trust, 1);
  assert.deepEqual(r, ifWalk(p, ["follow", "meet"]));
  assert.deepEqual(graph(p).ending_routes[0].choice_ids, ["follow", "meet"]);
});
test("类型错误、悬空节点、结局后选择与非法路线拒绝", () => {
  const p = scenario();
  p.variables[0].initial = "wrong";
  assert.throws(() => validateDomain(p));
  const q = scenario();
  q.choices[0].to_node = "absent";
  assert.throws(() => validateDomain(q));
  assert.throws(() => ifWalk(scenario(), ["meet"]));
  assert.throws(() => ifWalk(scenario(), ["follow", "meet", "meet"]));
});
test("结构不可达与条件未达到分别报告", () => {
  const p = scenario();
  p.nodes.push({
    id: "orphan",
    title: "未连接",
    text: "",
    kind: "ending",
    source_index: null,
  });
  p.choices[1].conditions[0].value = 2;
  const r = graph(p);
  assert.deepEqual(r.structurally_unreachable, ["orphan"]);
  assert.ok(r.not_reached_under_conditions.includes("dawn"));
});
test("合法循环允许，执行上限拒绝无限路线", () => {
  const p = scenario();
  p.choices.push({
    id: "wait",
    from_node: "mail",
    to_node: "mail",
    label: "再等一会",
    conditions: [],
    effects: [],
  });
  validateDomain(p);
  assert.equal(ifWalk(p, ["wait", "follow", "meet"]).ending, true);
  assert.throws(() => ifWalk(p, Array(501).fill("wait")));
});
test("存档固定叙事而非标题修订，旧版本不静默套用", () => {
  const p = scenario();
  p.saves = [
    {
      id: "save",
      title: "渡口",
      story_sha256: storyHash(p),
      choice_ids: ["follow"],
    },
  ];
  validateDomain(p);
  assert.equal(
    (readProfessional("replay_save", p, [], { save_id: "save" }) as any)
      .node_id,
    "quay",
  );
  p.title = "换标题";
  validateDomain(p);
  p.nodes[0].text = "修改剧情";
  assert.throws(() =>
    readProfessional("replay_save", p, [], { save_id: "save" }),
  );
});
test("离线网页转义正文与脚本结束符", () => {
  const p = scenario();
  p.nodes[0].text = "</script><script>bad()</script>";
  const out = playerHTML(p);
  assert.ok(!out.includes(p.nodes[0].text));
  assert.match(out, /保存存档/);
  assert.match(out, /localStorage/);
});
