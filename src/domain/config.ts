export const config = {
  fields: {
    variable: "variables",
    node: "nodes",
    choice: "choices",
    save: "saves",
  },
  defaults: {
    variables: [],
    nodes: [],
    choices: [],
    saves: [],
    entry_node: null,
  },
  tabs: ["故事节点", "分支检查", "路线试玩", "存档回放", "接续创作"],
} as const;
