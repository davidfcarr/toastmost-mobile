import { buildAbsencePromptConfig, normalizeAbsenceOptions } from '../../app/absencePromptUtils';

describe('planned absence prompt config', () => {
  it('includes a multi-meeting continuation action when future meetings are available', () => {
    const config = buildAbsencePromptConfig({
      upcoming: [{ label: 'June 18', value: '2026-06-18' }],
      selectedValue: '2026-06-18',
    });

    expect(config.message.toLowerCase()).toContain('more than one');
    expect(config.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: 'This meeting only', value: '' }),
        expect.objectContaining({ text: 'Until June 18', value: '2026-06-18' }),
      ])
    );
  });

  it('accepts alternate future-date payload shapes returned by the mobile agenda feed', () => {
    const options = normalizeAbsenceOptions([
      { value: '2026-06-18', label: 'June 18' },
      { value: '2026-06-25', name: 'June 25' },
      '2026-07-02',
    ]);

    expect(options).toEqual([
      { value: '2026-06-18', label: 'June 18' },
      { value: '2026-06-25', label: 'June 25' },
      { value: '2026-07-02', label: '2026-07-02' },
    ]);
  });

  it('falls back to a single-meeting action when no future meeting is selected', () => {
    const config = buildAbsencePromptConfig({ upcoming: [], selectedValue: '' });

    expect(config.title.toLowerCase()).toContain('planned absence');
    expect(config.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: 'This meeting only', value: '' }),
      ])
    );
  });
});
