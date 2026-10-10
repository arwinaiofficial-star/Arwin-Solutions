export type Memory = {
  id: string;
  name: string;
  relation: string;
  city: string;
  first: string;
  message: string;
  hasAudio: boolean;
  createdAt: number;
};

export const RELATIONS: [string, string][] = [
  ["Family", "కుటుంబ సభ్యులు"],
  ["Relative", "బంధువు"],
  ["Friend", "స్నేహితులు"],
  ["Neighbour", "పొరుగువారు"],
  ["Colleague", "సహోద్యోగి"],
  ["Other", "ఇతరులు"],
];

export function relationLabel(value: string) {
  const found = RELATIONS.find(([v]) => v === value);
  return found ? `${found[0]} · ${found[1]}` : value;
}
