export function isSignedBallotClosable(currentBallot, votingData) {
  return Boolean(
    currentBallot &&
    currentBallot.status === 'publish' &&
    currentBallot.signature_required &&
    currentBallot.ballot_post_id &&
    votingData &&
    votingData.can_close_signed_ballots
  );
}

export function buildCloseBallotPayload(ballotPostId, agendaPostId, identifier) {
  return {
    close_ballot: ballotPostId,
    post_id: agendaPostId,
    identifier,
  };
}
