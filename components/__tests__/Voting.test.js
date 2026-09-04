import { isSignedBallotClosable, buildCloseBallotPayload } from '../../votingBallotUtils';

describe('signed ballot helpers', () => {
  it('allows closing a signed ballot when the server says it is eligible', () => {
    const ballot = {
      status: 'publish',
      signature_required: true,
      ballot_post_id: 123,
    };

    expect(isSignedBallotClosable(ballot, { can_close_signed_ballots: true })).toBe(true);
  });

  it('blocks closing when the ballot is not publishable or not permissioned', () => {
    const ballot = {
      status: 'draft',
      signature_required: true,
      ballot_post_id: 123,
    };

    expect(isSignedBallotClosable(ballot, { can_close_signed_ballots: true })).toBe(false);
    expect(isSignedBallotClosable(ballot, { can_close_signed_ballots: false })).toBe(false);
  });

  it('builds the expected close_ballot payload for the API', () => {
    expect(buildCloseBallotPayload(123, 456, 'club-code')).toEqual({
      close_ballot: 123,
      post_id: 456,
      identifier: 'club-code',
    });
  });
});
