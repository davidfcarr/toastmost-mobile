export function normalizeAbsenceOptions(upcoming = []) {
  if (!Array.isArray(upcoming)) {
    return [];
  }

  return upcoming
    .map((item) => {
      if (!item) {
        return null;
      }

      const value = typeof item === 'string' || typeof item === 'number'
        ? String(item)
        : item.value;
      const label = typeof item === 'string' || typeof item === 'number'
        ? String(item)
        : (item.label || item.name || item.value || 'Meeting');

      if (!value) {
        return null;
      }

      return { value: String(value), label: String(label) };
    })
    .filter(Boolean);
}

export function buildAbsencePromptConfig({ upcoming = [], selectedValue = '' } = {}) {
  const options = normalizeAbsenceOptions(upcoming);
  const selected = options.find((item) => String(item.value) === String(selectedValue));
  const primaryAction = { text: 'This meeting only', value: '' };
  const followupAction = selected
    ? { text: `Until ${selected.label}`, value: selected.value }
    : options[0]
      ? { text: `Until ${options[0].label}`, value: options[0].value }
      : null;

  return {
    title: 'Planned absence',
    message: 'Do you want this absence to apply to more than one date?',
    actions: [primaryAction, ...(followupAction ? [followupAction] : [])],
  };
}
