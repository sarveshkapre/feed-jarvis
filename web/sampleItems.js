export function buildSampleItems() {
  return [
    {
      title: "US inflation cools for second month",
      url: "https://example.com/economy/inflation-cools",
    },
    {
      title: "AI infrastructure capex rises as model demand grows",
      url: "https://example.com/ai/infra-capex",
    },
    {
      title: "Major league season update: playoff race tightens",
      url: "https://example.com/sports/playoff-race",
    },
  ];
}

export function buildSampleItemsJson() {
  return `${JSON.stringify(buildSampleItems(), null, 2)}\n`;
}
